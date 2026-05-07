package com.spit.backend.repository;

import com.spit.backend.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    Optional<Passenger> findByEmail(String email);
    
    boolean existsByEmail(String email);

    // Count passengers grouped by nationality
    @Query("SELECT p.nationality AS nationality, COUNT(p) AS count FROM Passenger p GROUP BY p.nationality")
    List<Object[]> countByNationality();

    // Average age
    @Query("SELECT AVG(p.age) FROM Passenger p")
    Double averageAge();
}
