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
            int score = p.getStats() != null ? (p.getStats().getTotalXP() * 10) + (p.getStats().getCodingProblemsSolved() * 15) : 800;
            int streak = p.getStats() != null ? p.getStats().getCurrentStreak() : 1;
            int solved = p.getStats() != null ? p.getStats().getCodingProblemsSolved() : 0;
            int interviews = p.getStats() != null ? p.getStats().getMockInterviewsCompleted() : 0;
            int rating = p.getStats() != null ? p.getStats().getOverallRating() : 85;

            String badge = calculateBadge(score);

            LeaderboardUser lu = new LeaderboardUser(
                    0,
                    p.getUserId(),
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

        // Ensure rich leaderboard with baseline candidates if DB has few users
        if (list.size() < 4) {
            list.add(new LeaderboardUser(0, "usr-top-1", "Aarav Sharma", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150", "SRM Institute of Science and Technology", 2840, 24, 142, 18, 94, "Master"));
            list.add(new LeaderboardUser(0, "usr-top-2", "Priya Nair", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "IIT Madras", 2690, 19, 128, 15, 91, "Gold"));
            list.add(new LeaderboardUser(0, "usr-top-3", "Vikramaditya Roy", "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150", "BITS Pilani", 2510, 16, 115, 14, 89, "Silver"));
            list.add(new LeaderboardUser(0, "usr-top-4", "Sneha Reddy", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", "NIT Trichy", 2380, 14, 98, 12, 87, "Bronze"));
        }

        // Apply filters
        if ("college".equalsIgnoreCase(filter)) {
            list = list.stream().filter(u -> u.getCollege() != null && u.getCollege().contains("SRM")).toList();
        } else if ("weekly".equalsIgnoreCase(filter)) {
            list = list.stream().sorted(Comparator.comparingInt(LeaderboardUser::getStreakDays).reversed()).toList();
        } else {
            list = list.stream().sorted(Comparator.comparingInt(LeaderboardUser::getScore).reversed()).toList();
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
        if (score >= 2800) return "Master";
        if (score >= 2400) return "Gold";
        if (score >= 2000) return "Silver";
        if (score >= 1500) return "Bronze";
        return "Pro";
    }
}
