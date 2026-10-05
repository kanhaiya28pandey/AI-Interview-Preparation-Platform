package com.interviewplatform.backend.model;

import java.util.ArrayList;
import java.util.List;

public class TestCase {
    private int id;
    private String inputStr;
    private String expectedStr;
    private List<Object> params = new ArrayList<>();
    private Object expectedVal;
    private boolean hidden = false;
    private int points = 25;

    public TestCase() {}

    public TestCase(int id, String inputStr, String expectedStr, List<Object> params, Object expectedVal) {
        this.id = id;
        this.inputStr = inputStr;
        this.expectedStr = expectedStr;
        this.params = params != null ? params : new ArrayList<>();
        this.expectedVal = expectedVal;
    }

    public TestCase(int id, String inputStr, String expectedStr, boolean hidden, int points) {
        this.id = id;
        this.inputStr = inputStr;
        this.expectedStr = expectedStr;
        this.hidden = hidden;
        this.points = points;
    }

    public TestCase(String idStr, String inputStr, String expectedStr, boolean hidden, int points) {
        setId(idStr);
        this.inputStr = inputStr;
        this.expectedStr = expectedStr;
        this.hidden = hidden;
        this.points = points;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public void setId(String idStr) {
        try {
            this.id = Integer.parseInt(idStr.replaceAll("\\D+", ""));
        } catch (Exception e) {
            this.id = 1;
        }
    }

    public String getInputStr() { return inputStr; }
    public void setInputStr(String inputStr) { this.inputStr = inputStr; }

    public String getExpectedStr() { return expectedStr; }
    public void setExpectedStr(String expectedStr) { this.expectedStr = expectedStr; }

    public List<Object> getParams() { return params; }
    public void setParams(List<Object> params) { this.params = params != null ? params : new ArrayList<>(); }

    public Object getExpectedVal() { return expectedVal; }
    public void setExpectedVal(Object expectedVal) { this.expectedVal = expectedVal; }

    public boolean isHidden() { return hidden; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}
