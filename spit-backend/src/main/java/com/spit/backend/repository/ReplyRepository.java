package com.spit.backend.repository;

import com.spit.backend.entity.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, Long> {
    List<Reply> findByCommentIdOrderByCreatedAtAsc(Long commentId);
}
