// package com.example.QuantumCoding.controllers;

// import org.springframework.messaging.handler.annotation.DestinationVariable;
// import org.springframework.messaging.handler.annotation.MessageMapping;
// import org.springframework.messaging.simp.annotation.SendToUser;
// import org.springframework.messaging.simp.annotation.SubscribeMapping;
// import org.springframework.stereotype.Controller;

// import com.example.QuantumCoding.model.Notification;

// @Controller
// public class WebSocketController {

//     // This method listens to subscription request and sends acknowledgment back to the client
//     @SubscribeMapping("/user/{username}/notifications")
//     public void handleSubscription(@DestinationVariable String username) {
//         // Log or send a confirmation that the user has successfully subscribed
//         System.out.println(username + " has successfully subscribed to notifications.");
//         // You can send a response message back to the user if needed
//         // The @SendToUser will handle sending messages to the specific user
//     }

//     // This method handles messages sent to the /app/notifications endpoint
//     @MessageMapping("/notifications")
//     @SendToUser("/topic/notifications")
//     public String handleNotification(Notification notification) {
//         return "Notification: " + notification.getMessage();
//     }
// }
