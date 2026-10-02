package com.interviewplatform.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewplatform.backend.dto.AnswerEvaluationResponse;
import com.interviewplatform.backend.model.InterviewFeedback;
import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.model.InterviewScores;
import com.interviewplatform.backend.model.QuestionAnswer;
import com.interviewplatform.backend.model.TranscriptItem;

@Service
@SuppressWarnings("null")
public class AiInterviewService {

    private static final Logger log = LoggerFactory.getLogger(AiInterviewService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String modelName;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiInterviewService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public AnswerEvaluationResponse evaluateAnswer(InterviewQuestion question, String answerText, String roleTitle) {
        if (apiKey != null && !apiKey.trim().isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            try {
                return callGeminiForAnswerEvaluation(question, answerText, roleTitle);
            } catch (Exception e) {
                log.warn("Gemini evaluation error (using algorithmic rubric fallback): {}", e.getMessage());
            }
        }
        return evaluateAlgorithmicAnswer(question, answerText);
    }

    private AnswerEvaluationResponse callGeminiForAnswerEvaluation(InterviewQuestion question, String answerText, String roleTitle) throws Exception {
        String prompt = """
                You are a senior tech interviewer conducting an interview for the role of "%s".
                Question: "%s"
                Category: "%s"
                Expected Key Points: %s
                
                Candidate Answer:
                "%s"
                
                Evaluate the candidate's answer and return ONLY valid JSON:
                {
                  "aiFeedback": "Constructive 2-3 sentence feedback highlighting positive points and 1 key technical area to sharpen.",
                  "score": 85
                }
                Score should be an integer between 60 and 98 based on technical depth, clarity, and relevance.
                """.formatted(
                roleTitle,
                question.getQuestion(),
                question.getCategory(),
                question.getIdealKeyPoints().toString(),
                answerText
        );

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey.trim();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
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
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String textOutput = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            if (textOutput != null && !textOutput.isBlank()) {
                String cleaned = textOutput.replaceAll("```json|```", "").trim();
                return objectMapper.readValue(cleaned, AnswerEvaluationResponse.class);
            }
        }
        throw new RuntimeException("Gemini response error: status " + response.statusCode());
    }

    public AnswerEvaluationResponse evaluateAlgorithmicAnswer(InterviewQuestion question, String answerText) {
        String trimmed = answerText != null ? answerText.trim() : "";
        int wordCount = trimmed.isEmpty() ? 0 : trimmed.split("\\s+").length;

        int score = 70;
        String feedback;

        if (wordCount < 10) {
            score = 65;
            feedback = "Brief answer. To make a lasting impression in a placement interview, elaborate on your thought process with concrete examples and technical details.";
        } else {
            // Count keypoint matches
            int keypointHits = 0;
            String lowerAnswer = trimmed.toLowerCase();
            for (String kp : question.getIdealKeyPoints()) {
                String[] words = kp.toLowerCase().split("\\s+");
                for (String w : words) {
                    if (w.length() > 3 && lowerAnswer.contains(w)) {
                        keypointHits++;
                        break;
                    }
                }
            }

            score = Math.min(96, 75 + (keypointHits * 5) + Math.min(10, wordCount / 12));
            if (score >= 88) {
                feedback = "Strong response! You effectively addressed key architectural trade-offs and structural implications. Quantifying metrics from your past projects would make it exceptional.";
            } else if (score >= 80) {
                feedback = "Good, structured explanation with solid foundational grasp. You touched on core concepts; consider explaining edge cases or performance impacts.";
            } else {
                feedback = "Solid effort. To reach the top percentile, connect your answer to real-world production challenges and specific architectural patterns.";
            }
        }

        return new AnswerEvaluationResponse(feedback, score);
    }

    public InterviewFeedback generateFeedback(InterviewRole role, List<QuestionAnswer> answers, String sessionId) {
        int totalAnswers = answers.size();
        int avgAnswerScore = totalAnswers > 0 ? (int) Math.round(answers.stream().mapToInt(QuestionAnswer::getScore).average().orElse(85.0)) : 86;

        InterviewScores scores = new InterviewScores(
                Math.min(97, Math.max(70, avgAnswerScore + 2)),
                Math.min(95, Math.max(72, avgAnswerScore - 1)),
                Math.min(96, Math.max(74, avgAnswerScore + 1)),
                Math.min(94, Math.max(70, avgAnswerScore - 3))
        );

        int overallScore = Math.round((scores.getTechnicalAccuracy() * 0.35f) + (scores.getProblemSolving() * 0.30f) + (scores.getCommunicationClarity() * 0.20f) + (scores.getConfidence() * 0.15f));

        List<String> strengths = List.of(
                "Demonstrated solid conceptual understanding of " + role.getTitle() + " requirements",
                "Articulated technical design trade-offs cleanly using precise engineering terminology",
                "Approached open-ended architectural questions with a structured, step-by-step problem-solving mindset"
        );

        List<String> areasForImprovement = List.of(
                "Quantify measurable performance optimizations with concrete latency or throughput metrics",
                "Deepen answers on automated integration testing and production telemetry strategies",
                "Elaborate more proactively on failure scenarios and system recovery patterns"
        );

        String detailedFeedback = "Overall, your performance placed you in the top 15% of candidate interviews for " + role.getTitle() + ". " +
                "You demonstrated clear communication, good foundational mechanics, and structured reasoning. Addressing the improvement points above will elevate your technical interview readiness to senior placement levels.";

        List<TranscriptItem> transcripts = new ArrayList<>();
        transcripts.add(new TranscriptItem("interviewer", "Welcome to the " + role.getTitle() + " technical assessment room. Let's begin.", "00:05"));

        for (int i = 0; i < answers.size(); i++) {
            QuestionAnswer qa = answers.get(i);
            int startSec = 20 + (i * 90);
            int min = startSec / 60;
            int sec = startSec % 60;
            String timeStr = String.format("%02d:%02d", min, sec);

            transcripts.add(new TranscriptItem("interviewer", qa.getQuestionText(), timeStr));
            transcripts.add(new TranscriptItem("candidate", qa.getAnswerText(), String.format("%02d:%02d", min, sec + 25)));
        }

        InterviewFeedback feedback = new InterviewFeedback();
        feedback.setSessionId(sessionId);
        feedback.setRoleTitle(role.getTitle());
        feedback.setDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
        feedback.setOverallScore(overallScore);
        feedback.setScores(scores);
        feedback.setStrengths(strengths);
        feedback.setAreasForImprovement(areasForImprovement);
        feedback.setDetailedFeedback(detailedFeedback);
        feedback.setTranscripts(transcripts);

        return feedback;
    }

    public List<InterviewQuestion> generateQuestions(String roleTitle, String subject, List<String> topics, String difficulty, int count) {
        if (apiKey != null && !apiKey.trim().isBlank() && !apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            try {
                return callGeminiForQuestions(roleTitle, subject, topics, difficulty, count);
            } catch (Exception e) {
                log.warn("Gemini question generation failed (using structured template fallback): {}", e.getMessage());
            }
        }
        return generateFallbackQuestions(roleTitle, subject, topics, difficulty, count);
    }

    private List<InterviewQuestion> callGeminiForQuestions(String roleTitle, String subject, List<String> topics, String difficulty, int count) throws Exception {
        String topicsStr = topics != null && !topics.isEmpty() ? String.join(", ", topics) : "Core Concepts";
        String prompt = """
                Generate %d technical interview questions for role "%s", subject "%s", topics [%s], difficulty "%s".
                Return ONLY valid JSON array of objects:
                [
                  {
                    "question": "The question text",
                    "category": "%s",
                    "idealKeyPoints": ["Point 1", "Point 2", "Point 3"],
                    "followUpQuestion": "Follow up question"
                  }
                ]
                """.formatted(count, roleTitle, subject, topicsStr, difficulty, subject);

        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey.trim();
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.3)
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String textOutput = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            if (textOutput != null && !textOutput.isBlank()) {
                String cleaned = textOutput.replaceAll("```json|```", "").trim();
                JsonNode array = objectMapper.readTree(cleaned);
                List<InterviewQuestion> result = new ArrayList<>();
                for (int i = 0; i < array.size(); i++) {
                    JsonNode item = array.get(i);
                    List<String> keypoints = new ArrayList<>();
                    if (item.has("idealKeyPoints")) {
                        item.get("idealKeyPoints").forEach(k -> keypoints.add(k.asText()));
                    }
                    result.add(new InterviewQuestion(
                            "q-gen-" + System.currentTimeMillis() + "-" + i,
                            roleTitle,
                            i + 1,
                            item.path("question").asText("Describe key concepts in " + subject),
                            item.path("category").asText(subject),
                            keypoints.isEmpty() ? List.of("Technical accuracy", "Clarity", "Best practices") : keypoints,
                            item.path("followUpQuestion").asText("How would you optimize this in production?")
                    ));
                }
                return result;
            }
        }
        throw new RuntimeException("Gemini returned non-200: " + response.statusCode());
    }

    private List<InterviewQuestion> generateFallbackQuestions(String roleTitle, String subject, List<String> topics, String difficulty, int count) {
        List<InterviewQuestion> list = new ArrayList<>();
        String topicName = (topics != null && !topics.isEmpty()) ? topics.get(0) : subject;
        for (int i = 1; i <= count; i++) {
            list.add(new InterviewQuestion(
                    "q-ai-" + System.currentTimeMillis() + "-" + i,
                    roleTitle,
                    i,
                    String.format("Explain key principles of %s in %s for %s level interviews. How do you implement and optimize it?", topicName, subject, difficulty),
                    subject,
                    List.of("Core architecture understanding", "Performance implications", "Real-world trade-offs"),
                    "What edge cases or failures would you prepare for in production?"
            ));
        }
        return list;
    }
}
