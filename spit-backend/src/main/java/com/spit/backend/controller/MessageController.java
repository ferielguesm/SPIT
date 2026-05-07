package com.spit.backend.controller;

import com.spit.backend.entity.Message;
import com.spit.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{u1}/{u2}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable Long u1, @PathVariable Long u2) {
        return ResponseEntity.ok(messageService.getConversation(u1, u2));
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(messageService.sendMessage(
            Long.valueOf(payload.get("senderId").toString()),
            Long.valueOf(payload.get("receiverId").toString()),
            payload.get("content") != null ? payload.get("content").toString() : "",
            payload.get("type") != null ? payload.get("type").toString() : "TEXT",
            payload.get("mediaUrl") != null ? payload.get("mediaUrl").toString() : null
        ));
    }

    @PostMapping("/upload")
    public ResponseEntity<Message> uploadMedia(
            @RequestParam("senderId") Long senderId,
            @RequestParam("receiverId") Long receiverId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            return ResponseEntity.ok(messageService.uploadMedia(senderId, receiverId, file, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
