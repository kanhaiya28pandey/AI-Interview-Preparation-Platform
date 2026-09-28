package com.interviewplatform.backend.model;

public class FormattingItem {
    private String id;
    private String label;
    private boolean passed;
    private String tip;

    public FormattingItem() {}

    public FormattingItem(String id, String label, boolean passed, String tip) {
        this.id = id;
        this.label = label;
        this.passed = passed;
        this.tip = tip;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }
}
