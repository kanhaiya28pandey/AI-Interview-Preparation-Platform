package com.interviewplatform.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.from-address:noreply@aiinterviewprep.com}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public boolean sendPasswordResetOtp(String toEmail, String otp) {
        if (!mailEnabled || mailUsername == null || mailUsername.isBlank()) {
            log.info("Email service is not active (mail.enabled={}). Password reset OTP for [{}] is [{}]",
                    mailEnabled, toEmail, otp);
            return false;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender bean is not available. Skipping email dispatch for [{}]", toEmail);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String sender = (fromAddress != null && !fromAddress.contains("noreply") && !fromAddress.isBlank()) 
                    ? fromAddress : mailUsername;
            message.setFrom(sender);
            message.setTo(toEmail);
            message.setSubject("AI Interview Platform - Password Reset OTP: " + otp);
            message.setText("""
                    Hello,

                    We received a request to reset your password for the AI Interview Preparation Platform.

                    Your One-Time Password (OTP) is:

                    ====================================
                                 %s
                    ====================================

                    This OTP is valid for 15 minutes.
                    Please do not share this OTP with anyone.

                    If you did not request this password reset, please ignore this email.

                    Best regards,
                    AI Interview Preparation Platform Team
                    """.formatted(otp));

            mailSender.send(message);
            log.info("Password reset OTP email successfully sent to [{}]", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to [{}]: {}", toEmail, e.getMessage());
            return false;
        }
    }

    public boolean sendPasswordResetEmail(String toEmail, String resetToken) {
        return sendPasswordResetOtp(toEmail, resetToken);
    }
}
