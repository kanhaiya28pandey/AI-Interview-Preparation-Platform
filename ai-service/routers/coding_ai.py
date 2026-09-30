from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.gemini_client import review_code_solution

router = APIRouter(prefix="/api/ai/coding", tags=["Coding AI Assistant"])

class CodeReviewRequest(BaseModel):
    code: str
    language: str = "java"
    problemTitle: Optional[str] = "Coding Challenge"

@router.post("/review")
async def review_code(payload: CodeReviewRequest):
    return review_code_solution(
        code=payload.code,
        language=payload.language,
        problem_title=payload.problemTitle or "Coding Challenge"
    )
