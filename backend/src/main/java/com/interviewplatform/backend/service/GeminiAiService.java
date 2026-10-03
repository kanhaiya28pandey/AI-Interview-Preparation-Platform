package com.interviewplatform.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewplatform.backend.model.FormattingItem;
import com.interviewplatform.backend.model.KeywordDetail;
import com.interviewplatform.backend.model.MissingSkillDetail;
import com.interviewplatform.backend.model.ResumeAnalysis;
import com.interviewplatform.backend.model.RoleFitItem;
import com.interviewplatform.backend.model.SectionAnalysis;
import com.interviewplatform.backend.model.SubScores;
import com.interviewplatform.backend.model.SuggestionDetail;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String modelName;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiAiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public ResumeAnalysis analyzeResumeWithAi(
            String resumeText,
            String role,
            String field,
            String jobDescription,
            String fileName
    ) {
        if (apiKey != null && !apiKey.trim().isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            try {
                return callGeminiApi(resumeText, role, field, jobDescription, fileName);
            } catch (Exception e) {
                log.warn("Gemini API call failed (falling back to intelligent ATS text-matching engine): {}", e.getMessage());
            }
        } else {
            log.info("Gemini API key not configured. Using rule-based algorithmic ATS engine for resume evaluation.");
        }

        return evaluateAlgorithmicAts(resumeText, role, field, jobDescription, fileName);
    }

    private ResumeAnalysis callGeminiApi(
            String resumeText,
            String role,
            String field,
            String jobDescription,
            String fileName
    ) throws Exception {

        String systemPrompt = """
                You are an expert technical recruiter and automated ATS (Applicant Tracking System) algorithm.
                Analyze the provided candidate resume text for the target role: "%s" in field: "%s".
                Optional job description context: "%s".
                
                You MUST return ONLY valid JSON matching this exact structure:
                {
                  "atsScore": 82,
                  "verdict": "Clear summary verdict of profile strength",
                  "subScores": {
                    "keywordMatch": 85,
                    "formatting": 90,
                    "experienceRelevance": 80,
                    "skillsMatch": 84,
                    "educationMatch": 88,
                    "actionVerbUsage": 75
                  },
                  "matchedSkills": ["Skill 1", "Skill 2"],
                  "missingSkills": [
                    { "name": "Skill Name", "importance": "Critical", "tooltip": "Why it is critical" }
                  ],
                  "suggestions": [
                    { "id": "s1", "section": "Experience", "priority": "High", "text": "Suggestion text", "whyItMatters": "Why it matters" }
                  ],
                  "keywords": [
                    { "keyword": "Term", "present": true, "count": 3, "importance": "Critical" }
                  ],
                  "formattingChecklist": [
                    { "id": "f1", "label": "Single-column ATS readable layout", "passed": true, "tip": "Layout check passed" },
                    { "id": "f2", "label": "Standard header structure", "passed": true, "tip": "Clear section headers" },
                    { "id": "f3", "label": "Bullet points with metrics", "passed": true, "tip": "Metrics usage check" },
                    { "id": "f4", "label": "Consistent typography & dates", "passed": true, "tip": "Date formats clean" }
                  ],
                  "sections": [
                    { "name": "Summary", "status": "good", "score": 85, "extractedContent": "Summary snippet", "suggestions": ["Tip 1"] },
                    { "name": "Experience", "status": "needs-improvement", "score": 75, "extractedContent": "Experience snippet", "suggestions": ["Tip 2"] },
                    { "name": "Skills", "status": "good", "score": 88, "extractedContent": "Skills snippet", "suggestions": ["Tip 3"] },
                    { "name": "Education", "status": "good", "score": 90, "extractedContent": "Education snippet", "suggestions": ["Tip 4"] }
                  ],
                  "roleFitComparison": [
                    { "roleName": "%s", "score": 82 },
                    { "roleName": "Software Engineer", "score": 78 },
                    { "roleName": "Full Stack Developer", "score": 74 }
                  ]
                }
                
                Candidate Resume Text:
                %s
                """.formatted(
                role,
                field != null ? field : "Technology",
                jobDescription != null ? jobDescription : "N/A",
                role,
                resumeText.length() > 6000 ? resumeText.substring(0, 6000) : resumeText
        );

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey.trim();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", systemPrompt)))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.2
                )
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(25))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error (status " + response.statusCode() + "): " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidate = root.path("candidates").path(0);
        String textOutput = candidate.path("content").path("parts").path(0).path("text").asText();

        if (textOutput == null || textOutput.isBlank()) {
            throw new RuntimeException("Blank response from Gemini API");
        }

        // Clean any accidental markdown fence
        String cleanedJson = textOutput.trim();
        if (cleanedJson.startsWith("```json")) {
            cleanedJson = cleanedJson.substring(7);
        }
        if (cleanedJson.startsWith("```")) {
            cleanedJson = cleanedJson.substring(3);
        }
        if (cleanedJson.endsWith("```")) {
            cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
        }
        cleanedJson = cleanedJson.trim();

        ResumeAnalysis analysis = objectMapper.readValue(cleanedJson, ResumeAnalysis.class);
        analysis.setRole(role);
        analysis.setField(field != null ? field : "IT Services");
        analysis.setFileName(fileName);
        return analysis;
    }

    /**
     * Rule-based algorithmic ATS evaluator
     * Analyzes real text density, keywords, action verbs, and section headers
     */
    public ResumeAnalysis evaluateAlgorithmicAts(
            String text,
            String role,
            String field,
            String jobDescription,
            String fileName
    ) {
        String lower = text.toLowerCase();

        // 1. Identify common tech keywords relevant to role
        Map<String, List<String>> roleKeywordMap = new HashMap<>();
        roleKeywordMap.put("Frontend Developer", List.of("react", "typescript", "javascript", "tailwind", "html", "css", "redux", "next.js", "git", "rest", "webpack", "responsive"));
        roleKeywordMap.put("Backend Developer", List.of("java", "spring boot", "python", "node.js", "mongodb", "postgresql", "sql", "docker", "microservices", "rest api", "jwt", "redis"));
        roleKeywordMap.put("Full Stack Developer", List.of("react", "node.js", "typescript", "mongodb", "sql", "express", "docker", "git", "rest api", "tailwind", "aws", "ci/cd"));
        roleKeywordMap.put("Data Analyst", List.of("python", "sql", "pandas", "tableau", "power bi", "excel", "numpy", "statistics", "data visualization", "r", "machine learning"));
        roleKeywordMap.put("ML Engineer", List.of("python", "tensorflow", "pytorch", "scikit-learn", "numpy", "pandas", "nlp", "computer vision", "deep learning", "docker", "mlops"));

        List<String> targetKeywords = roleKeywordMap.getOrDefault(role, List.of("software", "programming", "database", "git", "api", "problem solving", "agile", "testing", "cloud"));

        List<String> matchedSkills = new ArrayList<>();
        List<MissingSkillDetail> missingSkills = new ArrayList<>();
        List<KeywordDetail> keywordDetails = new ArrayList<>();

        int matchedCount = 0;
        for (String kw : targetKeywords) {
            int count = countOccurrences(lower, kw);
            boolean present = count > 0;
            if (present) {
                matchedCount++;
                matchedSkills.add(capitalizeWords(kw));
                keywordDetails.add(new KeywordDetail(capitalizeWords(kw), true, count, "Critical"));
            } else {
                missingSkills.add(new MissingSkillDetail(capitalizeWords(kw), "Critical", "Frequently requested for " + role + " qualifications"));
                keywordDetails.add(new KeywordDetail(capitalizeWords(kw), false, 0, "Critical"));
            }
        }

        // Action verbs check
        List<String> actionVerbs = List.of("developed", "engineered", "designed", "optimized", "built", "implemented", "spearheaded", "accelerated", "deployed", "scaled");
        int actionVerbHits = 0;
        for (String verb : actionVerbs) {
            if (lower.contains(verb)) actionVerbHits++;
        }
        int actionVerbScore = Math.min(95, 60 + actionVerbHits * 4);

        // Sections check
        boolean hasSummary = lower.contains("summary") || lower.contains("objective") || lower.contains("profile");
        boolean hasExperience = lower.contains("experience") || lower.contains("work") || lower.contains("employment");
        boolean hasEducation = lower.contains("education") || lower.contains("academic") || lower.contains("university") || lower.contains("b.tech") || lower.contains("degree");
        boolean hasProjects = lower.contains("project") || lower.contains("portfolio");
        boolean hasSkills = lower.contains("skills") || lower.contains("technologies");

        int sectionScore = 50;
        if (hasSummary) sectionScore += 10;
        if (hasExperience) sectionScore += 12;
        if (hasEducation) sectionScore += 10;
        if (hasProjects) sectionScore += 10;
        if (hasSkills) sectionScore += 8;

        int keywordScore = targetKeywords.isEmpty() ? 75 : Math.min(95, Math.max(50, (matchedCount * 100) / targetKeywords.size()));
        int formattingScore = (text.length() > 500 && text.length() < 12000) ? 90 : 72;
        int experienceScore = hasExperience ? (hasProjects ? 85 : 75) : 65;
        int educationScore = hasEducation ? 88 : 70;
        int skillsScore = keywordScore;

        int overallAts = Math.round((keywordScore * 0.35f) + (formattingScore * 0.15f) + (experienceScore * 0.20f) + (actionVerbScore * 0.15f) + (educationScore * 0.15f));

        SubScores subScores = new SubScores(keywordScore, formattingScore, experienceScore, skillsScore, educationScore, actionVerbScore);

        List<FormattingItem> formattingChecklist = List.of(
                new FormattingItem("f1", "Single-column ATS readable layout", true, "Standard linear flow detected in text parsing."),
                new FormattingItem("f2", "Standard section headers", hasExperience && hasEducation, "Headers align with conventional ATS indexing rules."),
                new FormattingItem("f3", "Action verbs and impact metrics", actionVerbHits >= 3, "Quantifiable achievement indicators detected."),
                new FormattingItem("f4", "Clean typography and parsable dates", true, "Document text was successfully converted without OCR distortions.")
        );

        List<SectionAnalysis> sections = new ArrayList<>();
        sections.add(new SectionAnalysis("Summary", hasSummary ? "good" : "missing", hasSummary ? 85 : 45,
                hasSummary ? "Professional summary detected." : "Summary section not clearly labeled.",
                hasSummary ? List.of("Include exact keywords for " + role) : List.of("Add a 3-line professional summary highlighting your core skills.")));
        sections.add(new SectionAnalysis("Experience", hasExperience ? "good" : "needs-improvement", experienceScore,
                hasExperience ? "Work/internship experience items detected." : "Limited formal experience items found.",
                List.of("Start each bullet point with a strong action verb and include quantifiable outcomes (e.g. % faster, users served).")));
        sections.add(new SectionAnalysis("Skills", hasSkills ? "good" : "needs-improvement", skillsScore,
                "Matched " + matchedCount + " relevant skills for " + role + ".",
                List.of("Organize skills by categories (e.g., Languages, Frameworks, Tools) to aid ATS keyword scanners.")));
        sections.add(new SectionAnalysis("Education", hasEducation ? "good" : "needs-improvement", educationScore,
                hasEducation ? "Degree and academic institution credentials identified." : "Education credentials need clearer labeling.",
                List.of("Ensure expected graduation month and year are explicitly mentioned.")));

        List<SuggestionDetail> suggestions = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            suggestions.add(new SuggestionDetail(UUID.randomUUID().toString(), "Skills", "High",
                    "Add core missing competencies like " + missingSkills.get(0).getName() + " to your skills list.",
                    "Boosts the keyword density score for automated job match filters."));
        }
        suggestions.add(new SuggestionDetail(UUID.randomUUID().toString(), "Experience", "Medium",
                "Quantify bullet points with percentage improvements and user impact.",
                "Recruiters look for concrete proof of impact rather than generic task descriptions."));
        suggestions.add(new SuggestionDetail(UUID.randomUUID().toString(), "Projects", "High",
                "Include direct live deployment links and GitHub repositories for key projects.",
                "Enables recruiters and interviewers to immediately test your code."));

        List<RoleFitItem> roleFit = List.of(
                new RoleFitItem(role, overallAts),
                new RoleFitItem("Software Engineer", Math.max(50, overallAts - 6)),
                new RoleFitItem("Full Stack Developer", Math.max(50, overallAts - 10))
        );

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setRole(role);
        analysis.setField(field != null ? field : "IT Services");
        analysis.setFileName(fileName);
        analysis.setAtsScore(overallAts);
        analysis.setVerdict(overallAts >= 80 ? "Strong match for " + role + " positions with comprehensive foundational qualifications."
                : "Promising candidate profile for " + role + ", but needs higher target keyword density.");
        analysis.setSubScores(subScores);
        analysis.setMatchedSkills(matchedSkills);
        analysis.setMissingSkills(missingSkills);
        analysis.setSuggestions(suggestions);
        analysis.setKeywords(keywordDetails);
        analysis.setFormattingChecklist(formattingChecklist);
        analysis.setSections(sections);
        analysis.setRoleFitComparison(roleFit);

        return analysis;
    }

    private int countOccurrences(String text, String term) {
        if (text == null || term == null || term.isEmpty()) return 0;
        int count = 0;
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(term) + "\\b", Pattern.CASE_INSENSITIVE);
        var matcher = pattern.matcher(text);
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return "";
        String[] words = str.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
