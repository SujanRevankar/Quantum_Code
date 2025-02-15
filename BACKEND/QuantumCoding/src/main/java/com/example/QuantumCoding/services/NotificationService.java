package com.example.QuantumCoding.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.NotificationRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.guild.GuildServices;
import com.example.QuantumCoding.model.MessageStatus;
import com.example.QuantumCoding.model.MessageType;
import com.example.QuantumCoding.model.Notification;
import com.example.QuantumCoding.model.Users;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Data
@Slf4j
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final GuildServices guildServices;

    public String saveNotification(String sender,String reciever,String message,String type){
        System.out.println("Notification");
            Notification notification =new Notification();
            notification.setSender(sender);
            notification.setReciever(reciever);
            notification.setMessage(message);
            notification.setStatus(MessageStatus.REQUESTED);
            Optional<Notification> notificationExistsOrNot=notificationRepository.findBySenderAndRecieverAndMessage(sender, reciever, message);
            if(notificationExistsOrNot.isPresent()){
                return "Present";
            }
            Optional<Notification> notificationExistsOr=notificationRepository.findBySenderAndRecieverAndMessage(reciever, sender, message);
            if(notificationExistsOr.isPresent()){
                return "User Requested";
            }
            if(type.equals("Request")){
                notification.setType(MessageType.REQUEST);
            }
            else if(type.equals("AdminRequest")){
                notification.setType(MessageType.ADMINREQUEST);
            }
            else if(type.equals("GuildRequest")){
                notification.setType(MessageType.GUILDREQUEST);
            }
            else{
                notification.setType(MessageType.GUILDCHALLENGE);
            }
            notification.setTimeStamp(LocalDateTime.now());
            notificationRepository.save(notification);
            return "Success";
    }

    public List<Notification> getAllNotifications(String username,String guildName){
            return notificationRepository.findBySenderOrReciever(username,guildName);
    }

    public Long getAllNotificationCount(String username,String guildName){
        long allCount=notificationRepository.countBySenderOrReceiver(username,guildName);
        return allCount;
    }

    public String getNotificationDetails(String sender){
        Optional<Notification> senderNotificationPresentOrNot=notificationRepository.findBySenderAndType(sender);
        if(senderNotificationPresentOrNot.isPresent()){
            return "present";
        }
        return "not present";
    }

    public String deleteNotification(String notificationId,String message){
        Optional<Notification> dltMsg=notificationRepository.findById(notificationId);
        if(dltMsg.isPresent()){
            Notification deleteMsg=dltMsg.get();
            notificationRepository.delete(deleteMsg);
            System.out.println("Message deleted successfully");
            if(!message.equals("ok"))
                removeRequest(deleteMsg.getSender(),deleteMsg.getReciever());
            return "Success";
        }
        System.out.println("No message found");
        return "Failed";
    }

    public String acceptRequest(String sender, String receiver, String msg) {
        System.out.println("This is services");
        Optional<Notification> accepted = notificationRepository.findBySenderAndRecieverAndMessage(sender, receiver, msg);
        if (!accepted.isPresent()) {
            log.warn("Notification not found for sender={}, receiver={}, message={}", sender, receiver, msg);
            return "Notification not found";
        }
    
        Notification acceptedMessage = accepted.get();
        Optional<Users> userExists = userRepository.findByUsername(receiver);
        Optional<Users> senderExists = userRepository.findByUsername(sender);
    
        if (!userExists.isPresent() || !senderExists.isPresent()) {
            log.warn("User or sender not found: sender={}, receiver={}", sender, receiver);
            return"User not found";
        }
    
        Users user = userExists.get();
        Users sendingUser = senderExists.get();
    

            if (user.getConnections() == null) {
                user.setConnections(new ArrayList<>());
            }
            if (sendingUser.getConnections() == null) {
                sendingUser.setConnections(new ArrayList<>());
            }
    
            if (!user.getConnections().contains(sender)) {
                user.getConnections().add(sender);
            }
            if (!sendingUser.getConnections().contains(receiver)) {
                sendingUser.getConnections().add(receiver);
            }
    
            userRepository.save(user);
            userRepository.save(sendingUser);
    
        // deleteNotification(acceptedMessage.getSender(), acceptedMessage.getReciever(), acceptedMessage.getMessage());
        acceptedMessage.setStatus(MessageStatus.ACCEPTED);
        acceptedMessage.setMessage("Normal Accept");
        notificationRepository.save(acceptedMessage);
        log.info("Request accepted successfully: sender={}, receiver={}", sender, receiver);
        return "Success";
    }

    public void acceptAdminRequest(String sender,String receiver,String msg){
        Optional<Notification> accepted = notificationRepository.findBySenderAndRecieverAndMessage(sender, receiver, msg);
        if (!accepted.isPresent()) {
            log.warn("Notification not found for sender={}, receiver={}, message={}", sender, receiver, msg);
            return;
        }
        
        Notification acceptedMessage = accepted.get();
        String guildname = msg;
        acceptedMessage.setStatus(MessageStatus.ACCEPTED);
        acceptedMessage.setMessage("Normal Accept");
        notificationRepository.save(acceptedMessage);
        guildServices.addUserToGuild(receiver, guildname);
    }
    
    public void acceptGuildRequest(String sender,String receiver,String msg){
        System.out.println("Iam started accepted buddy");
        Optional<Notification> accepted = notificationRepository.findBySenderAndRecieverAndMessage(sender, receiver, msg);
        if (!accepted.isPresent()) {
            log.warn("Notification not found for sender={}, receiver={}, message={}", sender, receiver, msg);
            return;
        }
        
        Notification acceptedMessage = accepted.get();
        acceptedMessage.setStatus(MessageStatus.ACCEPTED);
        acceptedMessage.setMessage("Guild request accepted");
        notificationRepository.save(acceptedMessage);
        System.out.println("Iam started accepted buddy");
        guildServices.addUserToGuild(sender, receiver);
    }

    public void removeRequest(String sender,String reciever){
        Optional<Users> userExists = userRepository.findByUsername(reciever);
        Optional<Users> senderExists = userRepository.findByUsername(sender);
    
        if (!userExists.isPresent() || !senderExists.isPresent()) {
            log.warn("User or sender not found: sender={}, receiver={}", sender, reciever);
            return;
        }
    
        Users user = userExists.get();
        Users sendingUser = senderExists.get();
    

            if (user.getConnections() == null || sendingUser.getConnections() == null) {
                return;
            }
            if (user.getConnections().contains(sender)) {
                user.getConnections().remove(sender);
            }
            if (sendingUser.getConnections().contains(reciever)) {
                sendingUser.getConnections().remove(reciever);
            }
    
            userRepository.save(user);
            userRepository.save(sendingUser);
    }

    // public void acceptChallenge(){

    // }

}
