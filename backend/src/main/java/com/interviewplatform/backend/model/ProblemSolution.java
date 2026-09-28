package com.interviewplatform.backend.model;

import java.util.HashMap;
import java.util.Map;

public class ProblemSolution {
    private Map<String, String> code = new HashMap<>();
    private String explanation;
    private String timeComplexity;
    private String spaceComplexity;

    public ProblemSolution() {}

    public ProblemSolution(Map<String, String> code, String explanation, String timeComplexity, String spaceComplexity) {
        this.code = code != null ? code : new HashMap<>();
        this.explanation = explanation;
        this.timeComplexity = timeComplexity;
        this.spaceComplexity = spaceComplexity;
    }

    public Map<String, String> getCode() { return code; }
    public void setCode(Map<String, String> code) { this.code = code; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
}
