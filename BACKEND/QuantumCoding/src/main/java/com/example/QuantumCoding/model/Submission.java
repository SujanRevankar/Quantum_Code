package com.example.QuantumCoding.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Submission {
    private String code;
    private String ouput;
    private LocalDateTime timeStamp;

}
