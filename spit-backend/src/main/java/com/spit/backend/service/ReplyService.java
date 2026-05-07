package com.spit.backend.service;

import com.spit.backend.entity.Reply;
import com.spit.backend.repository.PassengerRepository;
import com.spit.backend.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReplyService {

    private final ReplyRepository replyRepository;
    private final PassengerRepository passengerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Reply> getByComment(Long commentId) {
        return replyRepository.findByCommentIdOrderByCreatedAtAsc(commentId);
    }

    public Reply addReply(Long commentId, Long authorId, String content) {
        Reply reply = new Reply();
        reply.setCommentId(commentId);
        reply.setAuthorId(authorId);
        reply.setContent(content);

        passengerRepository.findById(authorId).ifPresent(p -> {
            reply.setAuthorName(p.getFirstName() + " " + p.getLastName());
            reply.setAuthorProfileImageUrl(p.getProfileImageUrl());
        });

        Reply saved = replyRepository.save(reply);
        messagingTemplate.convertAndSend("/topic/comments/" + commentId + "/replies", saved);
        return saved;
    }

    public void deleteReply(Long id) {
        replyRepository.deleteById(id);
    }

    public Reply updateReply(Long id, String content) {
        Reply r = replyRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Reply not found"));
        r.setContent(content);
        return replyRepository.save(r);
    }
}
