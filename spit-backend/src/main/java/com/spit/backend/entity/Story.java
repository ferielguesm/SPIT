package com.spit.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "stories")
@Data
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;
    private Long authorId;
    private String authorName;
    private String authorProfileImageUrl;
    private String caption;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Expired if older than 48 hours
    public boolean isExpired() {
        return createdAt.isBefore(LocalDateTime.now().minusHours(48));
    }
}
