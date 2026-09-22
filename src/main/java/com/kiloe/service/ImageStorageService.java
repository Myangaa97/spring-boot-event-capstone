package com.kiloe.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final Path eventsDir;

    public ImageStorageService(@Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.eventsDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("events");
        Files.createDirectories(eventsDir);
    }

    public String storeEventImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("Only JPG, PNG, WEBP or GIF images are allowed");
        }

        String filename = UUID.randomUUID() + extension;

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, eventsDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        }

        return "/uploads/events/" + filename;
    }
}