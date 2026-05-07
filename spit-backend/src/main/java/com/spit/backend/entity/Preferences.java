package com.spit.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "preferences")
@Data
@NoArgsConstructor
public class Preferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false, unique = true)
    private Passenger passenger;

    @Column(nullable = false)
    private Boolean beach = false;

    @Column(nullable = false)
    private Boolean culture = false;

    @Column(nullable = false)
    private Boolean desert = false;

    @Column(nullable = false)
    private Boolean gastronomy = false;

    @Column(nullable = false)
    private Boolean sports = false;
}
