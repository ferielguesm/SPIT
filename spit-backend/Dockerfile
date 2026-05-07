# ============================================================
# SPIT Backend – Production Dockerfile
# Multi-stage build for minimal image size
# ============================================================

# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom first (cached layer)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:resolve -B 2>/dev/null || \
    (apk add --no-cache maven && mvn dependency:resolve -B)

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -B 2>/dev/null || \
    (apk add --no-cache maven && mvn clean package -DskipTests -B)

# Stage 2: Run
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Render provides PORT env var
EXPOSE ${PORT:-8080}

# Memory-optimized for Render free tier (512MB RAM)
ENTRYPOINT ["java", \
  "-Xmx256m", \
  "-Xms128m", \
  "-XX:+UseSerialGC", \
  "-XX:MaxMetaspaceSize=128m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
