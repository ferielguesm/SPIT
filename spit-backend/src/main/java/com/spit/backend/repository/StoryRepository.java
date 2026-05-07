package com.spit.backend.repository;

import com.spit.backend.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {
    // Find all stories created within the last 48 hours
    List<Story> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime cutoff);
}
