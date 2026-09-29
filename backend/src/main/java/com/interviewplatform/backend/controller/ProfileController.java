package com.interviewplatform.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.interviewplatform.backend.model.UserProfile;
import com.interviewplatform.backend.service.ProfileService;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserProfile> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfile profile = profileService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserProfile> updateMyProfile(
            Authentication authentication,
            @RequestBody UserProfile updates
    ) {
        String email = authentication.getName();
        UserProfile updatedProfile = profileService.updateProfileByEmail(email, updates);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfile> getProfileByUserId(@PathVariable String userId) {
        UserProfile profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }
}
