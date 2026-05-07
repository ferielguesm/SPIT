package com.spit.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "passengers")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 100)
    private String nationality;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(unique = true, length = 150)
    private String email;

    // Never serialize password to frontend
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(length = 255)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "passenger", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Travel travel;

    @OneToOne(mappedBy = "passenger", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Preferences preferences;

    @OneToMany(mappedBy = "passenger", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Recommendation> recommendations;

    @Column(name = "profile_image_url", length = 255)
    private String profileImageUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "passenger_followers",
        joinColumns = @JoinColumn(name = "passenger_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Passenger> followers;

    @ManyToMany(mappedBy = "followers", fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Passenger> following;

    public int getFollowersCount() { return followers != null ? followers.size() : 0; }
    public int getFollowingCount() { return following != null ? following.size() : 0; }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
