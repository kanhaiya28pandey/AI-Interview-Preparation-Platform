package com.interviewplatform.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.model.PracticeQuestion;
import com.interviewplatform.backend.model.PracticeTopic;
import com.interviewplatform.backend.repository.ContentItemRepository;
import com.interviewplatform.backend.repository.PracticeQuestionRepository;
import com.interviewplatform.backend.repository.PracticeTopicRepository;

@Service
public class PracticeService {

    private final PracticeTopicRepository practiceTopicRepository;
    private final PracticeQuestionRepository practiceQuestionRepository;
    private final ContentItemRepository contentItemRepository;

    public PracticeService(
            PracticeTopicRepository practiceTopicRepository,
            PracticeQuestionRepository practiceQuestionRepository,
            ContentItemRepository contentItemRepository
    ) {
        this.practiceTopicRepository = practiceTopicRepository;
        this.practiceQuestionRepository = practiceQuestionRepository;
        this.contentItemRepository = contentItemRepository;
    }

    public List<PracticeTopic> getTopics() {
        List<PracticeTopic> topics = new ArrayList<>(practiceTopicRepository.findAll());

        // Merge published practice topics from Content Manager
        List<ContentItem> dynamicItems = contentItemRepository.findAll();
        for (ContentItem item : dynamicItems) {
            if (isPracticeType(item.getType()) && isPublished(item.getStatus())) {
                boolean exists = topics.stream().anyMatch(t -> t.getId().equals(item.getId()));
                if (!exists) {
                    PracticeTopic pt = new PracticeTopic(
                            item.getId(),
                            item.getTitle(),
                            item.getDescription(),
                            item.getSubject() != null ? item.getSubject() : "Core",
                            item.getDifficulty() != null ? item.getDifficulty() : "Medium",
                            item.getQuestionsCount() > 0 ? item.getQuestionsCount() : 5,
                            "BookOpen"
                    );
                    topics.add(0, pt);
                }
            }
        }
        return topics;
    }

    public PracticeTopic getTopicById(String id) {
        return practiceTopicRepository.findById(id)
                .or(() -> contentItemRepository.findById(id).map(item -> new PracticeTopic(
                        item.getId(),
                        item.getTitle(),
                        item.getDescription(),
                        item.getSubject() != null ? item.getSubject() : "Core",
                        item.getDifficulty() != null ? item.getDifficulty() : "Medium",
                        item.getQuestionsCount() > 0 ? item.getQuestionsCount() : 5,
                        "BookOpen"
                )))
                .orElseThrow(() -> new IllegalArgumentException("Practice topic not found with id: " + id));
    }

    public List<PracticeQuestion> getQuestionsByTopic(String topicId) {
        List<PracticeQuestion> questions = practiceQuestionRepository.findByTopicId(topicId);
        if (!questions.isEmpty()) {
            return questions;
        }

        // Check dynamic content items
        ContentItem item = contentItemRepository.findById(topicId).orElse(null);
        if (item != null && item.getContentData() != null) {
            List<PracticeQuestion> dynamicList = new ArrayList<>();
            dynamicList.add(new PracticeQuestion(
                    "pq-" + item.getId() + "-1",
                    item.getId(),
                    item.getTitle(),
                    item.getDifficulty() != null ? item.getDifficulty() : "Medium",
                    item.getDescription(),
                    item.getTopics() != null ? item.getTopics() : List.of("Concept Understanding", "Best Practices"),
                    "Key implementation considerations and trade-offs must be evaluated."
            ));
            return dynamicList;
        }

        return List.of();
    }

    private boolean isPracticeType(String type) {
        if (type == null) return false;
        String t = type.toUpperCase();
        return t.contains("PRACTICE") || t.contains("TRACK");
    }

    private boolean isPublished(String status) {
        if (status == null) return false;
        return status.equalsIgnoreCase("Published") || status.equalsIgnoreCase("PUBLISHED");
    }
}
