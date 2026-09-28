package com.interviewplatform.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.PracticeQuestion;
import com.interviewplatform.backend.model.PracticeTopic;
import com.interviewplatform.backend.service.PracticeService;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    @GetMapping("/topics")
    public ResponseEntity<List<PracticeTopic>> getTopics() {
        List<PracticeTopic> topics = practiceService.getTopics();
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/topics/{id}")
    public ResponseEntity<PracticeTopic> getTopicById(@PathVariable String id) {
        PracticeTopic topic = practiceService.getTopicById(id);
        return ResponseEntity.ok(topic);
    }

    @GetMapping("/topics/{topicId}/questions")
    public ResponseEntity<List<PracticeQuestion>> getQuestionsByTopic(@PathVariable String topicId) {
        List<PracticeQuestion> questions = practiceService.getQuestionsByTopic(topicId);
        return ResponseEntity.ok(questions);
    }
}
