package com.interviewplatform.backend.model;

import java.util.List;

public class TestCase {
    private int id;
    private String inputStr;
    private String expectedStr;
    private List<Object> params;
    private Object expectedVal;

    public TestCase() {}

    public TestCase(int id, String inputStr, String expectedStr, List<Object> params, Object expectedVal) {
        this.id = id;
        this.inputStr = inputStr;
        this.expectedStr = expectedStr;
        this.params = params;
        this.expectedVal = expectedVal;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getInputStr() { return inputStr; }
    public void setInputStr(String inputStr) { this.inputStr = inputStr; }

    public String getExpectedStr() { return expectedStr; }
    public void setExpectedStr(String expectedStr) { this.expectedStr = expectedStr; }

    public List<Object> getParams() { return params; }
    public void setParams(List<Object> params) { this.params = params; }

    public Object getExpectedVal() { return expectedVal; }
    public void setExpectedVal(Object expectedVal) { this.expectedVal = expectedVal; }
}
