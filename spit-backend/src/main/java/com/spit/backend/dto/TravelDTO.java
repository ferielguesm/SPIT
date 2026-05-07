package com.spit.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TravelDTO {

    @NotNull
    @Min(1)
    private Integer duration;

    @NotBlank
    private String purpose;

    @NotBlank
    private String destination;

    @NotBlank
    private String budget; // economy | standard | premium
}
