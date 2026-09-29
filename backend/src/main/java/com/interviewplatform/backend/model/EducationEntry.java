package com.interviewplatform.backend.model;

import java.util.List;

public class EducationEntry {
    private String id;
    private String degree;
    private String institution;
    private String fieldOfStudy;
    private String startYear;
    private String endYear;
    private boolean isCurrentlyStudying;
    private String grade;
    private List<String> coursework;
    private String yearSemester;

    public EducationEntry() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getFieldOfStudy() { return fieldOfStudy; }
    public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }

    public String getStartYear() { return startYear; }
    public void setStartYear(String startYear) { this.startYear = startYear; }

    public String getEndYear() { return endYear; }
    public void setEndYear(String endYear) { this.endYear = endYear; }

    public boolean isCurrentlyStudying() { return isCurrentlyStudying; }
    public void setCurrentlyStudying(boolean currentlyStudying) { isCurrentlyStudying = currentlyStudying; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public List<String> getCoursework() { return coursework; }
    public void setCoursework(List<String> coursework) { this.coursework = coursework; }

    public String getYearSemester() { return yearSemester; }
    public void setYearSemester(String yearSemester) { this.yearSemester = yearSemester; }
}
