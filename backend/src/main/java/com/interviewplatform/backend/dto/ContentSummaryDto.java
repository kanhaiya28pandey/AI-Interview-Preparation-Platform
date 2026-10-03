package com.interviewplatform.backend.dto;

import java.util.HashMap;
import java.util.Map;

public class ContentSummaryDto {

    private long totalItems;
    private long totalPublished;
    private long totalDrafts;
    private long totalArchived;
    private Map<String, TypeStats> statsByType = new HashMap<>();

    public static class TypeStats {
        private long total;
        private long draft;
        private long published;
        private long archived;

        public TypeStats() {}

        public TypeStats(long total, long draft, long published, long archived) {
            this.total = total;
            this.draft = draft;
            this.published = published;
            this.archived = archived;
        }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getDraft() { return draft; }
        public void setDraft(long draft) { this.draft = draft; }
        public long getPublished() { return published; }
        public void setPublished(long published) { this.published = published; }
        public long getArchived() { return archived; }
        public void setArchived(long archived) { this.archived = archived; }
    }

    public ContentSummaryDto() {}

    public long getTotalItems() { return totalItems; }
    public void setTotalItems(long totalItems) { this.totalItems = totalItems; }

    public long getTotalPublished() { return totalPublished; }
    public void setTotalPublished(long totalPublished) { this.totalPublished = totalPublished; }

    public long getTotalDrafts() { return totalDrafts; }
    public void setTotalDrafts(long totalDrafts) { this.totalDrafts = totalDrafts; }

    public long getTotalArchived() { return totalArchived; }
    public void setTotalArchived(long totalArchived) { this.totalArchived = totalArchived; }

    public Map<String, TypeStats> getStatsByType() { return statsByType; }
    public void setStatsByType(Map<String, TypeStats> statsByType) { this.statsByType = statsByType; }
}
