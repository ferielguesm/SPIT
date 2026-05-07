package com.spit.backend.service;

import com.spit.backend.dto.*;
import com.spit.backend.entity.*;
import com.spit.backend.recommendation.RecommendationEngine;
import com.spit.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PassengerService {

    private final PassengerRepository    passengerRepo;
    private final TravelRepository       travelRepo;
    private final PreferencesRepository  prefsRepo;
    private final RecommendationRepository recRepo;
    private final RecommendationEngine   engine;
    private final PasswordEncoder        passwordEncoder;
    private final NotificationService    notificationService;

    // ----------------------------------------------------------------
    // Create passenger with travel + preferences
    // ----------------------------------------------------------------
    @Transactional
    public Passenger createPassenger(PassengerRequestDTO dto) {
        // 1. Save passenger
        Passenger passenger = new Passenger();
        passenger.setFirstName(dto.getFirstName());
        passenger.setLastName(dto.getLastName());
        passenger.setEmail(dto.getEmail());
        passenger.setPassword(passwordEncoder.encode(dto.getPassword()));
        passenger.setAge(dto.getAge());
        passenger.setNationality(dto.getNationality());
        passenger = passengerRepo.save(passenger);

        // 2. Save travel
        Travel travel = new Travel();
        travel.setPassenger(passenger);
        travel.setDuration(dto.getTravel().getDuration());
        travel.setPurpose(dto.getTravel().getPurpose());
        travel.setDestination(dto.getTravel().getDestination());
        travel.setBudget(dto.getTravel().getBudget());
        travelRepo.save(travel);

        // 3. Save preferences
        Preferences prefs = new Preferences();
        prefs.setPassenger(passenger);
        prefs.setBeach(dto.getPreferences().getBeach());
        prefs.setCulture(dto.getPreferences().getCulture());
        prefs.setDesert(dto.getPreferences().getDesert());
        prefs.setGastronomy(dto.getPreferences().getGastronomy());
        prefs.setSports(dto.getPreferences().getSports());
        prefsRepo.save(prefs);

        // 4. Auto-generate recommendations
        List<RecommendationDTO> recs = engine.generate(prefs, travel);
        for (RecommendationDTO r : recs) {
            Recommendation rec = new Recommendation();
            rec.setPassenger(passenger);
            rec.setDestination(r.getDestination());
            rec.setActivity(r.getActivity());
            recRepo.save(rec);
        }

        return passenger;
    }

    // ----------------------------------------------------------------
    // Login functionality
    // ----------------------------------------------------------------
    public Passenger login(String email, String password) {
        Passenger p = passengerRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!passwordEncoder.matches(password, p.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        return p;
    }

    // ----------------------------------------------------------------
    // Get all passengers
    // ----------------------------------------------------------------
    public List<Passenger> getAllPassengers() {
        return passengerRepo.findAll();
    }

    // ----------------------------------------------------------------
    // Get passenger by ID
    // ----------------------------------------------------------------
    public Passenger getPassengerById(Long id) {
        return passengerRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Passenger not found with id: " + id));
    }

    // ----------------------------------------------------------------
    // Generate (or regenerate) recommendations for a passenger
    // ----------------------------------------------------------------
    @Transactional
    public List<Recommendation> generateRecommendations(Long passengerId) {
        Passenger passenger = getPassengerById(passengerId);

        Preferences prefs = prefsRepo.findByPassengerId(passengerId)
                .orElseThrow(() -> new NoSuchElementException("Preferences not found for passenger: " + passengerId));

        Travel travel = travelRepo.findByPassengerId(passengerId)
                .orElseThrow(() -> new NoSuchElementException("Travel not found for passenger: " + passengerId));

        // Clear old recommendations
        recRepo.deleteByPassengerId(passengerId);

        // Generate new ones
        List<RecommendationDTO> recs = engine.generate(prefs, travel);
        List<Recommendation> saved = new ArrayList<>();
        for (RecommendationDTO r : recs) {
            Recommendation rec = new Recommendation();
            rec.setPassenger(passenger);
            rec.setDestination(r.getDestination());
            rec.setActivity(r.getActivity());
            saved.add(recRepo.save(rec));
        }
        return saved;
    }

    // ----------------------------------------------------------------
    // Dashboard statistics
    // ----------------------------------------------------------------
    public StatsDTO getStats() {
        StatsDTO stats = new StatsDTO();

        stats.setTotalPassengers(passengerRepo.count());
        stats.setAverageAge(passengerRepo.averageAge());

        // Nationality breakdown
        Map<String, Long> byNationality = new LinkedHashMap<>();
        for (Object[] row : passengerRepo.countByNationality()) {
            byNationality.put((String) row[0], (Long) row[1]);
        }
        stats.setPassengersByNationality(byNationality);

        // Purpose breakdown
        Map<String, Long> byPurpose = new LinkedHashMap<>();
        for (Object[] row : travelRepo.countByPurpose()) {
            byPurpose.put((String) row[0], (Long) row[1]);
        }
        stats.setTravelsByPurpose(byPurpose);

        // Budget breakdown
        Map<String, Long> byBudget = new LinkedHashMap<>();
        for (Object[] row : travelRepo.countByBudget()) {
            byBudget.put((String) row[0], (Long) row[1]);
        }
        stats.setTravelsByBudget(byBudget);

        // Top destinations
        Map<String, Long> topDest = new LinkedHashMap<>();
        for (Object[] row : travelRepo.countByDestination()) {
            topDest.put((String) row[0], (Long) row[1]);
        }
        stats.setTopDestinations(topDest);

        // Preference stats
        Object[] prefStats = prefsRepo.countPreferenceStats();
        Map<String, Long> prefMap = new LinkedHashMap<>();
        if (prefStats != null && prefStats.length == 5) {
            prefMap.put("beach",      toLong(prefStats[0]));
            prefMap.put("culture",    toLong(prefStats[1]));
            prefMap.put("desert",     toLong(prefStats[2]));
            prefMap.put("gastronomy", toLong(prefStats[3]));
            prefMap.put("sports",     toLong(prefStats[4]));
        }
        stats.setPreferenceStats(prefMap);

        return stats;
    }

    private Long toLong(Object val) {
        if (val == null) return 0L;
        return ((Number) val).longValue();
    }

    // ----------------------------------------------------------------
    // Update passenger
    // ----------------------------------------------------------------
    @Transactional
    public Passenger updatePassenger(Long id, Map<String, Object> body) {
        Passenger p = getPassengerById(id);
        if (body.containsKey("age"))         p.setAge((Integer) body.get("age"));
        if (body.containsKey("nationality")) p.setNationality((String) body.get("nationality"));
        if (body.containsKey("firstName"))   p.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName"))    p.setLastName((String) body.get("lastName"));
        if (body.containsKey("bio"))         p.setBio((String) body.get("bio"));
        return passengerRepo.save(p);
    }

    @Transactional
    public void follow(Long passengerId, Long followerId) {
        Passenger p = getPassengerById(passengerId);
        Passenger follower = getPassengerById(followerId);
        if (!p.getFollowers().contains(follower)) {
            p.getFollowers().add(follower);
            passengerRepo.save(p);
            
            // Notify recipient
            notificationService.createNotification(passengerId, follower.getFirstName() + " started following you!", "FOLLOW");
        }
    }

    @Transactional
    public void unfollow(Long passengerId, Long followerId) {
        Passenger p = getPassengerById(passengerId);
        Passenger follower = getPassengerById(followerId);
        p.getFollowers().remove(follower);
        passengerRepo.save(p);
    }

    public List<Passenger> getFollowers(Long passengerId) {
        Passenger p = getPassengerById(passengerId);
        // Return a plain list (detached) to avoid lazy-load issues
        return new ArrayList<>(p.getFollowers());
    }

    public List<Passenger> getFollowing(Long passengerId) {
        Passenger p = getPassengerById(passengerId);
        return new ArrayList<>(p.getFollowing());
    }

    // ----------------------------------------------------------------
    // Delete passenger
    // ----------------------------------------------------------------
    @Transactional
    public void deletePassenger(Long id) {
        if (!passengerRepo.existsById(id)) {
            throw new NoSuchElementException("Passenger not found: " + id);
        }
        passengerRepo.deleteById(id);
    }

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public Passenger updateProfilePhoto(Long id, MultipartFile file) throws IOException {
        Passenger p = getPassengerById(id);
        
        if (file != null && !file.isEmpty()) {
            String ext = getExtension(file.getOriginalFilename());
            String filename = "profile_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            p.setProfileImageUrl("/uploads/" + filename);
        }
        
        return passengerRepo.save(p);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
