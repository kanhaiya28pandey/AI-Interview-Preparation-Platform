package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class TestCaseResult {
    private int id;
    private String inputStr;
    private String expectedStr;
    private String actualStr;
    private boolean passed;
    private String error;
    private double runtimeMs;
    private List<String> logs = new ArrayList<>();

    public TestCaseResult() {}

    public TestCaseResult(int id, String inputStr, String expectedStr, String actualStr, boolean passed, double runtimeMs) {
        this.id = id;
        this.inputStr = inputStr;
        this.expectedStr = expectedStr;
        this.actualStr = actualStr;
        this.passed = passed;
        this.runtimeMs = runtimeMs;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getInputStr() { return inputStr; }
    public void setInputStr(String inputStr) { this.inputStr = inputStr; }

    public String getExpectedStr() { return expectedStr; }
    public void setExpectedStr(String expectedStr) { this.expectedStr = expectedStr; }

    public String getActualStr() { return actualStr; }
    public void setActualStr(String actualStr) { this.actualStr = actualStr; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public double getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(double runtimeMs) { this.runtimeMs = runtimeMs; }

    public List<String> getLogs() { return logs; }
    public void setLogs(List<String> logs) { this.logs = logs; }
}
