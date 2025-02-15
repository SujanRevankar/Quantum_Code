package com.example.QuantumCoding.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Getter;
import lombok.Setter;

@Document(collection="notification_center")
@Getter
@Setter
public class Notification {
    @Id
    private String id;
    
    private String sender;
    private String reciever;
    private String message;
    @Field("status")
    MessageStatus status;
    @Field("type")
    MessageType type;
    private LocalDateTime timeStamp;
}
