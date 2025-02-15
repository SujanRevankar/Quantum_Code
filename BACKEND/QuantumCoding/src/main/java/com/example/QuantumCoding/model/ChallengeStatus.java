package com.example.QuantumCoding.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ChallengeStatus {
    
    ACCEPTED,
    SOLVED,
    UNSOLVED;


     @JsonCreator
    public static ChallengeStatus fromValue(String value) {
        return ChallengeStatus.valueOf(value.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }

}
