package com.spit.backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatbotService {

    private static final Map<String, String> APP_KNOWLEDGE = new HashMap<>();

    static {
        APP_KNOWLEDGE.put("hello", "Hello! I am your Passenger Portal Assistant. How can I help you use our app today?");
        APP_KNOWLEDGE.put("help", "You can use this app to share your travel journeys, add stories, explore Tunisia landmarks on the map, and chat with other travelers.");
        APP_KNOWLEDGE.put("post", "To add a post, go to your Profile and click 'Add Post'. You can share photos and descriptions of your trips.");
        APP_KNOWLEDGE.put("story", "Stories are 48-hour temporary updates. Click the '+' button on your profile picture or at the top of the feed to upload one.");
        APP_KNOWLEDGE.put("map", "The Explore tab shows a smart map of Tunisia. You can filter by category (Beach, History, etc.) and plan your ride to any landmark.");
        APP_KNOWLEDGE.put("chat", "You can message any traveler by clicking the 'Message' button on their profile or in the Discover tab.");
        APP_KNOWLEDGE.put("edit", "Click 'Edit Profile' on your profile page to change your name, bio, or profile photo.");
        APP_KNOWLEDGE.put("delete", "You can delete your own stories by clicking the trash icon in the story viewer. For posts, use the delete button on the feed.");
    }

    public String getResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        
        for (String key : APP_KNOWLEDGE.keySet()) {
            if (msg.contains(key)) {
                return APP_KNOWLEDGE.get(key);
            }
        }
        
        return "I'm sorry, I am specifically programmed to help you with the Passenger Portal application only. I don't have information about other topics. Feel free to ask me about posts, stories, maps, or chat!";
    }
}
