package com.spit.backend.controller;

import com.spit.backend.dto.PassengerRequestDTO;
import com.spit.backend.dto.StatsDTO;
import com.spit.backend.entity.Passenger;
import com.spit.backend.entity.Recommendation;
import com.spit.backend.service.PassengerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PassengerController {

    private final PassengerService passengerService;

    /**
     * POST /api/passengers
     * Returns the full passenger object (with travel, preferences, recommendations).
     */
    @PostMapping("/passengers")
    public ResponseEntity<?> createPassenger(@Valid @RequestBody PassengerRequestDTO dto) {
        try {
            Passenger created = passengerService.createPassenger(dto);
            // Re-fetch to get all eager-loaded relations
            Passenger full = passengerService.getPassengerById(created.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(full);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/passengers/login
     * Returns full passenger object so frontend can store all needed fields.
     */
    @PostMapping("/passengers/login")
    public ResponseEntity<?> loginPassenger(@RequestBody Map<String, String> credentials) {
        String email    = credentials.get("email");
        String password = credentials.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
        }
        try {
            Passenger p = passengerService.login(email, password);
            // Re-fetch full object with all relations
            Passenger full = passengerService.getPassengerById(p.getId());
            return ResponseEntity.ok(full);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/passengers
     * Retrieve all passengers.
     */
    @GetMapping("/passengers")
    public ResponseEntity<List<Passenger>> getAllPassengers() {
        return ResponseEntity.ok(passengerService.getAllPassengers());
    }

    /**
     * GET /api/passengers/{id}
     * Retrieve a single passenger by ID.
     */
    @GetMapping("/passengers/{id}")
    public ResponseEntity<?> getPassengerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(passengerService.getPassengerById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/stats
     * Dashboard analytics.
     */
    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getStats() {
        return ResponseEntity.ok(passengerService.getStats());
    }

    /**
     * POST /api/recommendations
     * Generate/regenerate recommendations. Returns updated passenger.
     */
    @PostMapping("/recommendations")
    public ResponseEntity<?> generateRecommendations(@RequestBody Map<String, Long> body) {
        Long passengerId = body.get("passengerId");
        if (passengerId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "passengerId is required"));
        }
        try {
            passengerService.generateRecommendations(passengerId);
            Passenger full = passengerService.getPassengerById(passengerId);
            return ResponseEntity.ok(full);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/passengers/{id}
     */
    @PutMapping("/passengers/{id}")
    public ResponseEntity<?> updatePassenger(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Passenger updated = passengerService.updatePassenger(id, body);
            return ResponseEntity.ok(Map.of("message", "Passenger updated", "passengerId", updated.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/passengers/{id}
     */
    @DeleteMapping("/passengers/{id}")
    public ResponseEntity<?> deletePassenger(@PathVariable Long id) {
        try {
            passengerService.deletePassenger(id);
            return ResponseEntity.ok(Map.of("message", "Passenger deleted"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/recommendations/passenger/{id}
     */
    @GetMapping("/recommendations/passenger/{id}")
    public ResponseEntity<?> getRecommendationsByPassenger(@PathVariable Long id) {
        try {
            List<Recommendation> recs = passengerService.generateRecommendations(id);
            return ResponseEntity.ok(recs);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/passengers/{id}/photo
     */
    @PostMapping("/passengers/{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        try {
            Passenger p = passengerService.updateProfilePhoto(id, photo);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/passengers/{id}/follow/{followerId}")
    public ResponseEntity<?> follow(@PathVariable Long id, @PathVariable Long followerId) {
        passengerService.follow(id, followerId);
        return ResponseEntity.ok(Map.of("message", "Followed"));
    }

    @DeleteMapping("/passengers/{id}/follow/{followerId}")
    public ResponseEntity<?> unfollow(@PathVariable Long id, @PathVariable Long followerId) {
        passengerService.unfollow(id, followerId);
        return ResponseEntity.ok(Map.of("message", "Unfollowed"));
    }

    /** GET /api/passengers/{id}/followers — list of passengers who follow {id} */
    @GetMapping("/passengers/{id}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(passengerService.getFollowers(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/passengers/{id}/following — list of passengers that {id} follows */
    @GetMapping("/passengers/{id}/following")
    public ResponseEntity<?> getFollowing(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(passengerService.getFollowing(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
