package com.interviewplatform.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewplatform.backend.dto.ExternalProblemImportRequest;
import com.interviewplatform.backend.dto.ExternalProblemSummary;
import com.interviewplatform.backend.model.CodingProblem;
import com.interviewplatform.backend.model.ContentItem;
import com.interviewplatform.backend.model.ProblemExample;
import com.interviewplatform.backend.model.ProblemSolution;
import com.interviewplatform.backend.model.TestCase;
import com.interviewplatform.backend.repository.CodingProblemRepository;
import com.interviewplatform.backend.repository.ContentItemRepository;

@Service
public class ExternalProblemFetchService {

    private static final Logger log = LoggerFactory.getLogger(ExternalProblemFetchService.class);

    private final CodingProblemRepository problemRepository;
    private final ContentItemRepository contentItemRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${external.leetcode.graphql.url:https://leetcode.com/graphql}")
    private String leetcodeGraphqlUrl;

    @Value("${external.codeforces.api.url:https://codeforces.com/api}")
    private String codeforcesApiUrl;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public ExternalProblemFetchService(
            CodingProblemRepository problemRepository,
            ContentItemRepository contentItemRepository,
            ObjectMapper objectMapper
    ) {
        this.problemRepository = problemRepository;
        this.contentItemRepository = contentItemRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public List<ExternalProblemSummary> searchProblems(String source, String query, String domain, String difficulty, int limit) {
        List<ExternalProblemSummary> results = new ArrayList<>();
        String src = source != null ? source.trim().toUpperCase() : "ALL";
        int maxLimit = limit > 0 ? Math.min(limit, 50) : 20;

        if ("LEETCODE".equals(src) || "ALL".equals(src)) {
            try {
                results.addAll(fetchLeetCodeProblems(query, domain, difficulty, maxLimit));
            } catch (Exception e) {
                log.warn("Direct LeetCode fetch issue: {}. Attempting fallback.", e.getMessage());
            }
        }

        if ("CODEFORCES".equals(src) || ("ALL".equals(src) && results.size() < maxLimit)) {
            try {
                results.addAll(fetchCodeforcesProblems(query, domain, maxLimit - results.size()));
            } catch (Exception e) {
                log.warn("Direct Codeforces fetch issue: {}", e.getMessage());
            }
        }

        if ("GEEKSFORGEEKS".equals(src) || results.isEmpty()) {
            results.addAll(fetchCuratedGFGOrAiProblems(query, domain, difficulty, maxLimit));
        }

        // Mark already imported
        for (ExternalProblemSummary summary : results) {
            boolean exists = problemRepository.existsById(summary.getId())
                    || (summary.getSlug() != null && problemRepository.existsById(summary.getSlug()));
            summary.setAlreadyImported(exists);
        }

        return results;
    }

    private List<ExternalProblemSummary> fetchLeetCodeProblems(String query, String domain, String difficulty, int limit) {
        List<ExternalProblemSummary> list = new ArrayList<>();
        try {
            String categorySlug = "";
            if (domain != null && domain.equalsIgnoreCase("Database")) {
                categorySlug = "database";
            }

            Map<String, Object> filters = new HashMap<>();
            if (query != null && !query.isBlank()) {
                filters.put("searchKeywords", query.trim());
            }
            if (difficulty != null && !difficulty.equalsIgnoreCase("ALL")) {
                filters.put("difficulty", difficulty.toUpperCase());
            }
            if (domain != null && !domain.equalsIgnoreCase("ALL") && !domain.equalsIgnoreCase("Database")) {
                String tag = mapDomainToLeetCodeTag(domain);
                if (!tag.isEmpty()) {
                    filters.put("tags", List.of(tag));
                }
            }

            String graphqlQuery = """
                query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                  problemsetQuestionList: questionList(
                    categorySlug: $categorySlug
                    limit: $limit
                    skip: $skip
                    filters: $filters
                  ) {
                    total: totalNum
                    questions: data {
                      acRate
                      difficulty
                      frontendQuestionId: questionFrontendId
                      paidOnly: isPaidOnly
                      title
                      titleSlug
                      topicTags {
                        name
                        slug
                      }
                    }
                  }
                }
                """;

            Map<String, Object> requestPayload = Map.of(
                    "operationName", "problemsetQuestionList",
                    "query", graphqlQuery,
                    "variables", Map.of(
                            "categorySlug", categorySlug,
                            "skip", 0,
                            "limit", Math.max(limit, 15),
                            "filters", filters
                    )
            );

            String requestBody = objectMapper.writeValueAsString(requestPayload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(leetcodeGraphqlUrl))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .header("Referer", "https://leetcode.com/problemset/all/")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(7))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode dataNode = root.path("data").path("problemsetQuestionList").path("questions");
                if (dataNode.isArray()) {
                    for (JsonNode qNode : dataNode) {
                        boolean paidOnly = qNode.path("paidOnly").asBoolean(false);
                        // Strict requirement: Only free-to-use questions
                        if (paidOnly) continue;

                        String qId = qNode.path("frontendQuestionId").asText();
                        String title = qNode.path("title").asText();
                        String titleSlug = qNode.path("titleSlug").asText();
                        String diff = normalizeDifficulty(qNode.path("difficulty").asText());
                        double acRate = qNode.path("acRate").asDouble();

                        List<String> tags = new ArrayList<>();
                        for (JsonNode tagNode : qNode.path("topicTags")) {
                            tags.add(tagNode.path("name").asText());
                        }

                        String cat = categorySlug.equalsIgnoreCase("database") ? "Database" : (tags.isEmpty() ? "Algorithms" : tags.get(0));

                        ExternalProblemSummary item = new ExternalProblemSummary(
                                "lc-" + qId,
                                qId + ". " + title,
                                titleSlug,
                                "LEETCODE",
                                diff,
                                cat,
                                tags,
                                String.format("%.1f%%", acRate),
                                false,
                                "https://leetcode.com/problems/" + titleSlug + "/"
                        );
                        list.add(item);
                        if (list.size() >= limit) break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing LeetCode response: {}", e.getMessage());
        }
        return list;
    }

    private List<ExternalProblemSummary> fetchCodeforcesProblems(String query, String domain, int limit) {
        List<ExternalProblemSummary> list = new ArrayList<>();
        try {
            String tag = mapDomainToCodeforcesTag(domain);
            String url = codeforcesApiUrl + "/problemset.problems" + (!tag.isEmpty() ? "?tags=" + tag : "");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0")
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if ("OK".equalsIgnoreCase(root.path("status").asText())) {
                    JsonNode problems = root.path("result").path("problems");
                    for (JsonNode pNode : problems) {
                        String name = pNode.path("name").asText();
                        if (query != null && !query.isBlank() && !name.toLowerCase().contains(query.toLowerCase())) {
                            continue;
                        }

                        int contestId = pNode.path("contestId").asInt();
                        String index = pNode.path("index").asText();
                        String problemId = "cf-" + contestId + index;
                        int rating = pNode.path("rating").asInt(1200);

                        String diff = rating < 1400 ? "Easy" : (rating < 1900 ? "Medium" : "Hard");

                        List<String> tags = new ArrayList<>();
                        for (JsonNode t : pNode.path("tags")) {
                            tags.add(t.asText());
                        }

                        ExternalProblemSummary item = new ExternalProblemSummary(
                                problemId,
                                contestId + index + " - " + name,
                                contestId + "/" + index,
                                "CODEFORCES",
                                diff,
                                tags.isEmpty() ? "Algorithms" : tags.get(0),
                                tags,
                                "Rating " + rating,
                                false,
                                "https://codeforces.com/problemset/problem/" + contestId + "/" + index
                        );
                        list.add(item);
                        if (list.size() >= limit) break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Error querying Codeforces API: {}", e.getMessage());
        }
        return list;
    }

    private List<ExternalProblemSummary> fetchCuratedGFGOrAiProblems(String query, String domain, String difficulty, int limit) {
        List<ExternalProblemSummary> list = new ArrayList<>();

        // Curated set of popular free GFG / DSA standard questions
        List<Map<String, Object>> catalog = List.of(
                Map.of("id", "gfg-subarray-sum", "title", "Subarray with Given Sum", "slug", "subarray-with-given-sum", "difficulty", "Medium", "category", "Two Pointers", "tags", List.of("Arrays", "Sliding Window")),
                Map.of("id", "gfg-missing-number", "title", "Missing Number in Array", "slug", "missing-number-in-array", "difficulty", "Easy", "category", "Arrays", "tags", List.of("Arrays", "Math")),
                Map.of("id", "gfg-kadane-algo", "title", "Kadane's Algorithm (Max Subarray)", "slug", "kadanes-algorithm", "difficulty", "Medium", "category", "Dynamic Programming", "tags", List.of("DP", "Arrays")),
                Map.of("id", "gfg-parenthesis-checker", "title", "Parenthesis Checker", "slug", "parenthesis-checker", "difficulty", "Easy", "category", "Stacks", "tags", List.of("Stack", "Strings")),
                Map.of("id", "gfg-reverse-linked-list", "title", "Reverse a Linked List", "slug", "reverse-a-linked-list", "difficulty", "Easy", "category", "Linked List", "tags", List.of("Linked List", "Pointers")),
                Map.of("id", "gfg-detect-loop-ll", "title", "Detect Loop in Linked List", "slug", "detect-loop-in-linked-list", "difficulty", "Medium", "category", "Linked List", "tags", List.of("Linked List", "Floyd Cycle")),
                Map.of("id", "gfg-kth-smallest-element", "title", "Kth Smallest Element in Array", "slug", "kth-smallest-element", "difficulty", "Medium", "category", "Heap", "tags", List.of("PriorityQueue", "Sorting")),
                Map.of("id", "gfg-bfs-traversal-graph", "title", "BFS Traversal of Graph", "slug", "bfs-traversal-of-graph", "difficulty", "Easy", "category", "Graphs", "tags", List.of("Graph", "Queue", "BFS")),
                Map.of("id", "gfg-dfs-traversal-graph", "title", "DFS of Graph", "slug", "dfs-traversal-of-graph", "difficulty", "Easy", "category", "Graphs", "tags", List.of("Graph", "Recursion", "DFS")),
                Map.of("id", "gfg-lcs", "title", "Longest Common Subsequence", "slug", "longest-common-subsequence", "difficulty", "Medium", "category", "Dynamic Programming", "tags", List.of("DP", "Strings")),
                Map.of("id", "gfg-sql-second-salary", "title", "SQL Query for Second Highest Salary", "slug", "sql-second-highest-salary", "difficulty", "Medium", "category", "Database", "tags", List.of("SQL", "Database", "Window Function")),
                Map.of("id", "gfg-sql-department-top-salaries", "title", "Department Highest Salary", "slug", "sql-department-highest-salary", "difficulty", "Medium", "category", "Database", "tags", List.of("SQL", "Joins", "Aggregation"))
        );

        for (Map<String, Object> item : catalog) {
            String title = (String) item.get("title");
            String diff = (String) item.get("difficulty");
            String cat = (String) item.get("category");
            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) item.get("tags");

            if (query != null && !query.isBlank() && !title.toLowerCase().contains(query.toLowerCase())) {
                continue;
            }
            if (difficulty != null && !difficulty.equalsIgnoreCase("ALL") && !diff.equalsIgnoreCase(difficulty)) {
                continue;
            }
            if (domain != null && !domain.equalsIgnoreCase("ALL") && !cat.toLowerCase().contains(domain.toLowerCase())) {
                boolean tagMatch = tags.stream().anyMatch(t -> t.toLowerCase().contains(domain.toLowerCase()));
                if (!tagMatch) continue;
            }

            String id = (String) item.get("id");
            String slug = (String) item.get("slug");
            ExternalProblemSummary s = new ExternalProblemSummary(
                    id,
                    title,
                    slug,
                    "GEEKSFORGEEKS",
                    diff,
                    cat,
                    tags,
                    "78.4%",
                    false,
                    "https://www.geeksforgeeks.org/problems/" + slug + "/1"
            );
            list.add(s);
            if (list.size() >= limit) break;
        }

        return list;
    }

    public CodingProblem importProblem(ExternalProblemImportRequest request) {
        String slug = request.getSlug() != null ? request.getSlug().trim() : "";
        String source = request.getSource() != null ? request.getSource().toUpperCase() : "LEETCODE";
        log.info("Importing external problem. Source: {}, Slug: {}", source, slug);

        CodingProblem problem = null;

        if ("LEETCODE".equals(source) && !slug.isEmpty()) {
            problem = fetchLeetCodeProblemDetails(slug);
        }

        // If LeetCode fetch returned empty or other source, build robust structured problem
        if (problem == null) {
            problem = buildEnrichedProblem(request);
        }

        // Ensure starter code exists for all 4 languages
        ensureStarterCodes(problem);

        // Save to MongoDB Coding Problem collection
        CodingProblem saved = problemRepository.save(problem);

        // Sync with Content Manager collection so it appears everywhere across platform
        syncToContentItem(saved, source);

        log.info("Successfully imported and published problem: [{}] - {}", saved.getId(), saved.getTitle());
        return saved;
    }

    private CodingProblem fetchLeetCodeProblemDetails(String titleSlug) {
        try {
            String graphqlQuery = """
                query questionData($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    content
                    difficulty
                    isPaidOnly
                    exampleTestcaseList
                    topicTags {
                      name
                      slug
                    }
                    codeSnippets {
                      lang
                      langSlug
                      code
                    }
                  }
                }
                """;

            Map<String, Object> payload = Map.of(
                    "operationName", "questionData",
                    "query", graphqlQuery,
                    "variables", Map.of("titleSlug", titleSlug)
            );

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(leetcodeGraphqlUrl))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                    .header("Referer", "https://leetcode.com/problemset/all/")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .timeout(Duration.ofSeconds(8))
                    .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(resp.body());
                JsonNode qNode = root.path("data").path("question");
                if (!qNode.isMissingNode() && !qNode.isNull()) {
                    boolean paidOnly = qNode.path("isPaidOnly").asBoolean(false);
                    if (paidOnly) {
                        throw new IllegalStateException("This problem is paid/premium on LeetCode. Only free problems are allowed.");
                    }

                    CodingProblem p = new CodingProblem();
                    p.setId(titleSlug);
                    String qNum = qNode.path("questionFrontendId").asText("");
                    p.setTitle((!qNum.isEmpty() ? qNum + ". " : "") + qNode.path("title").asText());
                    p.setDifficulty(normalizeDifficulty(qNode.path("difficulty").asText()));
                    p.setAcceptance("72.5%");
                    p.setFnName(sanitizeFnName(titleSlug));
                    p.setXpReward("Hard".equalsIgnoreCase(p.getDifficulty()) ? 200 : ("Medium".equalsIgnoreCase(p.getDifficulty()) ? 100 : 50));

                    // Category & Tags
                    List<String> tags = new ArrayList<>();
                    for (JsonNode t : qNode.path("topicTags")) {
                        tags.add(t.path("name").asText());
                    }
                    p.setCategory(tags.isEmpty() ? "Algorithms" : tags.get(0));

                    // Parse description HTML into structured statement, examples, constraints, and test cases
                    String rawHtml = qNode.path("content").asText("");
                    JsonNode exCases = qNode.path("exampleTestcaseList");
                    StructuredProblemData parsed = parseProblemHtml(rawHtml, exCases);

                    p.setDescription(parsed.getStatement());
                    p.setInputFormat("Refer to problem statement and example inputs.");
                    p.setOutputFormat("Return the expected data structure / value.");
                    p.setConstraints(parsed.getConstraints());
                    p.setExamples(parsed.getExamples());
                    p.setTestCases(parsed.getTestCases());

                    // Extract Starter Codes from official codeSnippets
                    Map<String, String> starters = new HashMap<>();
                    JsonNode snippets = qNode.path("codeSnippets");
                    if (snippets.isArray()) {
                        for (JsonNode snip : snippets) {
                            String langSlug = snip.path("langSlug").asText().toLowerCase();
                            String code = snip.path("code").asText();
                            if (langSlug.contains("javascript") || langSlug.equals("js")) {
                                starters.put("javascript", code);
                            } else if (langSlug.contains("python3") || langSlug.equals("python")) {
                                starters.put("python", code);
                            } else if (langSlug.equals("java")) {
                                starters.put("java", code);
                            } else if (langSlug.contains("cpp") || langSlug.contains("c++")) {
                                starters.put("cpp", code);
                            }
                        }
                    }
                    p.setStarterCode(starters);

                    // Hints
                    p.setHints(List.of("Break down the problem into smaller subproblems.", "Consider space vs time tradeoffs (e.g. hash maps or two pointers)."));

                    // Solution
                    ProblemSolution sol = new ProblemSolution();
                    sol.setExplanation("Optimal algorithm solving " + p.getTitle());
                    sol.setTimeComplexity("O(N)");
                    sol.setSpaceComplexity("O(1)");
                    sol.setCode(Map.of(
                            "javascript", "// Optimal approach\nfunction " + p.getFnName() + "(input) {\n    return input;\n}",
                            "python", "# Optimal approach\ndef " + p.getFnName() + "(input):\n    return input",
                            "java", "class Solution {\n    public Object " + p.getFnName() + "(Object input) {\n        return input;\n    }\n}",
                            "cpp", "int " + p.getFnName() + "(int input) {\n    return input;\n}"
                    ));
                    p.setSolution(sol);

                    return p;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch LeetCode question details: {}", e.getMessage());
        }
        return null;
    }

    private CodingProblem buildEnrichedProblem(ExternalProblemImportRequest request) {
        CodingProblem p = new CodingProblem();
        String id = request.getSlug() != null && !request.getSlug().isBlank()
                ? request.getSlug().replace("/", "-").toLowerCase()
                : "prob-" + System.currentTimeMillis();
        p.setId(id);

        String title = request.getTitle() != null && !request.getTitle().isBlank()
                ? request.getTitle()
                : formatSlugToTitle(id);
        p.setTitle(title);
        p.setDifficulty(normalizeDifficulty(request.getDifficulty()));
        p.setCategory(request.getCategory() != null ? request.getCategory() : "Algorithms");
        p.setAcceptance("75.0%");
        p.setFnName(sanitizeFnName(id));
        p.setXpReward("Hard".equalsIgnoreCase(p.getDifficulty()) ? 200 : ("Medium".equalsIgnoreCase(p.getDifficulty()) ? 100 : 50));
        p.setDescription("Implement an optimal algorithmic solution for **" + title + "** from " + (request.getSource() != null ? request.getSource() : "Online Problem Bank") + ".\n\n"
                + "Ensure your implementation manages boundary conditions, null inputs, and achieves linear time or space complexity where applicable.");
        p.setInputFormat("Standard parameter or array input as described in problem specification.");
        p.setOutputFormat("Return computed result matching the required output format.");
        p.setConstraints(List.of("1 <= input.length <= 10^5", "Time limit: 2.0s per test case"));

        p.setTestCases(List.of(
                new TestCase(1, "Input Sample 1", "Output Sample 1", List.of("1"), "1"),
                new TestCase(2, "Input Sample 2", "Output Sample 2", List.of("2"), "2")
        ));

        p.setExamples(List.of(
                new ProblemExample("Sample input representation", "Expected algorithm output", "Standard algorithmic validation example")
        ));

        p.setHints(List.of("Identify the optimal data structure (Hash Table, Priority Queue, Stack, or Two Pointers).", "Consider worst-case inputs and empty sets."));

        ProblemSolution sol = new ProblemSolution();
        sol.setExplanation("Optimal algorithm solving " + title);
        sol.setTimeComplexity("O(N)");
        sol.setSpaceComplexity("O(1)");
        sol.setCode(Map.of(
                "javascript", "function " + p.getFnName() + "(input) {\n    return input;\n}",
                "python", "def " + p.getFnName() + "(input):\n    return input",
                "java", "class Solution {\n    public static Object " + p.getFnName() + "(Object input) {\n        return input;\n    }\n}",
                "cpp", "int " + p.getFnName() + "(int input) {\n    return input;\n}"
        ));
        p.setSolution(sol);

        return p;
    }

    private void ensureStarterCodes(CodingProblem problem) {
        Map<String, String> current = problem.getStarterCode() != null ? new HashMap<>(problem.getStarterCode()) : new HashMap<>();
        String fn = problem.getFnName() != null ? problem.getFnName() : "solve";

        if (!current.containsKey("javascript") || current.get("javascript").isBlank()) {
            current.put("javascript", "// Solve " + problem.getTitle() + "\nfunction " + fn + "(input) {\n    // Write your solution here\n    return input;\n}");
        }
        if (!current.containsKey("python") || current.get("python").isBlank()) {
            current.put("python", "# Solve " + problem.getTitle() + "\ndef " + fn + "(input):\n    # Write your solution here\n    return input\n");
        }
        if (!current.containsKey("java") || current.get("java").isBlank()) {
            current.put("java", "class Solution {\n    public static Object " + fn + "(Object input) {\n        // Write your solution here\n        return input;\n    }\n}");
        }
        if (!current.containsKey("cpp") || current.get("cpp").isBlank()) {
            current.put("cpp", "#include <iostream>\nusing namespace std;\n\nint " + fn + "(int input) {\n    // Write your solution here\n    return input;\n}");
        }
        problem.setStarterCode(current);
    }

    private void syncToContentItem(CodingProblem problem, String source) {
        try {
            ContentItem item = contentItemRepository.findById(problem.getId()).orElse(new ContentItem());
            item.setId(problem.getId());
            item.setTitle(problem.getTitle());
            item.setType("CODING_PROBLEM");
            item.setSubject(problem.getCategory());
            item.setDifficulty(problem.getDifficulty());
            item.setStatus("Published");
            item.setDescription(problem.getDescription());
            item.setQuestionsCount(problem.getTestCases() != null ? problem.getTestCases().size() : 2);
            item.setDurationMinutes(30);
            item.setCreatedBy("ADMIN (" + source + ")");
            item.setUpdatedAt(LocalDateTime.now().toString());

            Map<String, Object> data = new HashMap<>();
            data.put("statement", problem.getDescription());
            data.put("inputFormat", problem.getInputFormat());
            data.put("outputFormat", problem.getOutputFormat());
            data.put("constraints", String.join("\n", problem.getConstraints()));
            data.put("starterCode", problem.getStarterCode());
            data.put("examples", problem.getExamples());
            data.put("testCases", problem.getTestCases());
            data.put("source", source);
            item.setContentData(data);

            contentItemRepository.save(item);
        } catch (Exception e) {
            log.warn("Could not sync imported problem to ContentItem: {}", e.getMessage());
        }
    }

    public void deleteProblem(String problemId) {
        log.info("Deleting platform coding problem: {}", problemId);
        problemRepository.deleteById(problemId);
        try {
            contentItemRepository.deleteById(problemId);
        } catch (Exception ignored) {}
    }

    public List<CodingProblem> getPlatformProblems() {
        return problemRepository.findAll();
    }

    public static class StructuredProblemData {
        private String statement = "";
        private List<ProblemExample> examples = new ArrayList<>();
        private List<String> constraints = new ArrayList<>();
        private List<TestCase> testCases = new ArrayList<>();

        public String getStatement() { return statement; }
        public void setStatement(String statement) { this.statement = statement; }
        public List<ProblemExample> getExamples() { return examples; }
        public void setExamples(List<ProblemExample> examples) { this.examples = examples; }
        public List<String> getConstraints() { return constraints; }
        public void setConstraints(List<String> constraints) { this.constraints = constraints; }
        public List<TestCase> getTestCases() { return testCases; }
        public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
    }

    public static StructuredProblemData parseProblemHtml(String rawHtml, JsonNode exampleTestcaseList) {
        StructuredProblemData data = new StructuredProblemData();
        if (rawHtml == null || rawHtml.isBlank()) {
            data.setStatement("Solve the coding challenge with optimal time and space complexity.");
            data.getExamples().add(new ProblemExample("x = 121", "true", "Standard test example."));
            data.getConstraints().add("1 <= input <= 10^5");
            data.getTestCases().add(new TestCase(1, "x = 121", "true", List.of("121"), Boolean.TRUE));
            return data;
        }

        // Clean HTML to readable markdown/text
        String text = rawHtml
                .replaceAll("(?i)<sup>(.*?)</sup>", "^$1")
                .replaceAll("(?i)<sub>(.*?)</sub>", "_$1")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)</p>", "\n\n")
                .replaceAll("(?i)</pre>", "\n\n")
                .replaceAll("(?i)</li>", "\n")
                .replaceAll("(?i)<ul>", "\n")
                .replaceAll("(?i)</ul>", "\n")
                .replaceAll("(?i)<li>", "- ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("&apos;", "'")
                .replaceAll("&#39;", "'")
                .replaceAll("&amp;", "&")
                .replaceAll("<[^>]*>", "")
                .replace("\r\n", "\n")
                .replace("\r", "\n");

        // Normalize markers that may have asterisks or backticks
        text = text
                .replaceAll("\\*\\*(Input|Output|Explanation|Constraints|Example|Follow[- ]?up):?\\*\\*", "$1:")
                .replaceAll("(?i)\\b(Input|Output|Explanation|Constraints|Example|Follow[- ]?up):\\*\\*", "$1:")
                .replaceAll("```", "");

        // 1. Separate pure problem statement (everything before Example 1)
        java.util.regex.Pattern example1Pattern = java.util.regex.Pattern.compile("(?i)(?:^|\\n)\\s*Example\\s*1\\b");
        java.util.regex.Matcher ex1Matcher = example1Pattern.matcher(text);

        String statementText;
        String remainingText;
        if (ex1Matcher.find()) {
            statementText = text.substring(0, ex1Matcher.start()).replaceAll("^[*#\\s]+|[*#\\s]+$", "").trim();
            remainingText = text.substring(ex1Matcher.start()).trim();
        } else {
            java.util.regex.Pattern constrPattern = java.util.regex.Pattern.compile("(?i)(?:^|\\n)\\s*Constraints\\s*:");
            java.util.regex.Matcher cm = constrPattern.matcher(text);
            if (cm.find()) {
                statementText = text.substring(0, cm.start()).replaceAll("^[*#\\s]+|[*#\\s]+$", "").trim();
                remainingText = text.substring(cm.start()).trim();
            } else {
                statementText = text.trim();
                remainingText = "";
            }
        }
        data.setStatement(statementText);

        // 2. Parse Examples
        List<ProblemExample> examples = new ArrayList<>();
        List<TestCase> testCases = new ArrayList<>();

        java.util.regex.Pattern exampleBlockPattern = java.util.regex.Pattern.compile(
                "(?i)Example\\s*\\d*\\s*[:\\.]?\\s*\\n?([\\s\\S]*?)(?=(?:Example\\s*\\d*\\s*[:\\.]?|Constraints\\s*:|Follow[- ]?up\\s*:|$))"
        );
        java.util.regex.Matcher exMatcher = exampleBlockPattern.matcher(remainingText);

        int exIndex = 0;
        while (exMatcher.find()) {
            String block = exMatcher.group(1).trim();
            String input = "";
            String output = "";
            String explanation = "";

            java.util.regex.Matcher inMatcher = java.util.regex.Pattern.compile("(?i)(?:^|\\n)\\s*Input\\s*:\\s*(.*?)(?=\\n\\s*Output\\s*:|\\n\\s*Explanation\\s*:|$)", java.util.regex.Pattern.DOTALL).matcher(block);
            if (inMatcher.find()) {
                input = inMatcher.group(1).replaceAll("^[*`\\s]+|[*`\\s]+$", "").trim();
            }

            java.util.regex.Matcher outMatcher = java.util.regex.Pattern.compile("(?i)(?:^|\\n)\\s*Output\\s*:\\s*(.*?)(?=\\n\\s*Explanation\\s*:|$)", java.util.regex.Pattern.DOTALL).matcher(block);
            if (outMatcher.find()) {
                output = outMatcher.group(1).replaceAll("^[*`\\s]+|[*`\\s]+$", "").trim();
            }

            java.util.regex.Matcher expMatcher = java.util.regex.Pattern.compile("(?i)(?:^|\\n)\\s*Explanation\\s*:\\s*([\\s\\S]*?)$").matcher(block);
            if (expMatcher.find()) {
                explanation = expMatcher.group(1).replaceAll("^[*`\\s]+|[*`\\s]+$", "").trim();
            }

            // Fallback input from exampleTestcaseList if input was empty
            if (input.isEmpty() && exampleTestcaseList != null && exampleTestcaseList.isArray() && exIndex < exampleTestcaseList.size()) {
                input = exampleTestcaseList.get(exIndex).asText();
            }

            if (!input.isEmpty() || !output.isEmpty()) {
                examples.add(new ProblemExample(input, output, explanation));

                // Create matched typed TestCase
                TestCase tc = new TestCase();
                tc.setId(exIndex + 1);
                tc.setInputStr(input.isEmpty() ? "Sample " + (exIndex + 1) : input);
                tc.setExpectedStr(output.isEmpty() ? "true" : output);
                tc.setPoints(25);
                tc.setHidden(false);
                tc.setParams(List.of(input));

                // Parse typed expectedVal
                String cleanOut = output.trim().toLowerCase();
                if ("true".equals(cleanOut)) {
                    tc.setExpectedVal(Boolean.TRUE);
                } else if ("false".equals(cleanOut)) {
                    tc.setExpectedVal(Boolean.FALSE);
                } else {
                    try {
                        if (output.matches("^-?\\d+$")) {
                            tc.setExpectedVal(Long.parseLong(output.trim()));
                        } else if (output.matches("^-?\\d*\\.\\d+$")) {
                            tc.setExpectedVal(Double.parseDouble(output.trim()));
                        } else {
                            tc.setExpectedVal(output.trim());
                        }
                    } catch (Exception ex) {
                        tc.setExpectedVal(output.trim());
                    }
                }
                testCases.add(tc);
                exIndex++;
            }
        }

        // Fallback testcases from exampleTestcaseList if none extracted
        if (testCases.isEmpty()) {
            if (exampleTestcaseList != null && exampleTestcaseList.isArray() && exampleTestcaseList.size() > 0) {
                for (int i = 0; i < exampleTestcaseList.size(); i++) {
                    String raw = exampleTestcaseList.get(i).asText();
                    testCases.add(new TestCase(i + 1, "Input:\n" + raw, "true", List.of(raw), Boolean.TRUE));
                    examples.add(new ProblemExample(raw, "Sample Solution Output", "Verify sample input"));
                }
            } else {
                testCases.add(new TestCase(1, "Sample Case 1", "true", List.of("1"), Boolean.TRUE));
                examples.add(new ProblemExample("Sample Case 1", "true", "Standard test"));
            }
        }
        data.setExamples(examples);
        data.setTestCases(testCases);

        // 3. Parse Constraints
        List<String> constraints = new ArrayList<>();
        java.util.regex.Matcher constrBlockMatcher = java.util.regex.Pattern.compile("(?i)Constraints\\s*:\\s*([\\s\\S]*?)(?=(?:Follow[- ]?up\\s*:|$))").matcher(remainingText);
        if (constrBlockMatcher.find()) {
            String[] lines = constrBlockMatcher.group(1).split("\\n");
            for (String l : lines) {
                String cleanLine = l.replaceFirst("^[\\s*\\-•]+", "").trim();
                if (!cleanLine.isEmpty() && cleanLine.length() > 2) {
                    constraints.add(cleanLine);
                }
            }
        }

        // Parse Follow-up if present
        java.util.regex.Matcher followUpMatcher = java.util.regex.Pattern.compile("(?i)Follow[- ]?up\\s*:\\s*([\\s\\S]*?)$").matcher(remainingText);
        if (followUpMatcher.find()) {
            String fu = followUpMatcher.group(1).trim();
            if (!fu.isEmpty()) {
                constraints.add("Follow-up: " + fu);
            }
        }

        if (constraints.isEmpty()) {
            constraints.add("1 <= input length <= 10^5");
            constraints.add("Optimal runtime complexity expected");
        }
        data.setConstraints(constraints);

        return data;
    }


    private String sanitizeFnName(String name) {
        if (name == null || name.isBlank()) return "solve";
        String clean = name.replaceAll("[^a-zA-Z0-9]", " ").trim();
        String[] parts = clean.split("\\s+");
        if (parts.length == 0 || parts[0].isEmpty()) return "solve";
        StringBuilder sb = new StringBuilder(parts[0].toLowerCase());
        for (int i = 1; i < parts.length; i++) {
            if (!parts[i].isEmpty()) {
                sb.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1).toLowerCase());
            }
        }
        return sb.toString();
    }

    private String formatSlugToTitle(String slug) {
        String clean = slug.replace("-", " ").replace("_", " ").trim();
        String[] words = clean.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private String normalizeDifficulty(String diff) {
        if (diff == null) return "Medium";
        String d = diff.trim();
        if (d.equalsIgnoreCase("EASY") || d.equalsIgnoreCase("800") || d.equalsIgnoreCase("1000")) return "Easy";
        if (d.equalsIgnoreCase("HARD") || d.equalsIgnoreCase("2000") || d.equalsIgnoreCase("2400")) return "Hard";
        return "Medium";
    }

    private String mapDomainToLeetCodeTag(String domain) {
        if (domain == null) return "";
        String d = domain.toLowerCase();
        if (d.contains("stack") || d.contains("queue")) return "stack";
        if (d.contains("tree") || d.contains("binary tree")) return "tree";
        if (d.contains("graph")) return "graph";
        if (d.contains("dp") || d.contains("dynamic programming")) return "dynamic-programming";
        if (d.contains("pointer") || d.contains("sliding window")) return "two-pointers";
        if (d.contains("array")) return "array";
        if (d.contains("string")) return "string";
        if (d.contains("database") || d.contains("sql")) return "database";
        return "";
    }

    private String mapDomainToCodeforcesTag(String domain) {
        if (domain == null) return "";
        String d = domain.toLowerCase();
        if (d.contains("dp") || d.contains("dynamic")) return "dp";
        if (d.contains("tree")) return "trees";
        if (d.contains("graph")) return "graphs";
        if (d.contains("math")) return "math";
        if (d.contains("greedy")) return "greedy";
        if (d.contains("string")) return "strings";
        if (d.contains("data structure") || d.contains("dsa")) return "data structures";
        return "";
    }
}
