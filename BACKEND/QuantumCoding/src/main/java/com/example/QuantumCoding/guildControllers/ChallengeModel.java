package com.example.QuantumCoding.guildControllers;

import java.util.List;
import java.util.Map;

import com.example.QuantumCoding.codingModels.TestCases;

import lombok.Data;

@Data
public class ChallengeModel {
    private String code;
    private List<TestCases> testCases;
    private String language;
    private String guildName;
}
