package com.interviewplatform.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

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
        String subject = "AI Interview Platform - Your 6-Digit Password Reset OTP: " + otp;

        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #e2e8f0; }
                    .card { max-width: 520px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    .brand { font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 8px; }
                    .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
                    .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
                    .otp-box { background: #0f172a; border: 1px dashed #38bdf8; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
                    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; }
                    .expiry { font-size: 12px; color: #f59e0b; margin-top: 8px; }
                    .footer { font-size: 12px; color: #64748b; margin-top: 28px; border-top: 1px solid #1e293b; padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="brand">AI Interview Preparation Platform</div>
                    <div class="title">Password Reset Request</div>
                    <p class="text">We received a request to reset the password for your account. Use the 6-digit verification code below to proceed with setting a new password.</p>
                    
                    <div class="otp-box">
                      <div class="otp-code">%s</div>
                      <div class="expiry">Valid for 15 minutes. Never share this code.</div>
                    </div>
                    
                    <p class="text">If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
                    
                    <div class="footer">
                      &copy; 2026 AI Interview Preparation Platform. All rights reserved.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(otp);

        String plainText = """
                Hello,
                
                Your one-time password (OTP) for resetting your AI Interview Platform account password is:
                
                >>> %s <<<
                
                This OTP is valid for 15 minutes. Please do not share it with anyone.
                If you did not request this, please ignore this email.
                
                Best regards,
                AI Interview Preparation Platform Team
                """.formatted(otp);

        log.info("""
                \n======================================================
                [PASSWORD RESET OTP DISPATCH]
                Target Email : {}
                6-Digit OTP  : {}
                Expires In   : 15 minutes
                SMTP Enabled : {}
                ======================================================
                """, toEmail, otp, mailEnabled);

        if (!mailEnabled || mailUsername == null || mailUsername.isBlank()) {
            return false;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender bean is not available. Skipping SMTP dispatch for [{}]", toEmail);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = (fromAddress != null && !fromAddress.contains("noreply") && !fromAddress.isBlank())
                    ? fromAddress : mailUsername;

            helper.setFrom(sender, "AI Interview Prep");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(plainText, htmlBody);

            mailSender.send(message);
            log.info("Password reset OTP HTML email successfully sent to [{}]", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email via SMTP to [{}]: {}", toEmail, e.getMessage());
            return false;
        }
    }

    public boolean sendVerificationStatusEmail(String toEmail, String studentName, String status, String remarks) {
        String displayName = (studentName != null && !studentName.isBlank()) ? studentName : "Student";
        boolean isApproved = "Verified".equalsIgnoreCase(status);
        String subject = isApproved 
                ? "Congratulations! Your Student Identity is Verified - AI Interview Platform"
                : "Update regarding your Identity Verification - AI Interview Platform";

        String statusColor = isApproved ? "#10b981" : "#ef4444";
        String statusLabel = isApproved ? "VERIFIED" : "ACTION REQUIRED / REJECTED";

        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #e2e8f0; }
                    .card { max-width: 520px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                    .brand { font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #38bdf8; margin-bottom: 8px; }
                    .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
                    .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 20px; }
                    .status-box { background: #0f172a; border-left: 4px solid %s; border-radius: 8px; padding: 16px; margin: 20px 0; }
                    .status-title { font-size: 16px; font-weight: 700; color: %s; margin-bottom: 6px; }
                    .footer { font-size: 12px; color: #64748b; margin-top: 28px; border-top: 1px solid #1e293b; padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="brand">AI Interview Preparation Platform</div>
                    <div class="title">Identity Verification Update</div>
                    <p class="text">Hello <strong>%s</strong>,</p>
                    
                    <div class="status-box">
                      <div class="status-title">Status: %s</div>
                      <p class="text" style="margin: 0;">%s</p>
                    </div>
                    
                    <p class="text">Log in to your account at any time to access your AI mock interviews, coding arena, and placement assessments.</p>
                    
                    <div class="footer">
                      &copy; 2026 AI Interview Preparation Platform. All rights reserved.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                        statusColor,
                        statusColor,
                        displayName,
                        statusLabel,
                        isApproved
                                ? "Your student ID and credentials have been verified by administration. All platform features and mock interviews are now unlocked!"
                                : ("Reason: " + (remarks != null ? remarks : "Please re-submit a clear, valid college ID card."))
                );

        log.info("""
                \n======================================================
                [VERIFICATION STATUS NOTIFICATION]
                Recipient : {} ({})
                Status    : {}
                Remarks   : {}
                ======================================================
                """, toEmail, displayName, status, remarks);

        if (!mailEnabled || mailUsername == null || mailUsername.isBlank()) {
            return false;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) return false;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String sender = (fromAddress != null && !fromAddress.contains("noreply") && !fromAddress.isBlank())
                    ? fromAddress : mailUsername;

            helper.setFrom(sender, "AI Interview Prep");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Verification status email sent to [{}]", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send verification status email to [{}]: {}", toEmail, e.getMessage());
            return false;
        }
    }

    public boolean sendPasswordResetEmail(String toEmail, String resetToken) {
        return sendPasswordResetOtp(toEmail, resetToken);
    }
}
