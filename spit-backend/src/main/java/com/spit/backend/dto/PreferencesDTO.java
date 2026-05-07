package com.spit.backend.dto;

import lombok.Data;

@Data
public class PreferencesDTO {
    private Boolean beach      = false;
    private Boolean culture    = false;
    private Boolean desert     = false;
    private Boolean gastronomy = false;
    private Boolean sports     = false;
}
