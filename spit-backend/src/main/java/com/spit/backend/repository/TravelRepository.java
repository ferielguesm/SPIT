package com.spit.backend.repository;

import com.spit.backend.entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long> {

    Optional<Travel> findByPassengerId(Long passengerId);

    // Count travels grouped by purpose
    @Query("SELECT t.purpose AS purpose, COUNT(t) AS count FROM Travel t GROUP BY t.purpose")
    List<Object[]> countByPurpose();

    // Count travels grouped by budget
    @Query("SELECT t.budget AS budget, COUNT(t) AS count FROM Travel t GROUP BY t.budget")
    List<Object[]> countByBudget();

    // Count travels grouped by destination
    @Query("SELECT t.destination AS destination, COUNT(t) AS count FROM Travel t GROUP BY t.destination ORDER BY COUNT(t) DESC")
    List<Object[]> countByDestination();
}
