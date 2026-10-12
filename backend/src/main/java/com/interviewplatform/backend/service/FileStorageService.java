package com.interviewplatform.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp", "pdf"
    );

    @Value("${file.upload-dir:uploads}")
    private String baseUploadDir;

    private Path rootStoragePath;

    @PostConstruct
    public void init() {
        this.rootStoragePath = Paths.get(baseUploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootStoragePath);
            Files.createDirectories(this.rootStoragePath.resolve("verifications"));
            Files.createDirectories(this.rootStoragePath.resolve("resumes"));
            log.info("Initialized secure file upload storage directory at: [{}]", this.rootStoragePath);
        } catch (IOException e) {
            log.error("Failed to initialize file upload directory: {}", e.getMessage());
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty or missing file.");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        String cleanOriginalName = rawOriginalFilename != null ? StringUtils.cleanPath(rawOriginalFilename) : "document";

        if (cleanOriginalName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + cleanOriginalName);
        }

        String extension = getFileExtension(cleanOriginalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Invalid file type: ." + extension + ". Allowed formats: JPG, JPEG, PNG, WEBP, PDF.");
        }

        try {
            Path targetDir = this.rootStoragePath;
            if (subDirectory != null && !subDirectory.isBlank()) {
                targetDir = this.rootStoragePath.resolve(StringUtils.cleanPath(subDirectory)).normalize();
                if (!targetDir.startsWith(this.rootStoragePath)) {
                    throw new IllegalArgumentException("Invalid sub-directory path");
                }
                Files.createDirectories(targetDir);
            }

            String uniqueName = UUID.randomUUID().toString().substring(0, 12) + "_" + cleanOriginalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path targetLocation = targetDir.resolve(uniqueName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativeSubPath = subDirectory != null && !subDirectory.isBlank() ? subDirectory + "/" + uniqueName : uniqueName;
            log.info("File stored successfully: [{}]", targetLocation);

            return "/uploads/" + relativeSubPath.replace("\\", "/");
        } catch (IOException ex) {
            log.error("Failed to store file [{}]: {}", cleanOriginalName, ex.getMessage());
            throw new RuntimeException("Failed to store file on disk: " + ex.getMessage(), ex);
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            Path filePath = this.rootStoragePath.resolve(StringUtils.cleanPath(relativePath)).normalize();
            if (!filePath.startsWith(this.rootStoragePath)) {
                throw new IllegalArgumentException("Access denied: path traversal attempt");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("File not found or not readable: " + relativePath);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Could not read file: " + relativePath, ex);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
