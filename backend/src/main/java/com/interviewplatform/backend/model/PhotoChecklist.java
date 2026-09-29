package com.interviewplatform.backend.model;

public class PhotoChecklist {
    private boolean clearFace = true;
    private boolean plainBackground = true;
    private boolean noGlasses = true;
    private boolean goodLighting = true;

    public PhotoChecklist() {}

    public boolean isClearFace() { return clearFace; }
    public void setClearFace(boolean clearFace) { this.clearFace = clearFace; }

    public boolean isPlainBackground() { return plainBackground; }
    public void setPlainBackground(boolean plainBackground) { this.plainBackground = plainBackground; }

    public boolean isNoGlasses() { return noGlasses; }
    public void setNoGlasses(boolean noGlasses) { this.noGlasses = noGlasses; }

    public boolean isGoodLighting() { return goodLighting; }
    public void setGoodLighting(boolean goodLighting) { this.goodLighting = goodLighting; }
}
