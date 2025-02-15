package com.example.QuantumCoding.websocketControllers;

import lombok.Data;


@Data
public class DeleteNotificationModal {

    private String sender;
    private String reciever;
    private String message;
    private String id;
}
