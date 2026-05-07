package com.spit.backend.dto;

import lombok.Data;

import java.util.Map;

@Data
public class StatsDTO {
    private Long totalPassengers;
    private Double averageAge;
    private Map<String, Long> passengersByNationality;
    private Map<String, Long> travelsByPurpose;
    private Map<String, Long> travelsByBudget;
    private Map<String, Long> topDestinations;
    private Map<String, Long> preferenceStats;
}
