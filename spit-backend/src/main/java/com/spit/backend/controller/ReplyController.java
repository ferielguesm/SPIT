package com.spit.backend.controller;

import com.spit.backend.entity.Reply;
import com.spit.backend.service.ReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/replies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReplyController {

    private final ReplyService replyService;

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<Reply>> getByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(replyService.getByComment(commentId));
    }

    @PostMapping
    public ResponseEntity<Reply> addReply(@RequestBody Map<String, Object> payload) {
        Long commentId = Long.valueOf(payload.get("commentId").toString());
        Long authorId = Long.valueOf(payload.get("authorId").toString());
        String content = payload.get("content").toString();
        return ResponseEntity.ok(replyService.addReply(commentId, authorId, content));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReply(@PathVariable Long id) {
        replyService.deleteReply(id);
        return ResponseEntity.ok(Map.of("message", "Reply deleted"));
    }
}
