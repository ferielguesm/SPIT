package com.spit.backend.service;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    @Value("${xai.api.key}")
    private String apiKey;

    @Value("${xai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String SYSTEM_PROMPT = 
        "You are SPIT AI, the official assistant for the Smart Passenger Intelligence Tunisia (SPIT) platform. " +
        "Your goal is to help users with travel plans, passenger intelligence, and platform-related queries in Tunisia. " +
        "You must only answer questions related to SPIT, travel in Tunisia, transportation, or platform features. " +
        "If a user asks about anything else (like general knowledge, coding, or unrelated topics), politely decline " +
        "and explain that you are specialized in the SPIT platform and travel in Tunisia.";

    public String getChatResponse(String userMessage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            List<Map<String, String>> messages = new ArrayList<>();
            
            // System message to set the persona and constraints
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", SYSTEM_PROMPT);
            messages.add(systemMessage);

            // User message
            Map<String, String> userMsgMap = new HashMap<>();
            userMsgMap.put("role", "user");
            userMsgMap.put("content", userMessage);
            messages.add(userMsgMap);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            Map<String, Object> response = restTemplate.postForObject(apiUrl, entity, Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    return message.get("content");
                }
            }
            
            return "I'm sorry, I couldn't process your request at the moment.";
        } catch (Exception e) {
            // FALLBACK / MOCK MODE for UI Testing
            System.err.println("Groq API Error: " + e.getMessage());
            
            if (e.getMessage().contains("403") || e.getMessage().contains("401") || e.getMessage().contains("429")) {
                return "[MOCK MODE] Hi! I'm the SPIT assistant. It seems the Groq API is currently unavailable, but I'm here to help you test the interface!";
            }
            
            return "Error connecting to Groq: " + e.getMessage();
        }
    }
}
