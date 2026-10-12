package com.interviewplatform.backend.service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentParserService {

    private static final Logger log = LoggerFactory.getLogger(DocumentParserService.class);

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType().toLowerCase() : "";

        try {
            if (originalFilename.endsWith(".pdf") || contentType.contains("pdf")) {
                return extractTextFromPdf(file.getInputStream());
            } else if (originalFilename.endsWith(".docx") || contentType.contains("wordprocessingml")) {
                String docxText = extractTextFromDocx(file.getInputStream());
                if (!docxText.isBlank()) {
                    return docxText;
                }
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else if (originalFilename.endsWith(".txt") || contentType.contains("text/plain")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                // Fallback attempt for other documents or extract text cleanly
                try {
                    return extractTextFromPdf(file.getInputStream());
                } catch (Exception e1) {
                    try {
                        String docxAttempt = extractTextFromDocx(file.getInputStream());
                        if (!docxAttempt.isBlank()) return docxAttempt;
                    } catch (Exception ignored) {}
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse document text from file [{}]: {}", file.getOriginalFilename(), e.getMessage());
            throw new RuntimeException("Could not read resume text from uploaded document. Ensure it is a valid PDF, Word or text document.");
        }
    }

    private String extractTextFromPdf(InputStream inputStream) throws Exception {
        byte[] bytes = inputStream.readAllBytes();
        try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            if (text == null || text.trim().isEmpty()) {
                log.warn("Extracted PDF text is blank or scanned image without OCR layer");
            }
            return text != null ? text.trim() : "";
        }
    }

    private String extractTextFromDocx(InputStream inputStream) {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(inputStream)) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equalsIgnoreCase(entry.getName())) {
                    byte[] bytes = zis.readAllBytes();
                    String xml = new String(bytes, StandardCharsets.UTF_8);
                    return xml.replaceAll("<[^>]+>", " ")
                              .replaceAll("&lt;", "<")
                              .replaceAll("&gt;", ">")
                              .replaceAll("&amp;", "&")
                              .replaceAll("&quot;", "\"")
                              .replaceAll("&apos;", "'")
                              .replaceAll("\\s+", " ")
                              .trim();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse docx entry: {}", e.getMessage());
        }
        return "";
    }
}
