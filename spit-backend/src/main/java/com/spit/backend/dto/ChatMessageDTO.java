package com.spit.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String senderId;
    private String senderName;
    private String receiverId;
    private String content;
    private Long timestamp;
}
