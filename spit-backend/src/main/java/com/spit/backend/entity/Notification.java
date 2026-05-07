package com.spit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long recipientId;
    private String message;
    private String type; // FOLLOW, LIKE, COMMENT, SYSTEM
    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
