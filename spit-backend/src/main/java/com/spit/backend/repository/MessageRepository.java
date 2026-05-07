package com.spit.backend.repository;

import com.spit.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :u1 AND m.receiverId = :u2) OR (m.senderId = :u2 AND m.receiverId = :u1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(Long u1, Long u2);

    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
}
