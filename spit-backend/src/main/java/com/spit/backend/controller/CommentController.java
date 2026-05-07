package com.spit.backend.controller;

import com.spit.backend.entity.Comment;
import com.spit.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestBody Map<String, Object> payload) {
        Long postId = Long.valueOf(payload.get("postId").toString());
        Long authorId = Long.valueOf(payload.get("authorId").toString());
        String content = payload.get("content").toString();
        return ResponseEntity.ok(commentService.addComment(postId, authorId, content));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(commentService.updateComment(id, body.get("content")));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Comment> likeComment(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(commentService.likeComment(id, body.get("passengerId")));
    }
}
