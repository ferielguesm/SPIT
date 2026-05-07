package com.spit.backend.repository;

import com.spit.backend.entity.Preferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PreferencesRepository extends JpaRepository<Preferences, Long> {

    Optional<Preferences> findByPassengerId(Long passengerId);

    @Query("SELECT SUM(CASE WHEN p.beach = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.culture = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.desert = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.gastronomy = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.sports = true THEN 1 ELSE 0 END) FROM Preferences p")
    Object[] countPreferenceStats();
}
