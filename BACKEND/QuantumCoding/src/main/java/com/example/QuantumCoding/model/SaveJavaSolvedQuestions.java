package com.example.QuantumCoding.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Builder;
import lombok.Data;

@Document(collection="java_solved_questions")
@Data
@Builder
public class SaveJavaSolvedQuestions {

    @Id
    private String id;

    @Indexed(unique=true)
    private String questionId;
    private String username;

    @Field("status")
    private Status status;

    private List<Submission> submissions;
    private int gainedQubits;

    private LocalDateTime timeStamp;
}
