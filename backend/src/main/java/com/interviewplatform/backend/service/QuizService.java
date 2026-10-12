package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.QuizResultResponse;
import com.interviewplatform.backend.dto.QuizSubmissionRequest;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.model.QuizQuestion;
import com.interviewplatform.backend.model.QuizTopic;
import com.interviewplatform.backend.repository.ContentItemRepository;
import com.interviewplatform.backend.repository.QuizQuestionRepository;
import com.interviewplatform.backend.repository.QuizTopicRepository;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
@SuppressWarnings("null")
public class QuizService {

    private final QuizTopicRepository quizTopicRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ContentItemRepository contentItemRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public QuizService(
            QuizTopicRepository quizTopicRepository,
            QuizQuestionRepository quizQuestionRepository,
            ContentItemRepository contentItemRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.quizTopicRepository = quizTopicRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.contentItemRepository = contentItemRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<QuizTopic> getTopics() {
        List<QuizTopic> topics = new ArrayList<>(quizTopicRepository.findAll());

        // Merge published quiz topics from Content Manager
        List<ContentItem> dynamicItems = contentItemRepository.findAll();
        for (ContentItem item : dynamicItems) {
            if (isQuizType(item.getType()) && isPublished(item.getStatus())) {
                boolean exists = topics.stream().anyMatch(t -> t.getId().equals(item.getId()));
                if (!exists) {
                    QuizTopic qt = new QuizTopic(
                            item.getId(),
                            item.getTitle(),
                            item.getDescription(),
                            item.getSubject() != null ? item.getSubject() : "Technical",
                            item.getQuestionsCount() > 0 ? item.getQuestionsCount() : 5,
                            item.getDurationMinutes() > 0 ? item.getDurationMinutes() : 25,
                            "BrainCircuit"
                    );
                    topics.add(0, qt);
                }
            }
        }
        return topics;
    }

    @SuppressWarnings("unchecked")
    public List<QuizQuestion> getQuestionsByTopic(String topicId) {
        List<QuizQuestion> list = quizQuestionRepository.findByTopicId(topicId);
        if (!list.isEmpty()) {
            return list;
        }

        // Check if it's a dynamic content item
        ContentItem item = contentItemRepository.findById(topicId).orElse(null);
        if (item != null) {
            List<QuizQuestion> dynamicQuestions = new ArrayList<>();

            if (item.getContentData() != null && item.getContentData().containsKey("questions")) {
                List<Map<String, Object>> raw = (List<Map<String, Object>>) item.getContentData().get("questions");
                for (int i = 0; i < raw.size(); i++) {
                    Map<String, Object> qMap = raw.get(i);
                    String qId = (String) qMap.getOrDefault("id", "dq-" + (i + 1));
                    String qText = (String) qMap.getOrDefault("question", qMap.getOrDefault("questionText", "Question #" + (i + 1)));
                    List<String> options = (List<String>) qMap.getOrDefault("options", List.of("Option A", "Option B", "Option C", "Option D"));
                    int correctIdx = qMap.containsKey("correctIndex") ? ((Number) qMap.get("correctIndex")).intValue()
                            : (qMap.containsKey("correctOptionIndex") ? ((Number) qMap.get("correctOptionIndex")).intValue() : 0);
                    String explanation = (String) qMap.getOrDefault("explanation", "Standard solution explanation");

                    dynamicQuestions.add(new QuizQuestion(qId, topicId, qText, options, correctIdx, explanation));
                }
            }

            if (dynamicQuestions.isEmpty() && item.getPayload() != null && item.getPayload().containsKey("mcqQuestions")) {
                List<Map<String, Object>> raw = (List<Map<String, Object>>) item.getPayload().get("mcqQuestions");
                for (int i = 0; i < raw.size(); i++) {
                    Map<String, Object> qMap = raw.get(i);
                    String qId = (String) qMap.getOrDefault("id", "dq-p-" + (i + 1));
                    String qText = (String) qMap.getOrDefault("questionText", "Question #" + (i + 1));
                    List<String> options = (List<String>) qMap.getOrDefault("options", List.of("A", "B", "C", "D"));
                    int correctIdx = qMap.containsKey("correctOptionIndex") ? ((Number) qMap.get("correctOptionIndex")).intValue() : 0;
                    String explanation = (String) qMap.getOrDefault("explanation", "Standard solution explanation");

                    dynamicQuestions.add(new QuizQuestion(qId, topicId, qText, options, correctIdx, explanation));
                }
            }

            if (!dynamicQuestions.isEmpty()) {
                return dynamicQuestions;
            }
        }

        return List.of();
    }

    public QuizResultResponse submitQuiz(String authEmail, QuizSubmissionRequest request) {
        List<QuizQuestion> questions = getQuestionsByTopic(request.getTopicId());
        int total = questions.size();
        int score = 0;

        for (QuizQuestion q : questions) {
            Integer chosen = request.getAnswers().get(q.getId());
            if (chosen != null && chosen == q.getCorrectIndex()) {
                score++;
            }
        }

        double percentage = total > 0 ? Math.round(((double) score / total) * 1000.0) / 10.0 : 0.0;
        boolean passed = percentage >= 60.0;
        int xpEarned = passed ? 50 : 15;

        // Update profile stats if authenticated
        if (authEmail != null) {
            userRepository.findByEmail(authEmail.trim().toLowerCase()).ifPresent(user -> {
                userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                    if (profile.getStats() != null) {
                        profile.getStats().setQuizzesCompleted(profile.getStats().getQuizzesCompleted() + 1);
                        profile.getStats().setTotalXP(profile.getStats().getTotalXP() + xpEarned);
                        profile.setUpdatedAt(LocalDateTime.now().toString());
                        userProfileRepository.save(profile);
                    }
                });
            });
        }

        // Increment attempts count on dynamic ContentItem if applicable
        contentItemRepository.findById(request.getTopicId()).ifPresent(item -> {
            item.setStudentAttemptsCount(item.getStudentAttemptsCount() + 1);
            item.setUpdatedAt(LocalDateTime.now().toString());
            contentItemRepository.save(item);
        });

        return new QuizResultResponse(request.getTopicId(), score, total, percentage, passed, xpEarned);
    }

    private boolean isQuizType(String type) {
        if (type == null) return false;
        String t = type.toUpperCase();
        return t.contains("QUIZ") || t.contains("TEST") || t.contains("MCQ");
    }

    private boolean isPublished(String status) {
        if (status == null) return false;
        return status.equalsIgnoreCase("Published") || status.equalsIgnoreCase("PUBLISHED");
    }
}
