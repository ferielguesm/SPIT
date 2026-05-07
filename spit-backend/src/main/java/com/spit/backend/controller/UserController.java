package com.spit.backend.controller;

import com.spit.backend.dto.LoginRequestDTO;
import com.spit.backend.entity.User;
import com.spit.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /** POST /api/auth/login */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO req) {
        try {
            User user = userService.authenticate(req.getEmail(), req.getPassword());
            return ResponseEntity.ok(Map.of(
                "id",       user.getId(),
                "email",    user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role",     user.getRole(),
                "message",  "Login successful"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/users */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/{id} */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** POST /api/users */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        try {
            User u = userService.createUser(
                body.get("fullName"), body.get("email"),
                body.get("password") != null ? body.get("password") : "changeme",
                body.get("role")
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User created", "id", u.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /** PUT /api/users/{id} */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User u = userService.updateUser(id, body.get("fullName"), body.get("role"));
            return ResponseEntity.ok(Map.of("message", "User updated", "id", u.getId()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/users/{id} */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/users/count */
    @GetMapping("/users/count")
    public ResponseEntity<?> countUsers() {
        return ResponseEntity.ok(Map.of("count", userService.countUsers()));
    }
}
