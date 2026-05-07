package com.spit.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PassengerRequestDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotNull
    @Min(1) @Max(119)
    private Integer age;

    @NotBlank
    private String nationality;

    @NotNull
    @Valid
    private TravelDTO travel;

    @NotNull
    @Valid
    private PreferencesDTO preferences;
}
