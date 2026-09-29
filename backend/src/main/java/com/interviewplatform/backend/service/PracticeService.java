package com.interviewplatform.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.PracticeQuestion;
import com.interviewplatform.backend.model.PracticeTopic;
import com.interviewplatform.backend.repository.PracticeQuestionRepository;
import com.interviewplatform.backend.repository.PracticeTopicRepository;

@Service
public class PracticeService {

    private final PracticeTopicRepository practiceTopicRepository;
    private final PracticeQuestionRepository practiceQuestionRepository;

    public PracticeService(
            PracticeTopicRepository practiceTopicRepository,
            PracticeQuestionRepository practiceQuestionRepository
    ) {
        this.practiceTopicRepository = practiceTopicRepository;
        this.practiceQuestionRepository = practiceQuestionRepository;
    }

    public List<PracticeTopic> getTopics() {
        return practiceTopicRepository.findAll();
    }

    public PracticeTopic getTopicById(String id) {
        return practiceTopicRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Practice topic not found with id: " + id));
    }

    public List<PracticeQuestion> getQuestionsByTopic(String topicId) {
        return practiceQuestionRepository.findByTopicId(topicId);
    }
}
