from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from services.gemini_client import analyze_resume_ats

router = APIRouter(prefix="/api/ai/resume", tags=["Resume ATS AI"])

class ResumeAnalysisRequest(BaseModel):
    resumeText: str = Field(..., description="Extracted resume text content")
    role: Optional[str] = "Frontend Developer"
    field: Optional[str] = "IT Services"
    jobDescription: Optional[str] = None

@router.post("/analyze")
async def analyze_resume(payload: ResumeAnalysisRequest):
    if not payload.resumeText.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be blank")
    
    result = analyze_resume_ats(
        resume_text=payload.resumeText,
        role=payload.role or "Frontend Developer",
        field=payload.field or "IT Services",
        job_description=payload.jobDescription
    )
    return result
