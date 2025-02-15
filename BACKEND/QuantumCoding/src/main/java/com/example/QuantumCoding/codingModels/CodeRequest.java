package com.example.QuantumCoding.codingModels;

import java.util.List;

import com.example.QuantumCoding.model.Status;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodeRequest {
    private String questionId;
    private String username;
    private Status status;
    private QuestionType questionType;
    private String code;
    private String language;
    private int qubits;
    private List<TestCases> testCases;
}
