package com.interviewplatform.backend.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping({"/api/ai", "/api/v1/ai"})
public class AiChatController {

    private static final Logger log = LoggerFactory.getLogger(AiChatController.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiChatController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public static class ChatMessageRequest {
        private String message;
        private List<Map<String, String>> history;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<Map<String, String>> getHistory() {
            return history;
        }

        public void setHistory(List<Map<String, String>> history) {
            this.history = history;
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatMessageRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Request body cannot be null"));
        }

        String userMsg = request.getMessage() != null ? request.getMessage().trim() : "";
        if (userMsg.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        List<Map<String, String>> history = request.getHistory();
        String reply = null;

        // 1. Try Gemini API directly if key is configured
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.equalsIgnoreCase("YOUR_KEY") && !geminiApiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) {
            try {
                reply = callGemini(userMsg, history);
            } catch (Exception e) {
                log.warn("Direct Gemini chat call failed: {}", e.getMessage());
            }
        }

        // 2. Try FastAPI ai-service if Gemini was not called or failed
        if (reply == null || reply.isBlank()) {
            try {
                reply = callAiMicroservice(userMsg);
            } catch (Exception e) {
                log.debug("AI microservice call skipped/failed: {}", e.getMessage());
            }
        }

        // 3. Fallback to intelligent local AI assistant responses tailored for placement prep
        if (reply == null || reply.isBlank()) {
            reply = generateContextualPrepResponse(userMsg);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("reply", reply);
        response.put("timestamp", Instant.now().toString());
        response.put("role", "assistant");

        return ResponseEntity.ok(response);
    }

    private String callGemini(String message, List<Map<String, String>> history) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        String systemInstruction = "You are the AI Copilot on the AI Interview Preparation Platform. " +
                "You assist engineering students with placement preparation, Data Structures and Algorithms (DSA), " +
                "system design, coding hints, STAR-method behavioral interview answers, and resume ATS optimization. " +
                "Provide concise, encouraging, structured answers using Markdown formatting with code blocks where appropriate.";

        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> contentPart = Map.of("text", systemInstruction + "\n\nUser Question: " + message);
        payload.put("contents", List.of(Map.of("parts", List.of(contentPart))));

        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(httpResponse.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        }
        return null;
    }

    private String callAiMicroservice(String message) {
        try {
            String url = aiServiceUrl + "/api/ai/coding/review";
            Map<String, String> body = Map.of("code", message, "language", "java", "problem_title", "Interview Prep Question");
            String jsonBody = objectMapper.writeValueAsString(body);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(4))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(resp.body());
                if (root.has("feedback")) {
                    return root.path("feedback").asText();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String generateContextualPrepResponse(String query) {
        String lower = query.toLowerCase();

        if (lower.contains("dsa") || lower.contains("hint") || lower.contains("two sum") || lower.contains("sliding window")) {
            return "### 💡 DSA Problem-Solving Strategy\n\n" +
                    "When tackling complex algorithm challenges:\n\n" +
                    "1. **Identify the Underlying Pattern:**\n" +
                    "   - *Sorted array search / intervals?* → **Two Pointers** or **Binary Search**.\n" +
                    "   - *Contiguous subarray / substring sum?* → **Sliding Window** ($O(N)$).\n" +
                    "   - *Cycle detection / middle node?* → **Fast & Slow Pointers** (Floyd's algorithm).\n" +
                    "   - *Top/K-th elements?* → **Min/Max Heap** ($O(N \\log K)$).\n\n" +
                    "2. **State Constraints & Edge Cases First:** Always verify $0$, negative numbers, empty arrays, and single elements.\n" +
                    "3. **Write the Brute Force First:** State $O(N^2)$ to the interviewer, then optimize using a `HashMap` ($O(N)$ time, $O(N)$ space).";
        }

        if (lower.contains("hr") || lower.contains("behavioral") || lower.contains("tell me about yourself") || lower.contains("conflict")) {
            return "### 🎯 STAR Method Framework for Behavioral Rounds\n\n" +
                    "Structure every behavioral interview response using the **STAR** method:\n\n" +
                    "- **S - Situation (15%):** Set the stage. State the company, project, and the challenge clearly.\n" +
                    "- **T - Task (15%):** What was your specific responsibility or goal?\n" +
                    "- **A - Action (50%):** Highlight *what you specifically did*. Use active verbs: *\"I architected, investigated, refactored...\"*\n" +
                    "- **R - Result (20%):** Quantify the outcome whenever possible: *\"...reduced latency by 35% and unblocked the deployment pipeline.\"*\n\n" +
                    "*(Tip: Always focus on collaboration and learning from challenges.)*";
        }

        if (lower.contains("resume") || lower.contains("ats") || lower.contains("review")) {
            return "### 📄 Placement Resume & ATS Optimization\n\n" +
                    "Key guidelines for maximum recruiter shortlisting:\n\n" +
                    "1. **XYZ Formula (Google Standard):**\n" +
                    "   *\"Accomplished [X], as measured by [Y], by doing [Z].\"*\n" +
                    "   *(Example: Accelerated database queries by 40% (Y) on our campus portal (X) through Redis caching and query indexing (Z).)*\n\n" +
                    "2. **Keyword Match:** Include core technologies: `Java`, `Spring Boot`, `React`, `Docker`, `MongoDB`, `PostgreSQL`.\n" +
                    "3. **Format:** Stick to clean single-column PDF, no tables, and concise 1-page layout for freshers.";
        }

        return "### 🚀 AI Placement Copilot\n\n" +
                "I am here to guide your placement and interview journey! Here are key areas I can assist you with:\n\n" +
                "- **Algorithm & Data Structure Hints:** Break down LeetCode patterns, edge cases, and time complexities.\n" +
                "- **Mock Interview Prep:** Tailor answers for Frontend, Backend, Full Stack, or System Design rounds.\n" +
                "- **Behavioral & HR Practice:** Formulate impactful answers using the STAR method.\n" +
                "- **Resume & Project Review:** Elevate project descriptions into metric-driven bullet points.\n\n" +
                "*What topic or problem would you like to explore right now?*";
    }
}
