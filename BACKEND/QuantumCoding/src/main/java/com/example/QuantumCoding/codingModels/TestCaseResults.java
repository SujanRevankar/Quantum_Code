package com.example.QuantumCoding.codingModels;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TestCaseResults {

    private String input;
    private String expectedOutput;
    private String actualOutput;
    private boolean isPass;
}
