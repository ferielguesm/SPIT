package com.spit.backend;

import com.spit.backend.entity.User;
import com.spit.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin user on first startup if none exists.
 * Login: admin@spit.gov.tn / admin123
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@spit.gov.tn")) {
            User admin = new User();
            admin.setFullName("Administrator");
            admin.setEmail("admin@spit.gov.tn");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("admin");
            userRepository.save(admin);
            System.out.println("✓ Default admin created: admin@spit.gov.tn / admin123");
        } else {
            // Re-hash if password is still plain-text (migration from old version)
            userRepository.findByEmail("admin@spit.gov.tn").ifPresent(admin -> {
                if (!admin.getPassword().startsWith("$2")) {
                    admin.setPassword(passwordEncoder.encode(admin.getPassword()));
                    userRepository.save(admin);
                    System.out.println("✓ Admin password migrated to BCrypt");
                }
            });
        }
    }
}
