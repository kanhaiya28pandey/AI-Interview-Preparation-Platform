package com.interviewplatform.backend.model;

public class TranscriptItem {
    private String speaker; // "interviewer" | "candidate"
    private String text;
    private String timestamp;

    public TranscriptItem() {}

    public TranscriptItem(String speaker, String text, String timestamp) {
        this.speaker = speaker;
        this.text = text;
        this.timestamp = timestamp;
    }

    public String getSpeaker() { return speaker; }
    public void setSpeaker(String speaker) { this.speaker = speaker; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
