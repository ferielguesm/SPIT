package com.spit.backend.recommendation;

import com.spit.backend.dto.RecommendationDTO;
import com.spit.backend.entity.Preferences;
import com.spit.backend.entity.Travel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Rule-based recommendation engine for SPIT.
 * Generates destination + activity suggestions based on
 * passenger preferences, budget, and travel purpose.
 */
@Component
public class RecommendationEngine {

    public List<RecommendationDTO> generate(Preferences prefs, Travel travel) {
        List<RecommendationDTO> results = new ArrayList<>();

        // --- Preference-based rules ---
        if (Boolean.TRUE.equals(prefs.getDesert())) {
            results.add(new RecommendationDTO("Tozeur", "Sahara desert excursion and camel trekking"));
            results.add(new RecommendationDTO("Douz", "Gateway to the Sahara – sand dune exploration"));
        }

        if (Boolean.TRUE.equals(prefs.getCulture())) {
            results.add(new RecommendationDTO("Carthage", "Visit the ancient ruins and Carthage Museum"));
            results.add(new RecommendationDTO("Kairouan", "Explore the Great Mosque and medina souks"));
            results.add(new RecommendationDTO("Dougga", "UNESCO Roman ruins and archaeological site"));
        }

        if (Boolean.TRUE.equals(prefs.getBeach())) {
            results.add(new RecommendationDTO("Hammamet", "Relaxing beach resort with water sports"));
            results.add(new RecommendationDTO("Djerba", "Island beaches and snorkeling"));
            results.add(new RecommendationDTO("Monastir", "Coastal promenade and sandy beaches"));
        }

        if (Boolean.TRUE.equals(prefs.getGastronomy())) {
            results.add(new RecommendationDTO("Tunis Medina", "Street food tour – brik, lablabi, and makroudh"));
            results.add(new RecommendationDTO("Sfax", "Traditional Sfaxian cuisine and seafood"));
        }

        if (Boolean.TRUE.equals(prefs.getSports())) {
            results.add(new RecommendationDTO("Tabarka", "Diving, snorkeling, and coral reef exploration"));
            results.add(new RecommendationDTO("Ain Draham", "Hiking and mountain biking in the Kroumirie forests"));
        }

        // --- Budget-based rules ---
        if ("premium".equalsIgnoreCase(travel.getBudget())) {
            results.add(new RecommendationDTO("Gammarth", "Luxury beach resort and fine dining experience"));
            results.add(new RecommendationDTO("Sidi Bou Said", "Iconic blue-and-white village with upscale cafés"));
            results.add(new RecommendationDTO("La Marsa", "Upscale seaside dining and boutique shopping"));
        }

        if ("economy".equalsIgnoreCase(travel.getBudget())) {
            results.add(new RecommendationDTO("Tunis", "Affordable city exploration – Bardo Museum and medina"));
            results.add(new RecommendationDTO("Nabeul", "Budget-friendly pottery market and beaches"));
        }

        // --- Purpose-based rules ---
        if ("family".equalsIgnoreCase(travel.getPurpose())) {
            results.add(new RecommendationDTO("Djerba", "Family-friendly island with Djerba Explore park"));
            results.add(new RecommendationDTO("Hammamet", "Yasmine Hammamet theme parks and family resorts"));
        }

        if ("business".equalsIgnoreCase(travel.getPurpose())) {
            results.add(new RecommendationDTO("Tunis – Les Berges du Lac", "Business district with conference centers"));
        }

        if ("medical".equalsIgnoreCase(travel.getPurpose())) {
            results.add(new RecommendationDTO("Tunis", "Access to leading private clinics and hospitals"));
        }

        // Fallback if no preferences matched
        if (results.isEmpty()) {
            results.add(new RecommendationDTO("Tunis", "General city tour – medina, Bardo Museum, and souks"));
        }

        return results;
    }
}
