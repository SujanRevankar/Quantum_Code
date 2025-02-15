package com.example.QuantumCoding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.QuantumCoding.Repositories")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @SuppressWarnings("null")
    @Override
    protected String getDatabaseName() {
        return "QuantumCoding";
    }

    @SuppressWarnings("null")
    @Override
    public MongoClient mongoClient() {
        return MongoClients.create("mongodburl");
    }
}
