import sys
import io
import time
import json
import traceback
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Any
from services.gemini_client import review_code_solution

router = APIRouter(prefix="/api/ai/coding", tags=["Coding AI Assistant"])

class CodeReviewRequest(BaseModel):
    code: str
    language: str = "java"
    problemTitle: Optional[str] = "Coding Challenge"

class TestCaseItem(BaseModel):
    id: Optional[Any] = 1
    inputStr: Optional[str] = ""
    expectedStr: Optional[str] = ""
    params: Optional[list] = []
    expectedVal: Optional[Any] = None

class CodeExecutePayload(BaseModel):
    code: str
    language: str = "python"
    fnName: Optional[str] = None
    testCases: list[TestCaseItem] = []

@router.post("/review")
async def review_code(payload: CodeReviewRequest):
    return review_code_solution(
        code=payload.code,
        language=payload.language,
        problem_title=payload.problemTitle or "Coding Challenge"
    )

@router.post("/execute")
async def execute_code(payload: CodeExecutePayload):
    code = payload.code.strip()
    fn_name = payload.fnName or "solve"
    test_cases = payload.testCases

    # Check for empty code or unedited stub
    if not code or len(code) < 10:
        return {
            "status": "COMPILE_ERROR",
            "runtimeMs": 0,
            "memoryMb": 18,
            "passedTests": 0,
            "totalTests": len(test_cases),
            "outputLogs": ["Empty code. Please write your Python solution."],
            "errorMessage": "No code provided.",
            "testCaseResults": [
                {
                    "id": tc.id,
                    "inputStr": tc.inputStr,
                    "expectedStr": tc.expectedStr,
                    "actualStr": "No code provided",
                    "passed": False,
                    "logs": []
                } for tc in test_cases
            ]
        }

    # Redirect stdout and stderr to capture student print statements and calculations
    stdout_capture = io.StringIO()
    old_stdout = sys.stdout

    local_scope = {}
    start_time = time.perf_counter()

    try:
        sys.stdout = stdout_capture
        # Execute the user's script
        exec(code, local_scope, local_scope)
    except SyntaxError as se:
        sys.stdout = old_stdout
        return {
            "status": "COMPILE_ERROR",
            "runtimeMs": 4,
            "memoryMb": 18,
            "passedTests": 0,
            "totalTests": len(test_cases),
            "outputLogs": [f"SyntaxError on line {se.lineno}: {se.msg}"],
            "errorMessage": f"SyntaxError on line {se.lineno}: {se.msg}",
            "errorLineNumber": se.lineno,
            "testCaseResults": []
        }
    except Exception as e:
        sys.stdout = old_stdout
        err_msg = traceback.format_exc()
        return {
            "status": "RUNTIME_ERROR",
            "runtimeMs": 6,
            "memoryMb": 18,
            "passedTests": 0,
            "totalTests": len(test_cases),
            "outputLogs": [err_msg],
            "errorMessage": str(e),
            "testCaseResults": []
        }
    finally:
        sys.stdout = old_stdout

    global_prints = stdout_capture.getvalue().splitlines()

    # Find the target function or method
    target_fn = None
    if fn_name in local_scope and callable(local_scope[fn_name]):
        target_fn = local_scope[fn_name]
    elif "Solution" in local_scope:
        sol_class = local_scope["Solution"]
        if isinstance(sol_class, type):
            sol_instance = sol_class()
            if hasattr(sol_instance, fn_name):
                target_fn = getattr(sol_instance, fn_name)
            else:
                for attr_name in dir(sol_instance):
                    if not attr_name.startswith("_") and callable(getattr(sol_instance, attr_name)):
                        target_fn = getattr(sol_instance, attr_name)
                        break

    if not target_fn:
        # Check if there is any callable function defined in local_scope
        for k, v in local_scope.items():
            if callable(v) and not k.startswith("__"):
                target_fn = v
                break

    if not target_fn:
        return {
            "status": "COMPILE_ERROR",
            "runtimeMs": 8,
            "memoryMb": 18,
            "passedTests": 0,
            "totalTests": len(test_cases),
            "outputLogs": global_prints + [f"Error: Function '{fn_name}' or class Solution not found in your code."],
            "errorMessage": f"Function '{fn_name}' is not defined. Please implement the required function.",
            "testCaseResults": []
        }

    # Now execute test cases against target_fn
    results = []
    passed_count = 0
    all_logs = list(global_prints)

    for i, tc in enumerate(test_cases):
        tc_stdout = io.StringIO()
        tc_start = time.perf_counter()
        tc_logs = []
        actual_val = None
        passed = False
        error_msg = None

        try:
            sys.stdout = tc_stdout
            params = tc.params if tc.params is not None else []
            actual_val = target_fn(*params)
        except Exception as ex:
            error_msg = str(ex)
        finally:
            sys.stdout = old_stdout

        tc_end = time.perf_counter()
        tc_runtime = round((tc_end - tc_start) * 1000, 2)
        tc_logs = tc_stdout.getvalue().splitlines()
        for l in tc_logs:
            all_logs.append(f"[Case {i+1}] {l}")

        # Check equality with expectedVal
        if error_msg:
            passed = False
            actual_str = f"RuntimeError: {error_msg}"
        else:
            try:
                actual_str = json.dumps(actual_val) if actual_val is not None else "None"
            except Exception:
                actual_str = str(actual_val)

            exp = tc.expectedVal
            if exp is not None:
                passed = (actual_val == exp) or (actual_str == json.dumps(exp))
            else:
                passed = (actual_str == tc.expectedStr)

        if passed:
            passed_count += 1

        results.append({
            "id": tc.id or (i + 1),
            "inputStr": tc.inputStr,
            "expectedStr": tc.expectedStr or json.dumps(tc.expectedVal),
            "actualStr": actual_str,
            "passed": passed,
            "runtimeMs": tc_runtime,
            "logs": tc_logs
        })

    end_time = time.perf_counter()
    total_runtime = max(1, round((end_time - start_time) * 1000))
    all_passed = (passed_count == len(test_cases)) and len(test_cases) > 0

    return {
        "status": "ACCEPTED" if all_passed else "WRONG_ANSWER",
        "runtimeMs": total_runtime,
        "memoryMb": 22,
        "passedTests": passed_count,
        "totalTests": len(test_cases),
        "outputLogs": all_logs if all_logs else [f"Executed {len(test_cases)} test cases in Python."],
        "testCaseResults": results
    }
