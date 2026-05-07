package com.spit.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    private String imageUrl;
    private String destination;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private String authorName;

    private String authorInitials;
    private String authorColor;
    private String authorProfileImageUrl;

    @Column(nullable = false)
    private Integer likes = 0;

    @ElementCollection
    private Set<Long> likedByPassengerIds = new HashSet<>();

    @Column(nullable = false)
    private Integer comments = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
