package com.interviewplatform.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.dto.AnswerEvaluationResponse;
import com.interviewplatform.backend.dto.SubmitAnswerRequest;
import com.interviewplatform.backend.model.InterviewFeedback;
import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.model.InterviewSession;
import com.interviewplatform.backend.model.QuestionAnswer;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.repository.InterviewQuestionRepository;
import com.interviewplatform.backend.repository.InterviewRoleRepository;
import com.interviewplatform.backend.repository.InterviewSessionRepository;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;

@Service
public class InterviewService {

    private final InterviewRoleRepository interviewRoleRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final AiInterviewService aiInterviewService;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public InterviewService(
            InterviewRoleRepository interviewRoleRepository,
            InterviewQuestionRepository interviewQuestionRepository,
            InterviewSessionRepository interviewSessionRepository,
            AiInterviewService aiInterviewService,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.interviewRoleRepository = interviewRoleRepository;
        this.interviewQuestionRepository = interviewQuestionRepository;
        this.interviewSessionRepository = interviewSessionRepository;
        this.aiInterviewService = aiInterviewService;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<InterviewRole> getAllRoles() {
        return interviewRoleRepository.findAll();
    }

    public InterviewRole getRoleById(String roleId) {
        return interviewRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Interview role not found with id: " + roleId));
    }

    public List<InterviewQuestion> getQuestionsByRoleId(String roleId) {
        List<InterviewQuestion> questions = interviewQuestionRepository.findByRoleIdOrderByQuestionNumberAsc(roleId);
        if (questions.isEmpty()) {
            return List.of(
                    new InterviewQuestion("q-def-1", roleId, 1,
                            "Tell me about a complex technical challenge you solved recently and how you designed the solution.",
                            "Technical Architecture",
                            List.of("Clear problem statement", "Trade-off analysis", "Measurable result"),
                            "What would you change if you had to re-architect it for 10x traffic?"),
                    new InterviewQuestion("q-def-2", roleId, 2,
                            "How do you handle disagreement with a senior team member or product manager regarding technical debt?",
                            "Behavioral & Leadership",
                            List.of("Data-driven reasoning", "Empathy and business impact", "Compromise and alignment"),
                            "Can you give a specific example from your past project?")
            );
        }
        return questions;
    }

    public InterviewSession startSession(String authEmail, String roleId) {
        User user = userRepository.findByEmail(authEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        InterviewRole role = getRoleById(roleId);
        String sessionId = "session-" + System.currentTimeMillis();

        InterviewSession session = new InterviewSession(
                sessionId,
                user.getId(),
                user.getEmail(),
                role.getId(),
                role.getTitle(),
                LocalDateTime.now().toString()
        );

        return interviewSessionRepository.save(session);
    }

    public AnswerEvaluationResponse submitAnswer(String authEmail, SubmitAnswerRequest request) {
        InterviewQuestion question = interviewQuestionRepository.findById(request.getQuestionId())
                .orElseGet(() -> new InterviewQuestion(
                        request.getQuestionId(),
                        request.getRoleId(),
                        1,
                        "Technical Interview Question",
                        "Technical",
                        List.of("Problem solving", "Accuracy", "Clarity"),
                        "Elaborate on edge cases"
                ));

        String roleTitle = request.getRoleId();
        try {
            InterviewRole role = getRoleById(request.getRoleId());
            roleTitle = role.getTitle();
        } catch (Exception ignored) {}

        AnswerEvaluationResponse evaluation = aiInterviewService.evaluateAnswer(question, request.getAnswerText(), roleTitle);

        // If session ID is provided, record answer in MongoDB
        if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            interviewSessionRepository.findById(request.getSessionId()).ifPresent(session -> {
                session.getAnswers().add(new QuestionAnswer(
                        request.getQuestionId(),
                        question.getQuestion(),
                        request.getAnswerText(),
                        evaluation.getScore(),
                        evaluation.getAiFeedback()
                ));
                interviewSessionRepository.save(session);
            });
        }

        return evaluation;
    }

    public InterviewFeedback getFeedback(String sessionId) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElse(null);

        InterviewRole role = new InterviewRole(
                "frontend-react",
                "Senior Frontend Engineer (React/TypeScript)",
                "Frontend",
                "Senior",
                25,
                "Evaluates modern React, virtual DOM reconciliation, and state management",
                "Layout",
                3
        );

        List<QuestionAnswer> answers = new ArrayList<>();
        if (session != null) {
            if (session.getFeedback() != null) {
                return session.getFeedback();
            }
            try {
                role = getRoleById(session.getRoleId());
            } catch (Exception ignored) {}
            answers = session.getAnswers();
        }

        InterviewFeedback feedback = aiInterviewService.generateFeedback(role, answers, sessionId);

        if (session != null) {
            session.setFeedback(feedback);
            session.setStatus("COMPLETED");
            session.setCompletedAt(LocalDateTime.now().toString());
            interviewSessionRepository.save(session);

            // Update user profile stats: increment mockInterviewsCompleted
            if (session.getUserId() != null) {
                userProfileRepository.findByUserId(session.getUserId()).ifPresent(profile -> {
                    if (profile.getStats() != null) {
                        profile.getStats().setMockInterviewsCompleted(profile.getStats().getMockInterviewsCompleted() + 1);
                        userProfileRepository.save(profile);
                    }
                });
            }
        }

        return feedback;
    }

    public InterviewRole saveRole(InterviewRole role) {
        if (role.getId() == null || role.getId().isBlank()) {
            role.setId("role-" + System.currentTimeMillis());
        }
        return interviewRoleRepository.save(role);
    }

    public void deleteRole(String roleId) {
        interviewRoleRepository.deleteById(roleId);
    }
}
