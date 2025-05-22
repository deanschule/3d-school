# Use an official JDK image
FROM eclipse-temurin:22-jdk

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and project files
COPY . .

# Build the project
RUN ./gradlew build

# Run the application
CMD ["java", "-jar", "build/libs/3dschool-0.0.1-SNAPSHOT.jar"]
