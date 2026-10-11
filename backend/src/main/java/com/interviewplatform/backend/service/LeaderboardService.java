package com.interviewplatform.backend.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.interviewplatform.backend.model.LeaderboardUser;
import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.repository.UserProfileRepository;

@Service
@SuppressWarnings("null")
public class LeaderboardService {

    private final UserProfileRepository userProfileRepository;

    public LeaderboardService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public List<LeaderboardUser> getLeaderboard(String filter, String authEmail) {
        List<UserProfile> profiles = userProfileRepository.findAll();
        List<LeaderboardUser> list = new ArrayList<>();

        for (UserProfile p : profiles) {
            int score = p.getStats() != null ? p.getStats().getTotalXP() : 0;
            int streak = p.getStats() != null ? p.getStats().getCurrentStreak() : 0;
            int solved = p.getStats() != null ? p.getStats().getCodingProblemsSolved() : 0;
            int interviews = p.getStats() != null ? p.getStats().getMockInterviewsCompleted() : 0;
            int rating = p.getStats() != null ? p.getStats().getOverallRating() : 80;

            String badge = calculateBadge(score);

            LeaderboardUser lu = new LeaderboardUser(
                    0,
                    p.getUserId(),
                    p.getEmail(),
                    p.getName() != null ? p.getName() : "Student",
                    p.getAvatar() != null ? p.getAvatar() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    p.getCollege() != null && !p.getCollege().isBlank() ? p.getCollege() : "SRM Institute of Science and Technology",
                    score,
                    streak,
                    solved,
                    interviews,
                    rating,
                    badge
            );

            if (authEmail != null && authEmail.equalsIgnoreCase(p.getEmail())) {
                lu.setCurrentUser(true);
            }

            list.add(lu);
        }

        // Apply filters & strictly sort
        if ("college".equalsIgnoreCase(filter)) {
            String targetCollege = "SRM";
            if (authEmail != null) {
                UserProfile cur = userProfileRepository.findByEmail(authEmail).orElse(null);
                if (cur != null && cur.getCollege() != null && !cur.getCollege().isBlank()) {
                    targetCollege = cur.getCollege();
                }
            }
            final String finalCollege = targetCollege;
            list = list.stream()
                    .filter(u -> u.getCollege() != null && u.getCollege().toLowerCase().contains(finalCollege.toLowerCase()))
                    .sorted(Comparator.comparingInt(LeaderboardUser::getScore).reversed()
                            .thenComparing(Comparator.comparingInt(LeaderboardUser::getStreakDays).reversed()))
                    .toList();
        } else if ("weekly".equalsIgnoreCase(filter)) {
            list = list.stream()
                    .sorted(Comparator.comparingInt(LeaderboardUser::getStreakDays).reversed()
                            .thenComparing(Comparator.comparingInt(LeaderboardUser::getScore).reversed()))
                    .toList();
        } else {
            list = list.stream()
                    .sorted(Comparator.comparingInt(LeaderboardUser::getScore).reversed()
                            .thenComparing(Comparator.comparingInt(LeaderboardUser::getStreakDays).reversed()))
                    .toList();
        }

        // Assign sequential rank numbers
        List<LeaderboardUser> rankedList = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            LeaderboardUser user = list.get(i);
            user.setRank(i + 1);
            rankedList.add(user);
        }

        return rankedList;
    }

    private String calculateBadge(int score) {
        if (score >= 2500) return "Master";
        if (score >= 2000) return "Gold";
        if (score >= 1200) return "Silver";
        if (score >= 600) return "Bronze";
        return "Pro";
    }
}
