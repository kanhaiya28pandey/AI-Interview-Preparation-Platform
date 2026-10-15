package com.interviewplatform.backend.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.interviewplatform.backend.model.ProblemExample;
import com.interviewplatform.backend.model.ProblemSolution;
import com.interviewplatform.backend.model.TestCase;

public class ExternalProblemImportRequest {

    private String source; // LEETCODE, CODEFORCES, GEEKSFORGEEKS, DATABASE_SQL, CUSTOM
    private String slug;
    private String title;
    private String difficulty;
    private String category;
    private List<String> tags = new ArrayList<>();

    // Structured problem fields
    private String description;
    private String inputFormat;
    private String outputFormat;
    private List<String> constraints = new ArrayList<>();
    private List<ProblemExample> examples = new ArrayList<>();
    private List<TestCase> testCases = new ArrayList<>();
    private Map<String, String> starterCode = new HashMap<>();
    private List<String> hints = new ArrayList<>();
    private ProblemSolution solution;
    private Integer xpReward;
    private String fnName;
    private String type;
    private String acceptance;

    public ExternalProblemImportRequest() {}

    public ExternalProblemImportRequest(String source, String slug, String title, String difficulty, String category, List<String> tags) {
        this.source = source;
        this.slug = slug;
        this.title = title;
        this.difficulty = difficulty;
        this.category = category;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

    public List<String> getConstraints() { return constraints; }
    public void setConstraints(List<String> constraints) { this.constraints = constraints != null ? constraints : new ArrayList<>(); }

    public List<ProblemExample> getExamples() { return examples; }
    public void setExamples(List<ProblemExample> examples) { this.examples = examples != null ? examples : new ArrayList<>(); }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases != null ? testCases : new ArrayList<>(); }

    public Map<String, String> getStarterCode() { return starterCode; }
    public void setStarterCode(Map<String, String> starterCode) { this.starterCode = starterCode != null ? starterCode : new HashMap<>(); }

    public List<String> getHints() { return hints; }
    public void setHints(List<String> hints) { this.hints = hints != null ? hints : new ArrayList<>(); }

    public ProblemSolution getSolution() { return solution; }
    public void setSolution(ProblemSolution solution) { this.solution = solution; }

    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public String getFnName() { return fnName; }
    public void setFnName(String fnName) { this.fnName = fnName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAcceptance() { return acceptance; }
    public void setAcceptance(String acceptance) { this.acceptance = acceptance; }
}
