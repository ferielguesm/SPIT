package com.spit.backend.service;

import com.spit.backend.entity.Story;
import com.spit.backend.repository.PassengerRepository;
import com.spit.backend.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final PassengerRepository passengerRepository;
    private static final String UPLOAD_DIR = "uploads/";

    public List<Story> getActiveStories() {
        return storyRepository.findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime.now().minusHours(48));
    }

    public Story createStory(Long authorId, MultipartFile file) throws IOException {
        Story story = new Story();
        story.setAuthorId(authorId);
        
        passengerRepository.findById(authorId).ifPresent(p -> {
            story.setAuthorName(p.getFirstName() + " " + p.getLastName());
            story.setAuthorProfileImageUrl(p.getProfileImageUrl());
        });

        if (file != null && !file.isEmpty()) {
            String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            story.setImageUrl("/uploads/" + filename);
        }

        return storyRepository.save(story);
    }

    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }

    public Story updateStory(Long id, String caption) {
        Story s = storyRepository.findById(id).orElseThrow();
        s.setCaption(caption);
        return storyRepository.save(s);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
