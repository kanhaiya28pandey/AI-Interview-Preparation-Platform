package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class ExecutionResult {
    private String status; // "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "COMPILE_ERROR", "RUNTIME_ERROR"
    private double runtimeMs;
    private int memoryMb;
    private int passedTests;
    private int totalTests;
    private List<String> outputLogs = new ArrayList<>();
    private String errorMessage;
    private Integer errorLineNumber;
    private List<TestCaseResult> testCaseResults = new ArrayList<>();
    private boolean isSimulated = false;
    private boolean hasNestedLoopsAdvisory = false;

    public ExecutionResult() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getRuntimeMs() { return runtimeMs; }
    public void setRuntimeMs(double runtimeMs) { this.runtimeMs = runtimeMs; }

    public int getMemoryMb() { return memoryMb; }
    public void setMemoryMb(int memoryMb) { this.memoryMb = memoryMb; }

    public int getPassedTests() { return passedTests; }
    public void setPassedTests(int passedTests) { this.passedTests = passedTests; }

    public int getTotalTests() { return totalTests; }
    public void setTotalTests(int totalTests) { this.totalTests = totalTests; }

    public List<String> getOutputLogs() { return outputLogs; }
    public void setOutputLogs(List<String> outputLogs) { this.outputLogs = outputLogs; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Integer getErrorLineNumber() { return errorLineNumber; }
    public void setErrorLineNumber(Integer errorLineNumber) { this.errorLineNumber = errorLineNumber; }

    public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }

    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }

    public boolean isHasNestedLoopsAdvisory() { return hasNestedLoopsAdvisory; }
    public void setHasNestedLoopsAdvisory(boolean hasNestedLoopsAdvisory) { this.hasNestedLoopsAdvisory = hasNestedLoopsAdvisory; }
}
