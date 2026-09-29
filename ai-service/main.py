import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import PORT, HOST
from routers import resume_ats, interview_ai, coding_ai

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_service")

app = FastAPI(
    title="AI Interview Preparation Platform - AI Microservice",
    description="Dedicated microservice for Google Gemini ATS Resume Parsing, Mock Interview Evaluation, and Code Review",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_ats.router)
app.include_router(interview_ai.router)
app.include_router(coding_ai.router)

@app.get("/")
def root():
    return {
        "service": "AI Interview Preparation Platform - AI Microservice",
        "status": "UP",
        "endpoints": [
            "/api/ai/resume/analyze",
            "/api/ai/interview/evaluate-answer",
            "/api/ai/interview/synthesize-feedback",
            "/api/ai/coding/review"
        ]
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "service": "ai-service"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting AI Microservice on %s:%s", HOST, PORT)
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
