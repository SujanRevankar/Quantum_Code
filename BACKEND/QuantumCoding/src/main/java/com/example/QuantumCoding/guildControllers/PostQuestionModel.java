package com.example.QuantumCoding.guildControllers;

import java.util.List;
import java.util.Map;

import com.example.QuantumCoding.codingModels.TestCases;

import lombok.Data;

@Data
public class PostQuestionModel {

    private String guildName;
    private String postedBy;
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private List<Map<String,String>> exampleTestCases;
    private List<Map<String,String>> hiddenTestCases;
    private List<Map<String,Object>> solutions;
    private int timeLimit;
    private int qubits;
}
