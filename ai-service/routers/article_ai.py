from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.gemini_client import generate_placement_article

router = APIRouter(prefix="/api/ai/article", tags=["Article AI Generator"])

class ArticleGenerateRequest(BaseModel):
    topic: str
    domain: str = "Backend & Systems"
    targetRole: str = "Software Engineer"

@router.post("/generate")
async def generate_article(payload: ArticleGenerateRequest):
    data = generate_placement_article(
        topic=payload.topic,
        domain=payload.domain,
        target_role=payload.targetRole
    )
    return data
