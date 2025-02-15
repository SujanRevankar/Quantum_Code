package com.example.QuantumCoding.guildControllers;

import java.util.List;

import com.example.QuantumCoding.codingModels.TestCases;

import lombok.Data;

@Data
public class SolvedChallengeModel {

    private String code;
    private String language;
    private List<TestCases> testCases;
    private String guildId;
    private int qubits;
    private String guildname;
    private String username;
}
