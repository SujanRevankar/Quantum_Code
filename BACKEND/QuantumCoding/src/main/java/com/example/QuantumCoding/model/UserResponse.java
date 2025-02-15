package com.example.QuantumCoding.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    
    private String linkedIn;
    private String github;
    private List<String> connections;
    private String guildname;
    private List<String> languages;
    private int badges;
    private int totalQubits;
    private Role role;
    private String name;
    private String username;
    private String email;
    private Status stage;
    private boolean verified;
    private long allQuestions;
    private long javaSolvedQuestions;
    private long pythonSolvedQuestions;
    private long notificationCount;
}
