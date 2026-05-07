package com.spit.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "travels")
@Data
@NoArgsConstructor
public class Travel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false, unique = true)
    private Passenger passenger;

    @Column(nullable = false)
    private Integer duration;

    @Column(name = "available_time")
    private Integer availableTime = 60;

    @Column(nullable = false, length = 50)
    private String purpose;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(nullable = false, length = 20)
    private String budget;
}
