# AI Microservice — AI Interview Preparation Platform

Dedicated Python & FastAPI microservice providing Google Gemini GenAI services:
- **Resume ATS Analyzer**: Extracts keywords, evaluates against target role & job descriptions, scores matching percentages, identifies missing skills.
- **AI Mock Interview Coach**: Real-time evaluation of candidate audio transcripts/text answers using STAR methodology, scores clarity/technical depth, and synthesizes multi-dimensional feedback.
- **AI Coding Assistant**: Code reviews, Big-O complexity analysis, and edge case hinting.

---

## Setup & Running

### 1. Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
# Add your GEMINI_API_KEY in .env (if not set, intelligent fallback engine runs automatically)
```

### 3. Run the Microservice
```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The AI service starts at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.
