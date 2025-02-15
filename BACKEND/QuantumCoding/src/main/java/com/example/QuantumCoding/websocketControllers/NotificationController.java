package com.example.QuantumCoding.websocketControllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.model.Notification;
import com.example.QuantumCoding.services.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController()
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    @GetMapping("/get/notifications")
    public ResponseEntity<?> getAllUserNotifications(
            @RequestParam String username,
            @RequestParam String guildname) {
        List<Notification> notifications = notificationService.getAllNotifications(username, guildname);

        if (notifications == null || notifications.isEmpty()) {
            return ResponseEntity.ok("No record found");
        }

        return ResponseEntity.ok(notifications);
    }

    @DeleteMapping("/delete/notification")
    public ResponseEntity<?> deleteTheNotification(@RequestBody DeleteNotificationModal deleteNotificationModal){
        // String sender=deleteNotificationModal.getSender();
        // String reciever=deleteNotificationModal.getReciever();
        String message=deleteNotificationModal.getMessage();
        String notificationId=deleteNotificationModal.getId();
        String res=notificationService.deleteNotification(notificationId,message);
        if(res.equals("Success"))
            return ResponseEntity.ok("message");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not found");
    }
    
}

