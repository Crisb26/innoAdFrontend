# Multi-stage Dockerfile
# 1) Build stage: use Maven + JDK 21 to compile and package
# 2) Runtime stage: lightweight Eclipse Temurin JRE 21 image

FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy only Maven files first to leverage layer caching
COPY pom.xml ./
COPY src ./src

# Build the application with limited memory usage and no update checks
# -XX:MaxRAMPercentage=80.0 limits heap to 80% of container memory
RUN mvn -B -DskipTests package -DskipITs --no-transfer-progress \
    -Dmaven.compiler.fork=true \
    -Dmaven.compiler.meminitial=128m \
    -Dmaven.compiler.maxmem=512m

FROM eclipse-temurin:21-jre-jammy

# Install curl so HEALTHCHECK can use it (small overhead)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Expose configured application port (now 8080)
EXPOSE 8080

# Copy jar from builder stage
COPY --from=build /workspace/target/innoad-backend-2.0.0.jar /app/innoad-backend.jar

ENV JAVA_OPTS=""

# Asegurar que Spring use el perfil prod si está definida la variable
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar /app/innoad-backend.jar"]

# Simple healthcheck using actuator endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
