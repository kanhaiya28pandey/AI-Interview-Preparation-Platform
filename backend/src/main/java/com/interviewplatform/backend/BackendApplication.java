package com.interviewplatform.backend;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotenv();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadDotenv() {
		File[] candidates = new File[] { new File(".env"), new File("../.env") };
		for (File envFile : candidates) {
			if (envFile.exists() && envFile.isFile()) {
				try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) continue;
						int eqIdx = line.indexOf('=');
						if (eqIdx > 0) {
							String key = line.substring(0, eqIdx).trim();
							String val = line.substring(eqIdx + 1).trim();
							if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
								val = val.substring(1, val.length() - 1);
							} else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
								val = val.substring(1, val.length() - 1);
							}
							if ("MAIL_PASSWORD".equals(key)) {
								val = val.replace(" ", "");
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, val);
							}
						}
					}
				} catch (IOException ignored) {}
				break;
			}
		}
	}

	@Bean
	public ObjectMapper objectMapper() {
		return new ObjectMapper();
	}
}
