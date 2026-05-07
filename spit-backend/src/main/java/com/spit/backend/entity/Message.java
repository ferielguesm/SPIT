package com.spit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long receiverId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String type = "TEXT"; // TEXT, IMAGE, LOCATION, VOCAL, CALL_LOG
    private String mediaUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean isRead = false;
}
