from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.gemini_client import evaluate_interview_answer, synthesize_interview_feedback, generate_interview_questions

router = APIRouter(prefix="/api/ai/interview", tags=["Interview AI"])

class AnswerEvaluationRequest(BaseModel):
    questionText: Optional[str] = None
    questionId: Optional[str] = None
    roleId: Optional[str] = None
    roleTitle: Optional[str] = "Software Engineer"
    criteria: Optional[List[str]] = None
    answerText: str

class FeedbackSynthesisRequest(BaseModel):
    sessionId: str
    roleTitle: str
    answers: List[Dict[str, Any]] = []

class QuestionGenerationRequest(BaseModel):
    roleTitle: str = "Frontend Developer"
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 4

@router.post("/evaluate-answer")
async def evaluate_answer(payload: AnswerEvaluationRequest):
    if not payload.answerText.strip():
        return {
            "score": 0,
            "feedback": "No response provided. Candidate should formulate an answer using the STAR methodology.",
            "aiFeedback": "No response provided. Candidate should formulate an answer using the STAR methodology.",
            "strengths": [],
            "improvements": ["Provide a detailed answer with examples and technical rationale."],
            "sampleAnswer": "A strong answer addresses problem context, implementation details, and outcomes."
        }
    
    question = payload.questionText
    if not question:
        if payload.questionId:
            question = f"Interview question for {payload.roleTitle or payload.roleId} (Ref: {payload.questionId})"
        else:
            question = f"Technical assessment question for {payload.roleTitle or 'Software Engineer'}"

    result = evaluate_interview_answer(
        question_text=question,
        answer_text=payload.answerText,
        role_title=payload.roleTitle or payload.roleId or "Software Engineer",
        evaluation_criteria=payload.criteria
    )
    # Ensure both feedback and aiFeedback keys are present for frontend compatibility
    if "aiFeedback" in result and "feedback" not in result:
        result["feedback"] = result["aiFeedback"]
    elif "feedback" in result and "aiFeedback" not in result:
        result["aiFeedback"] = result["feedback"]

    return result

@router.post("/synthesize-feedback")
async def synthesize_feedback(payload: FeedbackSynthesisRequest):
    return synthesize_interview_feedback(
        role_title=payload.roleTitle,
        answers=payload.answers,
        session_id=payload.sessionId
    )

@router.post("/generate-questions")
async def generate_questions(payload: QuestionGenerationRequest):
    return generate_interview_questions(
        role_title=payload.roleTitle,
        difficulty=payload.difficulty or "Medium",
        count=payload.count or 4
    )

