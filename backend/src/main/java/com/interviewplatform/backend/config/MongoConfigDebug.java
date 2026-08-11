package com.interviewplatform.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;

@Configuration
public class MongoConfigDebug {

    @Bean
    CommandLineRunner showMongoDatabase(MongoDatabaseFactory mongoDatabaseFactory) {

        return args -> {
            String databaseName =
                    mongoDatabaseFactory.getMongoDatabase().getName();

            System.out.println("=================================");
            System.out.println("CONNECTED MONGODB DATABASE: " + databaseName);
            System.out.println("=================================");
        };
    }
}