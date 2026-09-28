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

import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.model.SkillItem;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.InterviewQuestionRepository;
import com.interviewplatform.backend.repository.InterviewRoleRepository;
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
            InterviewRoleRepository interviewRoleRepository,
            InterviewQuestionRepository interviewQuestionRepository,
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

                // 5. Seed Interview Roles if empty
                if (interviewRoleRepository.count() == 0) {
                    List<InterviewRole> roles = List.of(
                            new InterviewRole("behavioral-star", "HR & STAR Behavioral Round", "Behavioral", "Junior", 20,
                                    "Evaluates soft skills, conflict resolution, project failures, and leadership scenarios using the STAR method.", "Users", 3),
                            new InterviewRole("frontend-react", "Senior Frontend Engineer (React/TypeScript)", "Frontend", "Senior", 25,
                                    "Evaluates modern React 19 concurrent features, virtual DOM reconciliation, state management patterns & performance profiling.", "Layout", 4),
                            new InterviewRole("backend-java", "Java & Spring Microservices Engineer", "Backend", "Mid-Level", 30,
                                    "Focuses on Spring Boot security, multithreading concurrency, REST API design, database transactions and JPA/Hibernate.", "Server", 4),
                            new InterviewRole("fullstack-mern", "Full Stack MERN Developer", "Full Stack", "Mid-Level", 30,
                                    "Covers end-to-end web architecture, Node.js event loop, Express middleware, JWT auth & MongoDB aggregation pipelines.", "Code2", 4),
                            new InterviewRole("system-design", "Distributed Systems & System Architecture", "System Design", "Lead", 35,
                                    "High availability design for TinyURL, Rate Limiters, Distributed Caching (Redis), Kafka messaging and database sharding.", "Layers", 3)
                    );
                    interviewRoleRepository.saveAll(roles);

                    // Seed Sample Questions for Frontend Role
                    List<InterviewQuestion> reactQuestions = List.of(
                            new InterviewQuestion("fe-q1", "frontend-react", 1,
                                    "How does the React Fiber reconciliation engine work, and how does it prevent blocking the browser's main thread during heavy re-renders?",
                                    "React Internals",
                                    List.of("Fiber node tree data structure", "Incremental rendering & work units", "Time slicing via requestIdleCallback/MessageChannel"),
                                    "What is the difference between synchronous rendering and concurrent interrupts?"),
                            new InterviewQuestion("fe-q2", "frontend-react", 2,
                                    "Explain the mental model of React Server Components (RSC) versus Client Components in Next.js/React 19.",
                                    "Next.js & RSC",
                                    List.of("Zero bundle size for server components", "Direct database access without REST boilerplate", "Serialization boundary across props"),
                                    "How do client and server components interleave in the component tree?"),
                            new InterviewQuestion("fe-q3", "frontend-react", 3,
                                    "How do you profile, identify, and eliminate unnecessary re-renders in a complex React dashboard with high-frequency live data updates?",
                                    "Performance Optimization",
                                    List.of("React DevTools Profiler flamegraphs", "Proper memoization with useMemo/useCallback", "Context splitting and state colocation"),
                                    "When does memoization actually hurt performance?")
                    );
                    interviewQuestionRepository.saveAll(reactQuestions);

                    log.info("Default Interview Roles and Question banks seeded");
                }

            } catch (Exception e) {
                log.warn("Database initialization check encountered an issue: {}", e.getMessage());
            }
        };
    }
}
