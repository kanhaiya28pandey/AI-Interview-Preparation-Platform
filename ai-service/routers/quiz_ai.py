from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.gemini_client import generate_mcq_quiz_questions

router = APIRouter(prefix="/api/ai/quiz", tags=["Quiz AI Generator"])

class QuizGenerateRequest(BaseModel):
    domain: str
    topics: List[str] = []
    difficulty: str = "Medium"
    questionCount: int = 5

@router.post("/generate")
async def generate_quiz(payload: QuizGenerateRequest):
    questions = generate_mcq_quiz_questions(
        domain=payload.domain,
        topics=payload.topics,
        difficulty=payload.difficulty,
        count=payload.questionCount
    )
    return {"questions": questions}
