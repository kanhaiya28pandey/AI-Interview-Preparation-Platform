package com.interviewplatform.backend.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.interviewplatform.backend.model.Article;
import com.interviewplatform.backend.model.ArticleAuthor;
import com.interviewplatform.backend.model.CodingProblem;
import com.interviewplatform.backend.model.InterviewQuestion;
import com.interviewplatform.backend.model.InterviewRole;
import com.interviewplatform.backend.model.PracticeQuestion;
import com.interviewplatform.backend.model.PracticeTopic;
import com.interviewplatform.backend.model.ProblemExample;
import com.interviewplatform.backend.model.ProblemSolution;
import com.interviewplatform.backend.model.QuizQuestion;
import com.interviewplatform.backend.model.QuizTopic;
import com.interviewplatform.backend.model.SkillItem;
import com.interviewplatform.backend.model.TestCase;
import com.interviewplatform.backend.model.User;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.model.Verification;
import com.interviewplatform.backend.repository.ArticleRepository;
import com.interviewplatform.backend.repository.CodingProblemRepository;
import com.interviewplatform.backend.repository.InterviewQuestionRepository;
import com.interviewplatform.backend.repository.InterviewRoleRepository;
import com.interviewplatform.backend.repository.PracticeQuestionRepository;
import com.interviewplatform.backend.repository.PracticeTopicRepository;
import com.interviewplatform.backend.repository.QuizQuestionRepository;
import com.interviewplatform.backend.repository.QuizTopicRepository;
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
            CodingProblemRepository codingProblemRepository,
            QuizTopicRepository quizTopicRepository,
            QuizQuestionRepository quizQuestionRepository,
            PracticeTopicRepository practiceTopicRepository,
            PracticeQuestionRepository practiceQuestionRepository,
            ArticleRepository articleRepository,
            com.interviewplatform.backend.repository.SupportTicketRepository supportTicketRepository,
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
                }

                // 6. Seed Coding Problems if empty
                if (codingProblemRepository.count() == 0) {
                    CodingProblem twoSum = new CodingProblem();
                    twoSum.setId("two-sum");
                    twoSum.setTitle("1. Two Sum");
                    twoSum.setDifficulty("Easy");
                    twoSum.setCategory("Arrays & Hashing");
                    twoSum.setAcceptance("49.2%");
                    twoSum.setDescription("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.");
                    twoSum.setInputFormat("nums = [2,7,11,15], target = 9");
                    twoSum.setOutputFormat("[0,1]");
                    twoSum.setConstraints(List.of("2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"));
                    twoSum.setExamples(List.of(
                            new ProblemExample("[2,7,11,15], target = 9", "[0,1]", "Because nums[0] + nums[1] == 9, we return [0, 1].")
                    ));
                    twoSum.setStarterCode(Map.of(
                            "javascript", "function twoSum(nums, target) {\n  // Write your solution here\n}",
                            "python", "def two_sum(nums: list[int], target: int) -> list[int]:\n    pass",
                            "java", "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
                            "cpp", "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};"
                    ));
                    twoSum.setFnName("twoSum");
                    twoSum.setXpReward(50);
                    twoSum.setTestCases(List.of(
                            new TestCase(1, "nums = [2,7,11,15], target = 9", "[0,1]", List.of(List.of(2, 7, 11, 15), 9), List.of(0, 1)),
                            new TestCase(2, "nums = [3,2,4], target = 6", "[1,2]", List.of(List.of(3, 2, 4), 6), List.of(1, 2)),
                            new TestCase(3, "nums = [3,3], target = 6", "[0,1]", List.of(List.of(3, 3), 6), List.of(0, 1))
                    ));
                    twoSum.setHints(List.of("A brute force approach checks every pair in O(n^2). Can we use a hash map to do it in O(n)?"));
                    twoSum.setSolution(new ProblemSolution(
                            Map.of("javascript", "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}"),
                            "Use a hash map to store seen elements and look up complements in O(1).",
                            "O(n)", "O(n)"
                    ));

                    codingProblemRepository.save(twoSum);
                    log.info("Default coding problems seeded");
                }

                // 7. Seed Quiz Topics & Questions if empty
                if (quizTopicRepository.count() == 0) {
                    QuizTopic jsQuiz = new QuizTopic("quiz-js", "JavaScript & ES6+ Fundamentals",
                            "Test your knowledge of closures, prototypes, event loops, async/await, and modern ECMAScript features.",
                            "Language", 3, 10, "FileCode");
                    quizTopicRepository.save(jsQuiz);

                    List<QuizQuestion> qList = List.of(
                            new QuizQuestion("q-1", "quiz-js", "What will `console.log(typeof typeof 1)` output?",
                                    List.of("'number'", "'string'", "'undefined'", "'object'"), 1,
                                    "`typeof 1` returns `'number'`. `typeof 'number'` returns `'string'`."),
                            new QuizQuestion("q-2", "quiz-js", "Which of the following creates a block-scoped variable in modern JS?",
                                    List.of("var", "let and const", "function declaration", "global window object"), 1,
                                    "`let` and `const` provide block scope bound to the nearest curly braces."),
                            new QuizQuestion("q-3", "quiz-js", "What is the primary role of the JavaScript microtask queue?",
                                    List.of("Handling setTimeout/setInterval", "Handling Promise callbacks and MutationObserver callbacks with higher priority", "Handling DOM click events", "Garbage collection"), 1,
                                    "The microtask queue executes right after current script execution before the macrotask queue.")
                    );
                    quizQuestionRepository.saveAll(qList);
                    log.info("Default quiz topics & questions seeded");
                }

                // 8. Seed Practice Topics if empty
                if (practiceTopicRepository.count() == 0) {
                    PracticeTopic mernTopic = new PracticeTopic("mern-1", "MERN Architecture & Microservices",
                            "Full Stack", "Medium",
                            "Deep dive into Express middleware, React render optimization, Node event loop & MongoDB indexing.",
                            15, 9, "Layers", List.of("React", "Node.js", "Express", "MongoDB"));
                    practiceTopicRepository.save(mernTopic);

                    List<PracticeQuestion> pList = List.of(
                            new PracticeQuestion("pq-1", "mern-1", "Explain the difference between SQL and MongoDB indexing strategies",
                                    "Medium", "Compare B-Tree indexing in PostgreSQL/MySQL vs WiredTiger B-Trees in MongoDB for nested document queries.",
                                    List.of("Single vs compound keys", "Multikey indexes for array fields", "TTL and geospatial indexes"),
                                    "MongoDB uses WiredTiger engine B-trees. A critical advantage is multikey indexes which index each item in an array automatically.")
                    );
                    practiceQuestionRepository.saveAll(pList);
                    log.info("Default practice topics & questions seeded");
                }

                // 9. Seed Tech Articles if empty
                if (articleRepository.count() == 0) {
                    Article art1 = new Article();
                    art1.setId("art-1");
                    art1.setTitle("How to Answer 'Tell Me About a Time You Failed' Using the STAR Method");
                    art1.setSlug("star-method-behavioral-failure-question");
                    art1.setSummary("Master the classic behavioral trap. Learn how top candidates frame mistakes as high-impact growth opportunities with concrete metrics.");
                    art1.setCategory("Interview Prep");
                    art1.setAuthor(new ArticleAuthor("Ananya Sharma", "Ex-Google Staff Recruiter", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"));
                    art1.setReadTimeMinutes(6);
                    art1.setPublishedDate("2026-09-18");
                    art1.setTags(List.of("Behavioral", "HR", "STAR Method", "Interview Skills"));
                    art1.setViewsCount(1420);
                    art1.setLikesCount(382);
                    art1.setFeatured(true);
                    art1.setContent("""
                            # Mastering Behavioral Questions: The STAR Framework
                            
                            Behavioral interview questions are designed to uncover how you react under pressure, resolve conflict, and learn from past project setbacks.
                            
                            ## The STAR Blueprint
                            - **Situation**: Set the scene and give necessary context.
                            - **Task**: Describe your responsibility in the scenario.
                            - **Action**: Explain exactly what steps you took to address the issue.
                            - **Result**: Share the outcomes, quantified with data where possible.
                            """);

                    articleRepository.save(art1);
                    log.info("Default technical articles seeded");
                }

                // 8. Seed Initial Support Tickets
                if (supportTicketRepository.count() == 0) {
                    com.interviewplatform.backend.model.SupportTicket t1 = new com.interviewplatform.backend.model.SupportTicket(
                            "TCK-2026-0091",
                            student != null ? student.getId() : "student-1",
                            "Feature Request",
                            "Add dark mode preview for code editor syntax highlighting",
                            "The dark theme works cleanly on pages. Would love an option to customize editor font sizes and line numbers too.",
                            null,
                            null,
                            "Resolved",
                            "2026-09-24T14:30:00.000Z",
                            "Kanhaiya Pandey",
                            "kanhaiya.student@srmist.edu.in"
                    );

                    com.interviewplatform.backend.model.SupportTicket t2 = new com.interviewplatform.backend.model.SupportTicket(
                            "TCK-2026-0084",
                            student != null ? student.getId() : "student-1",
                            "Bug Report",
                            "Profile completion percentage display sync across components",
                            "Verified that profile completion ring in the topbar and sidebar updates immediately upon saving new personal details.",
                            null,
                            null,
                            "Resolved",
                            "2026-09-22T09:15:00.000Z",
                            "Kanhaiya Pandey",
                            "kanhaiya.student@srmist.edu.in"
                    );

                    supportTicketRepository.saveAll(List.of(t1, t2));
                    log.info("Default support tickets seeded");
                }

                // 9. Seed Additional Cohort Students for Rich Analytics
                String student2Email = "rahul.verma@vit.ac.in";
                if (!userRepository.existsByEmail(student2Email)) {
                    User s2 = new User("Rahul Verma", student2Email, passwordEncoder.encode("student123"), "STUDENT");
                    s2.setVerificationStatus("Verified");
                    s2 = userRepository.save(s2);

                    UserProfile p2 = new UserProfile(s2.getId(), s2.getName(), s2.getEmail());
                    p2.setCollege("Vellore Institute of Technology");
                    p2.setDegree("B.Tech");
                    p2.setBranch("Information Technology");
                    p2.setGraduationYear("2026");
                    p2.setRollNumber("21BIT0182");
                    p2.setActivityScore(68);
                    p2.setStreakDays(3);
                    p2.setVerificationStatus("Verified");
                    p2.setLastActive("3 days ago");
                    userProfileRepository.save(p2);
                }

                String student3Email = "sneha.kapur@bits.edu";
                if (!userRepository.existsByEmail(student3Email)) {
                    User s3 = new User("Sneha Kapur", student3Email, passwordEncoder.encode("student123"), "STUDENT");
                    s3.setVerificationStatus("Verified");
                    s3 = userRepository.save(s3);

                    UserProfile p3 = new UserProfile(s3.getId(), s3.getName(), s3.getEmail());
                    p3.setCollege("BITS Pilani");
                    p3.setDegree("B.E.");
                    p3.setBranch("Computer Science & Engineering");
                    p3.setGraduationYear("2025");
                    p3.setRollNumber("2021A7PS0042P");
                    p3.setActivityScore(94);
                    p3.setStreakDays(14);
                    p3.setVerificationStatus("Verified");
                    p3.setLastActive("1 hour ago");
                    userProfileRepository.save(p3);
                }

            } catch (Exception e) {
                log.warn("Database initialization check encountered an issue: {}", e.getMessage());
            }
        };
    }
}
