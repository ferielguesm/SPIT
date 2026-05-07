package com.spit.backend.controller;

import com.spit.backend.entity.Post;
import com.spit.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    /** GET /api/posts — all posts, newest first */
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    /** GET /api/posts/author/{id} */
    @GetMapping("/author/{id}")
    public ResponseEntity<List<Post>> getByAuthor(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostsByAuthor(id));
    }

    /**
     * POST /api/posts  (multipart/form-data)
     * Fields: content, destination, authorId, authorName, authorInitials, authorColor
     * File:   image (optional)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("content")        String content,
            @RequestParam(value = "destination",    required = false) String destination,
            @RequestParam("authorId")       Long   authorId,
            @RequestParam("authorName")     String authorName,
            @RequestParam(value = "authorInitials", required = false, defaultValue = "?") String authorInitials,
            @RequestParam(value = "authorColor",    required = false, defaultValue = "#4A919E") String authorColor,
            @RequestParam(value = "image",  required = false) MultipartFile image) {
        try {
            Post post = postService.createPost(content, destination,
                    authorId, authorName, authorInitials, authorColor, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** POST /api/posts/{id}/like */
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long passengerId = body.get("passengerId");
            return ResponseEntity.ok(postService.likePost(id, passengerId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/posts/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(Map.of("message", "Post deleted"));
    }

    /** PUT /api/posts/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(postService.updatePost(id, body.get("content")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
