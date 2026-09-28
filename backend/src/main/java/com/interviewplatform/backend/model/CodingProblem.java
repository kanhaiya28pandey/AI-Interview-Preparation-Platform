package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "coding_problems")
public class CodingProblem {

    @Id
    private String id;

    private String title;
    private String difficulty; // "Easy" | "Medium" | "Hard"
    private String category;
    private String acceptance = "52.0%";
    private String description;
    private String inputFormat;
    private String outputFormat;
    private List<String> constraints = new ArrayList<>();
    private List<ProblemExample> examples = new ArrayList<>();
    private Map<String, String> starterCode = new HashMap<>();
    private String fnName;
    private int xpReward = 50;
    private List<TestCase> testCases = new ArrayList<>();
    private List<String> hints = new ArrayList<>();
    private ProblemSolution solution = new ProblemSolution();
    private String status = "ACTIVE";

    public CodingProblem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAcceptance() { return acceptance; }
    public void setAcceptance(String acceptance) { this.acceptance = acceptance; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

    public List<String> getConstraints() { return constraints; }
    public void setConstraints(List<String> constraints) { this.constraints = constraints; }

    public List<ProblemExample> getExamples() { return examples; }
    public void setExamples(List<ProblemExample> examples) { this.examples = examples; }

    public Map<String, String> getStarterCode() { return starterCode; }
    public void setStarterCode(Map<String, String> starterCode) { this.starterCode = starterCode; }

    public String getFnName() { return fnName; }
    public void setFnName(String fnName) { this.fnName = fnName; }

    public int getXpReward() { return xpReward; }
    public void setXpReward(int xpReward) { this.xpReward = xpReward; }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }

    public List<String> getHints() { return hints; }
    public void setHints(List<String> hints) { this.hints = hints; }

    public ProblemSolution getSolution() { return solution; }
    public void setSolution(ProblemSolution solution) { this.solution = solution; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
