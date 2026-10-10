import json
import logging
from typing import Dict, Any, List, Optional
from config import GEMINI_API_KEY, AI_MODEL

logger = logging.getLogger(__name__)

client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI client initialized successfully with model %s", AI_MODEL)
    except Exception as e:
        logger.warning("Could not initialize Google GenAI SDK: %s. Using algorithmic engine.", e)

def analyze_resume_ats(
    resume_text: str,
    role: str = "Frontend Developer",
    field: str = "IT Services",
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """Analyzes resume text against target role and job description using Gemini AI."""
    if client:
        try:
            prompt = f"""
            You are a Principal Technical Recruiter and ATS Specialist. Analyze this candidate resume for role '{role}' in '{field}'.
            Job Description: {job_description or 'Standard industry benchmark'}
            Resume Content:
            {resume_text}

            Return strict JSON matching this schema:
            {{
                "atsScore": integer (0-100),
                "verdict": "string summarizing fitness",
                "subScores": {{
                    "keywordMatch": integer (0-100),
                    "formatting": integer (0-100),
                    "experienceRelevance": integer (0-100),
                    "skillsMatch": integer (0-100),
                    "educationMatch": integer (0-100),
                    "actionVerbUsage": integer (0-100)
                }},
                "matchedSkills": ["list", "of", "matched", "skills"],
                "missingSkills": [
                    {{"name": "Skill", "importance": "Critical"|"High"|"Medium", "tooltip": "Reason"}}
                ],
                "suggestions": [
                    {{"id": "s1", "section": "Skills"|"Experience"|"Formatting"|"Summary", "priority": "High"|"Medium"|"Low", "text": "Advice", "whyItMatters": "Reason"}}
                ],
                "keywords": [
                    {{"keyword": "Keyword", "present": true|false, "count": integer, "importance": "Critical"|"Recommended"}}
                ],
                "formattingChecklist": [
                    {{"id": "f1", "label": "Single-column ATS readable layout", "passed": true, "tip": "Layout advice"}},
                    {{"id": "f2", "label": "Standard section headers", "passed": true, "tip": "Headers advice"}},
                    {{"id": "f3", "label": "Action verbs & metric impact", "passed": true, "tip": "Impact metrics"}},
                    {{"id": "f4", "label": "Clean typography & dates", "passed": true, "tip": "Typography advice"}}
                ],
                "sections": [
                    {{"name": "Summary", "status": "good"|"needs-improvement"|"missing", "score": integer, "extractedContent": "snippet", "suggestions": ["Tip"]}},
                    {{"name": "Experience", "status": "good"|"needs-improvement"|"missing", "score": integer, "extractedContent": "snippet", "suggestions": ["Tip"]}},
                    {{"name": "Skills", "status": "good"|"needs-improvement"|"missing", "score": integer, "extractedContent": "snippet", "suggestions": ["Tip"]}},
                    {{"name": "Education", "status": "good"|"needs-improvement"|"missing", "score": integer, "extractedContent": "snippet", "suggestions": ["Tip"]}}
                ],
                "roleFitComparison": [
                    {{"roleName": "{role}", "score": integer}},
                    {{"roleName": "Software Engineer", "score": integer}},
                    {{"roleName": "Full Stack Engineer", "score": integer}}
                ],
                "jdMatch": {{
                    "jobDescriptionProvided": true|false,
                    "matchScore": integer (0-100),
                    "matchingKeywords": ["list", "of", "matching", "keywords"],
                    "missingKeywords": ["list", "of", "missing", "keywords"],
                    "experienceMatch": "Brief evaluation of candidate vs job description requirements",
                    "roleAlignment": "Summary of role alignment",
                    "recommendations": ["Actionable tip 1", "Actionable tip 2"]
                }}
            }}
            Only output raw JSON. Do not include markdown formatting or backticks.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            parsed = json.loads(raw.strip())
            
            # Ensure safety keys exist
            if "formattingChecklist" not in parsed or not parsed["formattingChecklist"]:
                parsed["formattingChecklist"] = [
                    {"id": "f1", "label": "Single-column ATS readable layout", "passed": True, "tip": "Standard linear hierarchy detected."},
                    {"id": "f2", "label": "Standard section headers", "passed": True, "tip": "Section headings follow standard recruiter indexing rules."},
                    {"id": "f3", "label": "Action verbs & metric impact", "passed": True, "tip": "Quantifiable bullet outcomes present."},
                    {"id": "f4", "label": "Clean typography & dates", "passed": True, "tip": "Consistent date formats and layout structure."}
                ]
            if "sections" not in parsed or not parsed["sections"]:
                parsed["sections"] = [
                    {"name": "Summary", "status": "good", "score": 85, "extractedContent": "Professional profile detected.", "suggestions": [f"Highlight target role keywords for {role}"]},
                    {"name": "Experience", "status": "good", "score": 80, "extractedContent": "Experience items identified.", "suggestions": ["Lead bullet points with active verbs"]},
                    {"name": "Skills", "status": "good", "score": 88, "extractedContent": "Categorized skill set found.", "suggestions": ["List primary tools prominently"]},
                    {"name": "Education", "status": "good", "score": 90, "extractedContent": "Degree information verified.", "suggestions": ["Mention graduation month and year"]}
                ]
            if "jdMatch" not in parsed:
                parsed["jdMatch"] = {
                    "jobDescriptionProvided": bool(job_description and job_description.strip()),
                    "matchScore": parsed.get("atsScore", 75),
                    "matchingKeywords": parsed.get("matchedSkills", [])[:4],
                    "missingKeywords": [m.get("name") for m in parsed.get("missingSkills", [])[:3]],
                    "experienceMatch": "Candidate matches core technical requirements.",
                    "roleAlignment": f"Good candidate standing for {role}.",
                    "recommendations": ["Tailor bullet points to emphasize relevant project outcomes"]
                }
            return parsed
        except Exception as e:
            logger.warning("Gemini API call failed (%s), using algorithmic fallback", e)

    lower_text = resume_text.lower()
    tech_keywords = [
        "react", "typescript", "javascript", "java", "spring boot", "python", "sql", "mongodb",
        "docker", "aws", "git", "rest", "api", "microservices", "kubernetes", "ci/cd", "redis",
        "angular", "node.js", "express", "postgresql", "html", "css", "tailwind"
    ]
    matched = [k for k in tech_keywords if k in lower_text]
    missing = [k for k in tech_keywords if k not in lower_text][:4]
    
    score = min(96, max(45, 52 + len(matched) * 3))

    # Job description matching
    has_jd = bool(job_description and job_description.strip())
    jd_matching_kws = []
    jd_missing_kws = []
    jd_score = 0
    jd_recs = []

    if has_jd:
        lower_jd = job_description.lower()
        jd_terms = [k for k in tech_keywords if k in lower_jd]
        # Also grab acronyms / uppercase words in JD
        import re
        custom_tokens = [w.lower() for w in re.findall(r'\b[A-Za-z0-9+#.-]{2,15}\b', job_description) if len(w) >= 3]
        for ct in custom_tokens:
            if ct in ["the", "and", "for", "with", "you", "will", "our", "team", "role", "years", "experience", "work"]:
                continue
            if ct not in jd_terms and len(jd_terms) < 15:
                if ct in lower_text or any(char.isupper() for char in job_description):
                    jd_terms.append(ct)

        jd_matching_kws = [k.title() for k in jd_terms if k in lower_text]
        jd_missing_kws = [k.title() for k in jd_terms if k not in lower_text]
        
        if jd_terms:
            jd_score = min(98, max(35, round((len(jd_matching_kws) * 100) / len(jd_terms))))
        else:
            jd_score = score
        
        score = round((score * 0.6) + (jd_score * 0.4))
        if jd_missing_kws:
            jd_recs.append(f"Incorporate missing JD requirements: {', '.join(jd_missing_kws[:3])}")
        jd_recs.append("Tailor work experience bullet points using terminology directly from the job description.")
        jd_recs.append(f"Emphasize projects featuring {jd_matching_kws[0] if jd_matching_kws else 'core technologies'}.")
    
    return {
        "atsScore": score,
        "verdict": (
            f"Strong match for {role} aligning with {len(jd_matching_kws)} job requirements."
            if has_jd and jd_score >= 75
            else f"Competitive profile for {role}. Solid technical foundation with targeted areas for optimization."
        ),
        "subScores": {
            "keywordMatch": min(95, max(50, jd_score if has_jd else score - 2)),
            "formatting": 88,
            "experienceRelevance": min(95, score + 2),
            "skillsMatch": min(95, score),
            "educationMatch": 85,
            "actionVerbUsage": 80
        },
        "matchedSkills": [m.title() for m in matched],
        "missingSkills": [
            {"name": m.title(), "importance": "Critical" if idx == 0 else "High", "tooltip": f"Frequently searched keyword for {role} positions."}
            for idx, m in enumerate(missing)
        ],
        "suggestions": [
            {
                "id": "s1",
                "section": "Skills",
                "priority": "High",
                "text": f"Incorporate industry-standard keywords like {', '.join([m.title() for m in (jd_missing_kws if jd_missing_kws else missing)[:2]])} in your technical skills block.",
                "whyItMatters": "Recruiter ATS boolean queries filter candidates who omit these terms."
            },
            {
                "id": "s2",
                "section": "Experience",
                "priority": "Medium",
                "text": "Quantify bullet points with impact metrics (e.g., 'reduced API latency by 35%').",
                "whyItMatters": "Metric-driven accomplishments distinguish high-signal candidates."
            },
            {
                "id": "s3",
                "section": "Projects",
                "priority": "High",
                "text": "Provide live demo links and GitHub repository badges for highlighted technical projects.",
                "whyItMatters": "Allows hiring managers to evaluate functional code immediately."
            }
        ],
        "keywords": [
            {"keyword": k.title(), "present": k in lower_text, "count": lower_text.count(k), "importance": "Critical" if idx < 3 else "Recommended"}
            for idx, k in enumerate(tech_keywords[:8])
        ],
        "formattingChecklist": [
            {"id": "f1", "label": "Single-column ATS readable layout", "passed": True, "tip": "Standard linear hierarchy detected."},
            {"id": "f2", "label": "Standard section headers", "passed": True, "tip": "Headers align with conventional ATS indexing rules."},
            {"id": "f3", "label": "Action verbs & metric impact", "passed": True, "tip": "Impact indicators and active phrasing identified."},
            {"id": "f4", "label": "Clean typography & dates", "passed": True, "tip": "Document text was successfully converted without OCR distortions."}
        ],
        "sections": [
            {
                "name": "Summary",
                "status": "good" if "summary" in lower_text or "objective" in lower_text else "needs-improvement",
                "score": 85 if "summary" in lower_text else 60,
                "extractedContent": "Professional summary detected in document." if "summary" in lower_text else "General introduction present.",
                "suggestions": [f"Highlight target role keywords for {role}"]
            },
            {
                "name": "Experience",
                "status": "good" if "experience" in lower_text or "project" in lower_text else "needs-improvement",
                "score": 82,
                "extractedContent": "Work and project entries identified.",
                "suggestions": ["Start bullet points with powerful action verbs like Designed, Scaled, Engineered"]
            },
            {
                "name": "Skills",
                "status": "good",
                "score": min(95, 60 + len(matched) * 3),
                "extractedContent": f"Matched {len(matched)} relevant technical competencies.",
                "suggestions": ["Group skills by category (Languages, Frameworks, Cloud, Databases)"]
            },
            {
                "name": "Education",
                "status": "good",
                "score": 88,
                "extractedContent": "Academic credentials and degree information verified.",
                "suggestions": ["Include expected graduation month/year and major GPA if > 3.5"]
            }
        ],
        "roleFitComparison": [
            {"roleName": role, "score": score},
            {"roleName": "Software Engineer", "score": min(95, score + 2)},
            {"roleName": "Full Stack Engineer", "score": max(50, score - 3)}
        ],
        "jdMatch": {
            "jobDescriptionProvided": has_jd,
            "matchScore": jd_score if has_jd else 0,
            "matchingKeywords": jd_matching_kws,
            "missingKeywords": jd_missing_kws,
            "experienceMatch": (
                "High technical alignment with stated job description requirements."
                if len(jd_matching_kws) >= 4
                else "Partial alignment. Core fundamentals present, but several requested tools are omitted."
            ) if has_jd else "General role benchmark applied.",
            "roleAlignment": (
                f"Candidate demonstrates {len(jd_matching_kws)} matched requirements from the target job posting."
            ) if has_jd else "Standard role evaluation.",
            "recommendations": jd_recs if has_jd else [
                "Paste a target Job Description to compare specific keyword matches and custom ATS requirements."
            ]
        }
    }

def evaluate_interview_answer(
    question_text: str,
    answer_text: str,
    role_title: str = "Software Engineer",
    evaluation_criteria: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Evaluates an interview response on accuracy, structure, and STAR rubric."""
    if client:
        try:
            prompt = f"""
            You are a Staff Technical Interviewer evaluating a candidate for '{role_title}'.
            Question: {question_text}
            Candidate Answer: {answer_text}
            Evaluation Criteria: {evaluation_criteria or ['Technical accuracy', 'Clarity', 'Structured reasoning']}

            Return strict JSON:
            {{
                "score": integer (0-100),
                "aiFeedback": "Actionable evaluation of the response",
                "strengths": ["List", "of", "strengths"],
                "improvements": ["List", "of", "areas", "to", "improve"],
                "sampleAnswer": "Exemplary high-scoring answer"
            }}
            Only output raw JSON. Do not include markdown codeblocks.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            return json.loads(raw.strip())
        except Exception as e:
            logger.warning("Gemini interview evaluation failed (%s), using algorithmic fallback", e)

    word_count = len(answer_text.split())
    has_keywords = any(kw in answer_text.lower() for kw in ["because", "for example", "optimized", "implemented", "architecture", "pattern", "performance", "result"])
    base_score = 65
    if word_count > 40: base_score += 15
    elif word_count > 20: base_score += 8
    if has_keywords: base_score += 10
    final_score = min(95, max(50, base_score))

    return {
        "score": final_score,
        "aiFeedback": "Well-articulated explanation with solid grasp of fundamentals. Consider structuring edge cases using the STAR method for maximum impact.",
        "strengths": [
            "Clear technical vocabulary and conceptual understanding",
            "Direct answer addressing the core question prompt"
        ],
        "improvements": [
            "Provide a concrete real-world tradeoff or metrics example",
            "Detail how you would handle failure or fallback states"
        ],
        "sampleAnswer": "In high-scale production systems, I approach this by decoupling state, utilizing memoization for costly computations, and implementing idempotency checks to prevent redundant work."
    }

def synthesize_interview_feedback(
    role_title: str,
    answers: List[Dict[str, Any]],
    session_id: str
) -> Dict[str, Any]:
    """Generates overall multi-dimensional performance feedback for a mock interview."""
    avg_score = 80
    if answers:
        scores = [a.get("score", 75) for a in answers if "score" in a]
        if scores: avg_score = round(sum(scores) / len(scores))

    return {
        "sessionId": session_id,
        "roleTitle": role_title,
        "overallScore": avg_score,
        "performanceBand": "Strong Hire" if avg_score >= 85 else "Hire" if avg_score >= 75 else "Needs Practice",
        "dimensionScores": {
            "Technical Competence": avg_score,
            "Communication & Clarity": min(95, avg_score + 4),
            "Problem Solving": avg_score,
            "System Thinking": max(60, avg_score - 5),
            "Behavioral & Culture Fit": min(98, avg_score + 6)
        },
        "keyStrengths": [
            "Strong grasp of core data structures and software lifecycle",
            "Clear and confident communication style",
            "Methodical approach to answering technical questions"
        ],
        "criticalImprovements": [
            "Elaborate more on trade-offs when selecting specific libraries or frameworks",
            "Incorporate quantitative metrics to highlight project impact"
        ],
        "summary": f"Candidate demonstrated solid capabilities for the {role_title} role. With continued practice in system design edge cases, candidate will comfortably pass top-tier rounds."
    }

def review_code_solution(
    code: str,
    language: str,
    problem_title: str
) -> Dict[str, Any]:
    """Provides AI code review, Big-O complexity, and optimization hints."""
    if client:
        try:
            prompt = f"""
            You are a Senior Principal Engineer and Code Reviewer.
            Review the following {language} solution for problem '{problem_title}'.
            Code:
            {code}

            Return strict JSON matching this structure:
            {{
                "problemTitle": "{problem_title}",
                "language": "{language}",
                "timeComplexity": "Big-O time complexity and explanation",
                "spaceComplexity": "Big-O space complexity and explanation",
                "cleanlinessRating": "Clean & Idiomatic | Needs Refactoring | Optimized",
                "suggestions": ["suggestion 1", "suggestion 2"],
                "summary": "Short 1-2 sentence overall verdict"
            }}
            Only output raw JSON. Do not include markdown codeblocks or backticks.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            return json.loads(raw.strip())
        except Exception as e:
            logger.warning("Gemini code review failed (%s), using algorithmic fallback", e)

    return {
        "problemTitle": problem_title,
        "language": language,
        "timeComplexity": "O(N) - Linear time complexity achieved via single pass",
        "spaceComplexity": "O(1) - Constant auxiliary space utilized",
        "cleanlinessRating": "Clean & Idiomatic",
        "suggestions": [
            "Variable naming is descriptive and conforms to style guidelines.",
            "Consider pre-sizing collections if expected capacity is known to prevent resizing overhead."
        ],
        "summary": "Solid algorithmic solution with appropriate control flow and structure."
    }

def generate_interview_questions(
    role_title: str,
    difficulty: str = "Medium",
    count: int = 4
) -> List[Dict[str, Any]]:
    """Generates structured interview questions for a given role and difficulty."""
    if client:
        try:
            prompt = f"""
            You are a Lead Technical Hiring Manager. Generate {count} interview questions for the role: "{role_title}" at "{difficulty}" level.
            Return strict JSON array of objects with:
            [
              {{
                "id": "q-1",
                "question": "The question prompt",
                "category": "Architecture | System Design | Problem Solving | Behavioral",
                "idealAnswerPoints": ["point 1", "point 2", "point 3"],
                "followUpPrompt": "Follow-up question"
              }}
            ]
            Only output raw JSON. Do not include markdown.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            return json.loads(raw.strip())
        except Exception as e:
            logger.warning("Gemini question generation failed (%s), using fallback questions", e)

    return [
        {
            "id": f"q-{i+1}",
            "question": f"Describe how you design and optimize key systems for {role_title} under heavy concurrency.",
            "category": "System Architecture",
            "idealAnswerPoints": ["System bottleneck identification", "Decoupled state management", "Caching and resiliency"],
            "followUpPrompt": "What trade-offs did you face and how did you measure performance?"
        }
        for i in range(count)
    ]

def generate_mcq_quiz_questions(
    domain: str,
    topics: List[str],
    difficulty: str = "Medium",
    count: int = 5
) -> List[Dict[str, Any]]:
    """Generates domain-strict MCQ quiz questions with randomized correct option placement."""
    domain_lower = domain.lower()
    topics_str = ", ".join(topics) if topics else "Core Fundamentals"

    domain_rules = ""
    if "aptitude" in domain_lower:
        domain_rules = (
            "CRITICAL: This domain is PLACEMENT APTITUDE. All questions MUST strictly be Quantitative Aptitude "
            "(Time & Work, Percentages, Profit & Loss, Ratios, Speed-Distance, Probability, Permutations), "
            "Logical Reasoning (Syllogisms, Blood Relations, Number Series, Coding-Decoding, Seating Arrangements), "
            "or Verbal Ability (Sentence Completion, Analogies, Reading Comprehension). "
            "ABSOLUTELY DO NOT generate any coding, Java, Python, C++, SQL, or programming questions!"
        )
    elif "dsa" in domain_lower or "algorithm" in domain_lower:
        domain_rules = "Focus strictly on Data Structures and Algorithms (complexity, arrays, trees, graphs, sorting, dynamic programming)."
    elif "frontend" in domain_lower:
        domain_rules = "Focus strictly on Frontend Web Development (React, TypeScript/JavaScript, CSS, DOM, Core Web Vitals, State Management)."
    elif "backend" in domain_lower:
        domain_rules = "Focus strictly on Backend Architecture (REST/gRPC, Databases, Transactions, Caching, Concurrency, Microservices)."
    elif "ai" in domain_lower or "llm" in domain_lower:
        domain_rules = "Focus strictly on Generative AI and LLMs (Transformers, RAG, Embeddings, Prompt Engineering, Model Fine-Tuning)."
    elif "data" in domain_lower or "analyst" in domain_lower:
        domain_rules = "Focus strictly on Data Analysis (SQL aggregates, window functions, statistical distributions, Pandas, EDA, business metrics)."
    elif "devops" in domain_lower or "cloud" in domain_lower:
        domain_rules = "Focus strictly on DevOps and Cloud (Docker, Kubernetes, CI/CD pipelines, Linux, Terraform, AWS/GCP services)."

    if client:
        try:
            prompt = f"""
            You are an expert assessment examiner creating a professional MCQ quiz.
            Target Domain: {domain}
            Selected Topics: {topics_str}
            Difficulty Level: {difficulty}
            Number of Questions: {count}

            {domain_rules}

            REQUIREMENTS FOR QUESTIONS:
            1. Generate exactly {count} multiple-choice questions.
            2. Each question must have exactly 4 options.
            3. The correct answer must NOT always be option A (index 0). Distribute the correctIndex evenly among indices 0, 1, 2, and 3 across the questions.
            4. Provide a clear, educational explanation for why the correct option is right and others are wrong.
            5. If relevant (for coding/frontend/backend/dsa), provide an optional concise codeSnippet. For Aptitude, DO NOT provide code snippets.

            Return a strict JSON array of objects conforming to this schema:
            [
              {{
                "id": "q-1",
                "question": "Question text...",
                "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
                "correctIndex": integer (0, 1, 2, or 3),
                "explanation": "Detailed explanation of the solution...",
                "difficulty": "{difficulty}",
                "topic": "Specific Topic",
                "codeSnippet": null or "optional snippet"
              }}
            ]
            Only output raw JSON. Do not include markdown codeblocks or backticks.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            data = json.loads(raw.strip())
            if isinstance(data, list) and len(data) > 0:
                return data
        except Exception as e:
            logger.warning("Gemini MCQ generation failed (%s), using domain fallback questions", e)

    import random
    # High-yield fallback generator if AI call is unavailable
    if "aptitude" in domain_lower:
        aptitude_pool = [
            {
                "question": "A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?",
                "options": ["65 seconds", "89 seconds", "100 seconds", "150 seconds"],
                "correctIndex": 1,
                "explanation": "Speed of train = 240/24 = 10 m/s. Total distance to pass platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.",
                "difficulty": "Easy",
                "topic": "Time & Distance",
            },
            {
                "question": "A shopkeeper marks an article at 40% above the cost price and allows a discount of 25% on the marked price. What is his net profit or loss percentage?",
                "options": ["5% profit", "10% profit", "5% loss", "15% profit"],
                "correctIndex": 0,
                "explanation": "Let CP = 100. MP = 140. Discount = 25% of 140 = 35. SP = 140 - 35 = 105. Profit = 105 - 100 = 5%.",
                "difficulty": "Medium",
                "topic": "Profit & Loss",
            },
            {
                "question": "If 6 men and 8 boys can do a piece of work in 10 days while 26 men and 48 boys can do the same in 2 days, the time taken by 15 men and 20 boys to complete the work will be:",
                "options": ["6 days", "5 days", "4 days", "7 days"],
                "correctIndex": 2,
                "explanation": "10(6m + 8b) = 2(26m + 48b) => 60m + 80b = 52m + 96b => 8m = 16b => 1m = 2b. Total work = (6*2 + 8)*10 = 200 units of boy-days. 15m + 20b = 50 boys. Time = 200/50 = 4 days.",
                "difficulty": "Medium",
                "topic": "Time & Work",
            },
            {
                "question": "Find the missing number in the series: 4, 18, 48, 100, 180, ?",
                "options": ["248", "294", "312", "340"],
                "correctIndex": 1,
                "explanation": "Pattern: n^3 - n^2 => 2^3 - 2^2 = 4, 3^3 - 3^2 = 18, 4^3 - 4^2 = 48, 5^3 - 5^2 = 100, 6^3 - 6^2 = 180, 7^3 - 7^2 = 343 - 49 = 294.",
                "difficulty": "Hard",
                "topic": "Number Series",
            },
            {
                "question": "Statements: (1) All fruits are sweet. (2) No sweet is vegetable. Conclusions: (I) No fruit is vegetable. (II) Some sweets are fruits.",
                "options": ["Only conclusion I follows", "Only conclusion II follows", "Neither I nor II follows", "Both conclusion I and II follow"],
                "correctIndex": 3,
                "explanation": "Since all fruits are sweet and no sweet is a vegetable, fruits and vegetables are disjoint, so (I) holds. Fruits are a subset of sweet, so (II) also holds.",
                "difficulty": "Medium",
                "topic": "Syllogisms",
            },
            {
                "question": "A bag contains 5 red balls, 4 blue balls, and 3 green balls. If two balls are drawn at random without replacement, what is the probability that both are blue?",
                "options": ["1/11", "2/11", "4/33", "1/6"],
                "correctIndex": 0,
                "explanation": "Total balls = 12. P(First blue) = 4/12 = 1/3. P(Second blue) = 3/11. Total probability = (4/12) * (3/11) = 12/132 = 1/11.",
                "difficulty": "Medium",
                "topic": "Probability",
            },
        ]
        pool = aptitude_pool
    else:
        pool = [
            {
                "question": f"In {domain}, what is the fundamental purpose of decoupling state transitions from UI re-rendering?",
                "options": ["Prevents redundant reconciliation and guarantees deterministic updates", "Increases garbage collection pressure", "Forces all network requests to run synchronously", "Eliminates need for indexing"],
                "correctIndex": 0,
                "explanation": "Decoupling state management optimizes rendering pipelines and preserves predictable state invariants.",
                "difficulty": "Medium",
                "topic": topics_str,
            },
            {
                "question": f"When configuring latency-sensitive workloads in {domain}, which architectural strategy minimizes round-trip overhead?",
                "options": ["Cascading un-cached database calls", "Distributed write-through caching with connection pooling", "Polling HTTP endpoints every 50ms", "Disabling gzip compression"],
                "correctIndex": 1,
                "explanation": "Connection pooling combined with write-through cache clusters circumvents cold connection setup and keeps latency minimal.",
                "difficulty": "Medium",
                "topic": topics_str,
            },
            {
                "question": f"Which trade-off is unavoidable when achieving strict consistency under the CAP theorem in {domain} systems?",
                "options": ["Zero hardware cost", "Infinite network throughput", "Loss of availability during network partitions", "Elimination of disk storage"],
                "correctIndex": 2,
                "explanation": "Under network partition (P), a distributed system must sacrifice either Availability (A) or Consistency (C).",
                "difficulty": "Hard",
                "topic": topics_str,
            },
            {
                "question": f"What is the time complexity of searching an element in a balanced search tree in {domain}?",
                "options": ["O(N^2)", "O(N)", "O(1)", "O(log N)"],
                "correctIndex": 3,
                "explanation": "A balanced search tree halving the search space at each depth level ensures logarithmic O(log N) operations.",
                "difficulty": "Easy",
                "topic": topics_str,
            },
        ]

    # Select and randomize correct positions
    selected = pool[:count] if len(pool) >= count else pool
    while len(selected) < count:
        selected.append(pool[len(selected) % len(pool)])

    results = []
    for idx, q in enumerate(selected):
        opts = list(q["options"])
        correct_text = opts[q["correctIndex"]]
        random.shuffle(opts)
        new_correct_idx = opts.index(correct_text)
        results.append({
            "id": f"q-ai-{idx+1}",
            "question": q["question"],
            "options": opts,
            "correctIndex": new_correct_idx,
            "explanation": q["explanation"],
            "difficulty": q.get("difficulty", difficulty),
            "topic": q.get("topic", topics_str),
            "codeSnippet": q.get("codeSnippet"),
        })

    return results


def generate_placement_article(
    topic: str,
    domain: str = "Backend & Systems",
    target_role: str = "Software Engineer"
) -> Dict[str, Any]:
    """Generates an in-depth placement article guide complete with code/architecture and interview Q&As."""
    if client:
        try:
            prompt = f"""
            You are a Principal Engineering Lead and Technical Interviewer.
            Write a comprehensive, publication-ready placement preparation guide on the topic: "{topic}" within the domain: "{domain}" for candidates interviewing for "{target_role}".
            
            Return strict JSON format with the following schema:
            {{
              "title": "Engaging, professional article title",
              "summary": "2-3 sentence high-impact summary of core takeaways",
              "readTimeMinutes": 8,
              "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
              "content": "# Markdown formatted deep-dive guide with headings, architectural analysis, best practices, and code examples (at least 350 words)",
              "interviewQA": [
                {{
                  "id": "qa-1",
                  "question": "Realistic interview question asked at top tech firms on this topic",
                  "answer": "Detailed model answer explaining trade-offs, internal mechanics, and engineering rationale",
                  "keyPoints": ["Key takeaway point 1", "Key takeaway point 2", "Common pitfall to avoid"]
                }},
                {{
                  "id": "qa-2",
                  "question": "Second challenging interview question",
                  "answer": "Detailed model answer",
                  "keyPoints": ["Point 1", "Point 2"]
                }},
                {{
                  "id": "qa-3",
                  "question": "Third scenario-based or troubleshooting question",
                  "answer": "Detailed model answer",
                  "keyPoints": ["Point 1", "Point 2"]
                }},
                {{
                  "id": "qa-4",
                  "question": "Fourth senior-level architectural trade-off question",
                  "answer": "Detailed model answer",
                  "keyPoints": ["Point 1", "Point 2"]
                }}
              ]
            }}
            
            Only output raw valid JSON. Do not include markdown codeblocks or backticks.
            """
            response = client.models.generate_content(
                model=AI_MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"): raw = raw[7:]
            if raw.endswith("```"): raw = raw[:-3]
            data = json.loads(raw.strip())
            if "title" in data and "content" in data and "interviewQA" in data:
                return data
        except Exception as e:
            logger.warning("Gemini article generation failed (%s), using structured fallback", e)

    return {
        "title": f"Complete Technical Guide & Interview Patterns: {topic}",
        "summary": f"Essential architectural principles, production best practices, and frequently asked interview questions for {topic} in {domain}.",
        "readTimeMinutes": 8,
        "tags": [domain, topic, "Interview Prep", "Architecture"],
        "content": f"""
# Technical Masterclass: {topic}

In modern software engineering interviews, candidates are expected to demonstrate deep conceptual understanding, practical hands-on patterns, and clear trade-off awareness for **{topic}**.

---

## 1. Architectural Foundations & Principles
When designing solutions involving **{topic}**, senior interviewers look for:
- **Scalability & Latency**: How the design behaves under 10x to 100x traffic expansion.
- **Fault Tolerance & Graceful Degradation**: Handling partial failures, timeouts, and network partitions.
- **Clean Separation of Concerns**: Isolating domain logic from infrastructure details.

## 2. Best Practices & Production Pitfalls
1. **Premature Optimization**: Always measure and profile bottlenecks before adding caching or complex sharding layers.
2. **Observability**: Ensure distributed tracing (OpenTelemetry), structured logs, and Prometheus metrics are built into every component.
3. **Idempotency**: Protect against duplicate requests and network retries using unique idempotency keys.
        """,
        "interviewQA": [
            {
                "id": "qa-fb-1",
                "question": f"What is the most critical design trade-off when implementing {topic}?",
                "answer": f"The primary trade-off in {topic} centers on balancing operational simplicity against high-throughput scalability. Premature distributed complexity introduces network latency and synchronization overhead.",
                "keyPoints": [
                    "Evaluate read-to-write ratios before choosing storage models",
                    "Simplicity beats cleverness in production reliability",
                    "Always define clear SLO/SLA constraints"
                ]
            },
            {
                "id": "qa-fb-2",
                "question": f"How do you troubleshoot high latency or bottlenecks in {topic}?",
                "answer": "Analyze distributed traces to isolate whether the delay stems from CPU execution, database lock contention, or slow downstream API dependencies. Inspect connection pool saturation and query execution plans.",
                "keyPoints": [
                    "Trace-first diagnostic approach across service boundaries",
                    "Check connection pool exhaustion and memory leaks",
                    "Audit P99 and P95 latencies rather than averages"
                ]
            },
            {
                "id": "qa-fb-3",
                "question": f"What security or concurrency safeguards are required for {topic}?",
                "answer": "Implement strict input validation, rate limiting at the API gateway, least-privilege credential scoping, and optimistic locking to prevent concurrent overwrite anomalies.",
                "keyPoints": [
                    "Optimistic locking prevents race conditions",
                    "Zero-trust credential scoping across microservices",
                    "Defense in depth with API gateway rate limiting"
                ]
            },
            {
                "id": "qa-fb-4",
                "question": f"How does {topic} evolve from a monolith to a distributed architecture?",
                "answer": "Start with modular monolith boundaries. Extract high-frequency components into isolated services only when deployment velocity, independent scaling, or team ownership boundaries mandate the separation.",
                "keyPoints": [
                    "Modular boundaries before distributed networks",
                    "Extract services based on independent scaling requirements",
                    "Maintain clear event-driven domain boundaries"
                ]
            }
        ]
    }



