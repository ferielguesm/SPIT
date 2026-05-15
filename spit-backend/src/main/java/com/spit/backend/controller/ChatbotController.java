package com.spit.backend.controller;

import com.spit.backend.service.ChatbotService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Adjust as per your security needs
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String response = chatbotService.getChatResponse(request.getMessage());
        return new ChatResponse(response);
    }

    @Data
    public static class ChatRequest {
        private String message;
    }

    @Data
    public static class ChatResponse {
        private String response;
        public ChatResponse(String response) {
            this.response = response;
        }
    }
}
