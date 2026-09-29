from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.gemini_client import evaluate_interview_answer, synthesize_interview_feedback

router = APIRouter(prefix="/api/ai/interview", tags=["Interview AI"])

class AnswerEvaluationRequest(BaseModel):
    questionText: str
    answerText: str
    roleTitle: Optional[str] = "Software Engineer"
    criteria: Optional[List[str]] = None

class FeedbackSynthesisRequest(BaseModel):
    sessionId: str
    roleTitle: str
    answers: List[Dict[str, Any]] = []

@router.post("/evaluate-answer")
async def evaluate_answer(payload: AnswerEvaluationRequest):
    if not payload.answerText.strip():
        return {
            "score": 0,
            "aiFeedback": "No response provided. Candidate should formulate an answer using the STAR methodology.",
            "strengths": [],
            "improvements": ["Provide a detailed answer with examples and technical rationale."],
            "sampleAnswer": "A strong answer addresses problem context, implementation details, and outcomes."
        }
    
    return evaluate_interview_answer(
        question_text=payload.questionText,
        answer_text=payload.answerText,
        role_title=payload.roleTitle or "Software Engineer",
        evaluation_criteria=payload.criteria
    )

@router.post("/synthesize-feedback")
async def synthesize_feedback(payload: FeedbackSynthesisRequest):
    return synthesize_interview_feedback(
        role_title=payload.roleTitle,
        answers=payload.answers,
        session_id=payload.sessionId
    )
