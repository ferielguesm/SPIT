package com.spit.backend.repository;

import com.spit.backend.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByPassengerId(Long passengerId);

    void deleteByPassengerId(Long passengerId);
}
