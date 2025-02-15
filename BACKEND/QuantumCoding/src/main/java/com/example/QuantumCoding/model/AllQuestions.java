package com.example.QuantumCoding.model;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.example.QuantumCoding.codingModels.QuestionType;
import com.example.QuantumCoding.codingModels.TestCases;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Document(collection="all_programming_questions")
@Getter
@Setter
@Builder
public class AllQuestions {

    @Id
    private String _id;


    @Indexed(unique=true)
    private String questionId;

    private String title;
    private String questionDescription;
    @Field("questionType")
    private QuestionType questionType;

    @Field("status")
    private Status status;

    private List<TestCases> exampleTestCases;
    private List<TestCases> hiddenTestCases;

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
    
}
