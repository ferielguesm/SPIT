package com.spit.backend.service;

import com.spit.backend.entity.Message;
import com.spit.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private static final String UPLOAD_DIR = "uploads/messages/";

    public List<Message> getConversation(Long u1, Long u2) {
        return messageRepository.findConversation(u1, u2);
    }

    public Message sendMessage(Long senderId, Long receiverId, String content, String type, String mediaUrl) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setType(type != null ? type : "TEXT");
        message.setMediaUrl(mediaUrl);
        
        Message saved = messageRepository.save(message);
        
        messagingTemplate.convertAndSend("/topic/messages/" + senderId + "/" + receiverId, saved);
        messagingTemplate.convertAndSend("/topic/messages/" + receiverId + "/" + senderId, saved);
        
        return saved;
    }

    public Message uploadMedia(Long senderId, Long receiverId, MultipartFile file, String type) throws IOException {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR);
        if (!Files.exists(path)) Files.createDirectories(path);
        Files.copy(file.getInputStream(), path.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        
        return sendMessage(senderId, receiverId, "[Media]", type, "/uploads/messages/" + filename);
    }

    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
