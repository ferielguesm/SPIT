package com.spit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "replies")
@Data
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Long commentId;
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
}
