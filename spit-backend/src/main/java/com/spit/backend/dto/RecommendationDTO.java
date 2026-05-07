package com.spit.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecommendationDTO {
    private String destination;
    private String activity;
}
