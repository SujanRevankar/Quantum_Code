package com.example.QuantumCoding.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageRequest {

    private String sender;
    private String reciever;
    private String message;
    private String type;
}
