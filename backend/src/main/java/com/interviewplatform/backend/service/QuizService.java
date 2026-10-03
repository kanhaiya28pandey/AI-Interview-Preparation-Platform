package com.interviewplatform.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.QuizResultResponse;
import com.interviewplatform.backend.dto.QuizSubmissionRequest;
import com.interviewplatform.backend.model.QuizQuestion;
import com.interviewplatform.backend.model.QuizTopic;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.repository.QuizQuestionRepository;
import com.interviewplatform.backend.repository.QuizTopicRepository;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
public class QuizService {

    private final QuizTopicRepository quizTopicRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public QuizService(
            QuizTopicRepository quizTopicRepository,
            QuizQuestionRepository quizQuestionRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.quizTopicRepository = quizTopicRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<QuizTopic> getTopics() {
        return quizTopicRepository.findAll();
    }

    public List<QuizQuestion> getQuestionsByTopic(String topicId) {
        return quizQuestionRepository.findByTopicId(topicId);
    }

    public QuizResultResponse submitQuiz(String authEmail, QuizSubmissionRequest request) {
        List<QuizQuestion> questions = quizQuestionRepository.findByTopicId(request.getTopicId());
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
                        userProfileRepository.save(profile);
                    }
                });
            });
        }

        return new QuizResultResponse(request.getTopicId(), score, total, percentage, passed, xpEarned);
    }
}
