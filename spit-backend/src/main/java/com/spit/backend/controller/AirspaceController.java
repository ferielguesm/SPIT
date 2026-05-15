package com.spit.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/airspace")
@CrossOrigin(origins = "*")
public class AirspaceController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPENSKY_URL = "https://opensky-network.org/api/states/all?lamin=30&lomin=7&lamax=38&lomax=12";

    @GetMapping("/live")
    public ResponseEntity<?> getLiveAirspace() {
        try {
            Object data = restTemplate.getForObject(OPENSKY_URL, Object.class);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching OpenSky data: " + e.getMessage());
        }
    }
}
