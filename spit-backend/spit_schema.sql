-- ============================================================
-- SPIT – Smart Passenger Intelligence Tunisia
-- PostgreSQL Database Schema
-- ============================================================

-- Create database (run separately if needed)
-- CREATE DATABASE spit;

-- ============================================================
-- TABLE: passengers
-- ============================================================
CREATE TABLE IF NOT EXISTS passengers (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    email       VARCHAR(150) UNIQUE,
    password    VARCHAR(255),
    age         INTEGER NOT NULL CHECK (age > 0 AND age < 120),
    nationality VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: travels
-- One passenger has one travel record (1-to-1)
-- ============================================================
CREATE TABLE IF NOT EXISTS travels (
    id             SERIAL PRIMARY KEY,
    passenger_id   INTEGER NOT NULL UNIQUE,
    duration       INTEGER NOT NULL CHECK (duration > 0),  -- travel duration in days
    available_time INTEGER NOT NULL DEFAULT 60,            -- transit available time in minutes
    purpose        VARCHAR(50) NOT NULL,                   -- e.g. tourism, business, family
    destination    VARCHAR(100) NOT NULL,
    budget         VARCHAR(20) NOT NULL,                   -- economy, standard, premium
    CONSTRAINT fk_travel_passenger FOREIGN KEY (passenger_id)
        REFERENCES passengers(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: preferences
-- One passenger has one preferences record (1-to-1)
-- ============================================================
CREATE TABLE IF NOT EXISTS preferences (
    id           SERIAL PRIMARY KEY,
    passenger_id INTEGER NOT NULL UNIQUE,
    beach        BOOLEAN NOT NULL DEFAULT FALSE,
    culture      BOOLEAN NOT NULL DEFAULT FALSE,
    desert       BOOLEAN NOT NULL DEFAULT FALSE,
    gastronomy   BOOLEAN NOT NULL DEFAULT FALSE,
    sports       BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_pref_passenger FOREIGN KEY (passenger_id)
        REFERENCES passengers(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: recommendations
-- One passenger can have many recommendations (1-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id           SERIAL PRIMARY KEY,
    passenger_id INTEGER NOT NULL,
    destination  VARCHAR(150) NOT NULL,
    activity     VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rec_passenger FOREIGN KEY (passenger_id)
        REFERENCES passengers(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: users (Admins / Staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    full_name   VARCHAR(150),
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50) DEFAULT 'viewer',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Initial admin seed
INSERT INTO users (full_name, email, password, role)
VALUES ('System Admin', 'admin@spit.gov.tn', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- TABLE: posts
-- Social feed posts by passengers
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id               SERIAL PRIMARY KEY,
    content          TEXT NOT NULL,
    image_url        TEXT,
    destination      VARCHAR(150),
    author_id        BIGINT,
    author_name      VARCHAR(200),
    author_initials  VARCHAR(4),
    author_color     VARCHAR(10),
    likes            INTEGER NOT NULL DEFAULT 0,
    comments         INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_travels_passenger_id       ON travels(passenger_id);
CREATE INDEX IF NOT EXISTS idx_preferences_passenger_id   ON preferences(passenger_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_passenger  ON recommendations(passenger_id);
CREATE INDEX IF NOT EXISTS idx_passengers_nationality     ON passengers(nationality);
