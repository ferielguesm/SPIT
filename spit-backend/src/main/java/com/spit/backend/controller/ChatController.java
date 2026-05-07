package com.spit.backend.controller;

import com.spit.backend.dto.ChatMessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDTO chatMessage) {
        // Send to receiver's private topic
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getReceiverId(), chatMessage);
        
        // Also send back to sender so they see it in their UI (or handle locally in frontend)
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getSenderId(), chatMessage);
    }
}
