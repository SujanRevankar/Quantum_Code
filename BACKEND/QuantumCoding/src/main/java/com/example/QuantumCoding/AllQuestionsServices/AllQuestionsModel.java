package com.example.QuantumCoding.AllQuestionsServices;

import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.mapping.Field;

import com.example.QuantumCoding.codingModels.QuestionType;
import com.example.QuantumCoding.codingModels.TestCases;
import com.example.QuantumCoding.model.Status;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AllQuestionsModel {

     private String questionId;
    private String title;
    private String questionDescription;
    @Field("questionType")
    private QuestionType questionType;

    @Field("status")
    private Status status;

    private List<TestCases> exampleTestCases;

    private String inputFormat;
    private String outputFormat;
    private List<Map<String,Object>> boilerPlateCode;   
    private List<Map<String,Object>> constraints;

    private String timeComplexity;
    private String spaceComplexity;
    private String timeLimit;
    private String memoryLimit;
    private String hint;
    private int qubits;
    private String knowledgeGained;
    private boolean solved;
}
