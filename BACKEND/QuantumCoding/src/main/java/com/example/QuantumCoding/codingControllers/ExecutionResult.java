package com.example.QuantumCoding.codingControllers;

import java.util.List;

import com.example.QuantumCoding.codingModels.OutputAndBadges;
import com.example.QuantumCoding.codingModels.TestCaseResults;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExecutionResult {
    List<TestCaseResults> testCaseResults;
    OutputAndBadges outputAndQubits;

}
