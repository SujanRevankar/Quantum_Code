package com.example.QuantumCoding.codingModels;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionType {
    VERYEASY,
    EASY,
    MEDIUM,
    HARD;


    @JsonCreator
    public static QuestionType fromValue(String value) {
        return QuestionType.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }

}
