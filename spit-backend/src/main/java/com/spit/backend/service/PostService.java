package com.spit.backend.service;

import com.spit.backend.entity.Post;
import com.spit.backend.repository.PassengerRepository;
import com.spit.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PassengerRepository passengerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    private static final String UPLOAD_DIR = "uploads/";

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByAuthor(Long authorId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
    }

    /**
     * Create a post, optionally with an image file.
     * Broadcasts the new post to all WebSocket subscribers on /topic/feed.
     */
    public Post createPost(String content, String destination,
                           Long authorId, String authorName,
                           String authorInitials, String authorColor,
                           MultipartFile image) throws IOException {

        Post post = new Post();
        post.setContent(content);
        post.setDestination(destination);
        post.setAuthorId(authorId);
        post.setAuthorName(authorName);
        post.setAuthorInitials(authorInitials);
        post.setAuthorColor(authorColor != null ? authorColor : "#4A919E");

        // Fetch current profile image
        passengerRepository.findById(authorId).ifPresent(p -> {
            post.setAuthorProfileImageUrl(p.getProfileImageUrl());
        });

        // Save image to disk if provided
        if (image != null && !image.isEmpty()) {
            String ext = getExtension(image.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(image.getInputStream(), uploadPath.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
            post.setImageUrl("/uploads/" + filename);
        }

        Post saved = postRepository.save(post);

        // Broadcast to all connected WebSocket clients
        messagingTemplate.convertAndSend("/topic/feed", saved);

        return saved;
    }

    public Post likePost(Long postId, Long passengerId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
        
        if (post.getLikedByPassengerIds().contains(passengerId)) {
            post.getLikedByPassengerIds().remove(passengerId);
            post.setLikes(Math.max(0, post.getLikes() - 1));
        } else {
            post.getLikedByPassengerIds().add(passengerId);
            post.setLikes(post.getLikes() + 1);
            notificationService.createNotification(post.getAuthorId(), "Someone liked your post!", "LIKE");
        }

        Post saved = postRepository.save(post);
        messagingTemplate.convertAndSend("/topic/feed/update", saved);
        return saved;
    }

    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
        messagingTemplate.convertAndSend("/topic/feed/delete", postId);
    }

    public Post updatePost(Long postId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found: " + postId));
        post.setContent(content);
        Post saved = postRepository.save(post);
        messagingTemplate.convertAndSend("/topic/feed/update", saved);
        return saved;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
