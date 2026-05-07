package com.spit.backend.service;

import com.spit.backend.entity.Comment;
import com.spit.backend.repository.CommentRepository;
import com.spit.backend.repository.PassengerRepository;
import com.spit.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PassengerRepository passengerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    // Comprehensive Profanity List
    private static final List<String> BAD_WORDS = List.of(
        "fuck", "shit", "ass", "bitch", "bastard", "dick", "pussy",
        "con", "putain", "merde", "salope", "fdp", "zebi", "zab"
    );

    public List<Comment> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    private String filterProfanity(String content) {
        String filtered = content;
        for (String word : BAD_WORDS) {
            filtered = filtered.replaceAll("(?i)" + word, "****");
        }
        return filtered;
    }

    public Comment addComment(Long postId, Long authorId, String content) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setAuthorId(authorId);
        comment.setContent(filterProfanity(content));

        passengerRepository.findById(authorId).ifPresent(p -> {
            comment.setAuthorName(p.getFirstName() + " " + p.getLastName());
            comment.setAuthorProfileImageUrl(p.getProfileImageUrl());
        });

        Comment saved = commentRepository.save(comment);

        postRepository.findById(postId).ifPresent(post -> {
            post.setComments(post.getComments() + 1);
            postRepository.save(post);
            notificationService.createNotification(post.getAuthorId(), saved.getAuthorName() + " commented on your post!", "COMMENT");
            messagingTemplate.convertAndSend("/topic/feed/update", post);
        });

        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/comments", saved);
        return saved;
    }

    public void deleteComment(Long id) {
        commentRepository.findById(id).ifPresent(c -> {
            postRepository.findById(c.getPostId()).ifPresent(post -> {
                post.setComments(Math.max(0, post.getComments() - 1));
                postRepository.save(post);
                messagingTemplate.convertAndSend("/topic/feed/update", post);
            });
            commentRepository.deleteById(id);
            messagingTemplate.convertAndSend("/topic/posts/" + c.getPostId() + "/comments/delete", id);
        });
    }

    public Comment updateComment(Long id, String content) {
        Comment c = commentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Comment not found"));
        c.setContent(filterProfanity(content));
        Comment saved = commentRepository.save(c);
        messagingTemplate.convertAndSend("/topic/posts/" + saved.getPostId() + "/comments/update", saved);
        return saved;
    }

    public Comment likeComment(Long id, Long passengerId) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Comment not found"));

        if (comment.getLikedByPassengerIds().contains(passengerId)) {
            comment.getLikedByPassengerIds().remove(passengerId);
            comment.setLikes(Math.max(0, comment.getLikes() - 1));
        } else {
            comment.getLikedByPassengerIds().add(passengerId);
            comment.setLikes(comment.getLikes() + 1);
            notificationService.createNotification(comment.getAuthorId(), "Someone liked your comment!", "LIKE");
        }

        Comment saved = commentRepository.save(comment);
        messagingTemplate.convertAndSend("/topic/posts/" + saved.getPostId() + "/comments/update", saved);
        return saved;
    }
}
