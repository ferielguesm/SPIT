package com.spit.backend.controller;

import com.spit.backend.entity.Story;
import com.spit.backend.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StoryController {

    private final StoryService storyService;

    @GetMapping
    public ResponseEntity<List<Story>> getStories() {
        return ResponseEntity.ok(storyService.getActiveStories());
    }

    @PostMapping
    public ResponseEntity<?> createStory(
            @RequestParam("authorId") Long authorId,
            @RequestParam("image") MultipartFile image) {
        try {
            Story story = storyService.createStory(authorId, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(story);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return ResponseEntity.ok(Map.of("message", "Story deleted"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Story> updateStory(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(storyService.updateStory(id, payload.get("caption")));
    }
}
