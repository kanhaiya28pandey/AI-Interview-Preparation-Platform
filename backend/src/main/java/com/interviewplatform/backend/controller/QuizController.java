package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.dto.QuizResultResponse;
import com.interviewplatform.backend.dto.QuizSubmissionRequest;
import com.interviewplatform.backend.model.QuizQuestion;
import com.interviewplatform.backend.model.QuizTopic;
import com.interviewplatform.backend.service.QuizService;

import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/v1/quiz", "/api/v1/quizzes"})
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/topics")
    public ResponseEntity<List<QuizTopic>> getTopics() {
        List<QuizTopic> topics = quizService.getTopics();
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/topics/{topicId}/questions")
    public ResponseEntity<List<QuizQuestion>> getQuestionsByTopic(@PathVariable String topicId) {
        List<QuizQuestion> questions = quizService.getQuestionsByTopic(topicId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            Authentication authentication,
            @Valid @RequestBody QuizSubmissionRequest request
    ) {
        String authEmail = authentication != null ? authentication.getName() : null;
        QuizResultResponse response = quizService.submitQuiz(authEmail, request);
        return ResponseEntity.ok(response);
    }
}
