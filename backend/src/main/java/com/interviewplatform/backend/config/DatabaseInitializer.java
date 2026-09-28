package com.interviewplatform.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.interviewplatform.backend.model.SkillItem;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.UserProfileRepository;
import com.interviewplatform.backend.repository.UserRepository;
import com.interviewplatform.backend.repository.VerificationRepository;

@Configuration
public class DatabaseInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Bean
    CommandLineRunner initializeDatabase(
            MongoDatabaseFactory mongoDatabaseFactory,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            VerificationRepository verificationRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            try {
                String databaseName = mongoDatabaseFactory.getMongoDatabase().getName();
                log.info("Successfully connected to MongoDB Database: [{}]", databaseName);

                // 1. Seed Demo Admin if not present
                String adminEmail = "ananya.admin@aiinterviewprep.com";
                User admin = userRepository.findByEmail(adminEmail).orElse(null);
                if (admin == null) {
                    admin = new User();
                    admin.setName("Ananya Sharma");
                    admin.setEmail(adminEmail);
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole("ADMIN");
                    admin.setVerificationStatus("Verified");
                    admin.setBlocked(false);
                    admin = userRepository.save(admin);
                    log.info("Default Admin account seeded: {}", adminEmail);
                }

                // 2. Seed Demo Student if not present
                String studentEmail = "kanhaiya.student@srmist.edu.in";
                User student = userRepository.findByEmail(studentEmail).orElse(null);
                if (student == null) {
                    student = new User();
                    student.setName("Kanhaiya Pandey");
                    student.setEmail(studentEmail);
                    student.setPassword(passwordEncoder.encode("student123"));
                    student.setRole("STUDENT");
                    student.setVerificationStatus("Verified");
                    student.setBlocked(false);
                    student = userRepository.save(student);
                    log.info("Default Demo Student account seeded: {}", studentEmail);
                }

                // 3. Seed Demo Student Profile if not present
                if (student != null && !userProfileRepository.existsByUserId(student.getId())) {
                    UserProfile profile = new UserProfile(student.getId(), student.getName(), student.getEmail());
                    profile.setPreferredName("Kanhaiya");
                    profile.setHeadline("Aspiring Full Stack Engineer | MCA / B.Tech CS Student");
                    profile.setBio("Passionate Computer Science student specializing in React, TypeScript, Spring Boot, microservices architecture, and distributed web applications.");
                    profile.setPhone("+91 98765 43210");
                    profile.setCollege("SRM Institute of Science and Technology");
                    profile.setDegree("B.Tech Computer Science and Engineering");
                    profile.setGraduationYear("2026");
                    profile.setLocation("Chennai, Tamil Nadu, India");
                    profile.setLanguages(List.of("English", "Hindi", "Tamil"));
                    profile.setSkills(List.of("React", "TypeScript", "Java", "Spring Boot", "MongoDB", "Docker"));
                    profile.setSkillsList(List.of(
                            new SkillItem("React", "Technical", "Advanced"),
                            new SkillItem("TypeScript", "Technical", "Advanced"),
                            new SkillItem("Java", "Technical", "Advanced"),
                            new SkillItem("Spring Boot", "Technical", "Intermediate"),
                            new SkillItem("MongoDB", "Tools", "Advanced")
                    ));
                    profile.setVerificationStatus("Verified");
                    profile.setVerificationId("VER-2026-00101");
                    profile.setUpdatedAt(LocalDateTime.now().toString());
                    userProfileRepository.save(profile);
                    log.info("Default Student Profile seeded for: {}", studentEmail);
                }

                // 4. Seed Initial Verifications if empty
                if (verificationRepository.count() == 0 && student != null) {
                    Verification v1 = new Verification();
                    v1.setVerificationId("VER-2026-00101");
                    v1.setUserId(student.getId());
                    v1.setStudentName(student.getName());
                    v1.setEmail(student.getEmail());
                    v1.setCollegeName("SRM Institute of Science and Technology");
                    v1.setRollNumber("RA2111003010452");
                    v1.setCourseBranch("B.Tech CSE");
                    v1.setYearSemester("Year 4 / Semester 7");
                    v1.setIdCardFrontUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=600");
                    v1.setSubmittedAt(LocalDateTime.now().minusDays(3).toString());
                    v1.setStatus("Verified");
                    v1.setReviewedAt(LocalDateTime.now().minusDays(2).toString());

                    Verification v2 = new Verification();
                    v2.setVerificationId("VER-2026-00102");
                    v2.setUserId("usr-student-02");
                    v2.setStudentName("Rohan Verma");
                    v2.setEmail("rohan.verma@vit.ac.in");
                    v2.setCollegeName("Vellore Institute of Technology");
                    v2.setRollNumber("20BCE1042");
                    v2.setCourseBranch("B.Tech IT");
                    v2.setYearSemester("Year 3 / Semester 5");
                    v2.setIdCardFrontUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=600");
                    v2.setSubmittedAt(LocalDateTime.now().minusHours(4).toString());
                    v2.setStatus("Pending Verification");

                    verificationRepository.saveAll(List.of(v1, v2));
                    log.info("Default Verification submissions seeded for admin queue testing");
                }

            } catch (Exception e) {
                log.warn("Database initialization check encountered an issue (MongoDB may be connecting lazily): {}", e.getMessage());
            }
        };
    }
}
