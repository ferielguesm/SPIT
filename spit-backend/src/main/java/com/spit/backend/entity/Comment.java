package com.spit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comments")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Long postId;
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;

    @Column(nullable = false)
    private Integer likes = 0;

    @ElementCollection
    private Set<Long> likedByPassengerIds = new HashSet<>();

    private LocalDateTime createdAt = LocalDateTime.now();
}
