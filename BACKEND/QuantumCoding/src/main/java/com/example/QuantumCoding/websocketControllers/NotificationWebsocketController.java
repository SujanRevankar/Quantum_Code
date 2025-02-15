package com.example.QuantumCoding.websocketControllers;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.auth.MessageRequest;
import com.example.QuantumCoding.guild.GuildServices;
import com.example.QuantumCoding.services.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NotificationWebsocketController {

   private static final Logger logger = LoggerFactory.getLogger(NotificationWebsocketController.class);

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificationService notificationService;
    private final GuildServices guildServices;

    private Map<String, String> formatMessage(MessageRequest messageRequest,String acceptMsg) {
        Map<String, String> formattedMessage = new HashMap<>();
        formattedMessage.put("sender", messageRequest.getSender());
        formattedMessage.put("reciever", messageRequest.getReciever());
        formattedMessage.put("message", messageRequest.getMessage());
        if(acceptMsg.equals("Accept"))
            formattedMessage.put("type", "Accept");
        else
            formattedMessage.put("type", messageRequest.getType());

        return formattedMessage;
    }

    @MessageMapping("/sendMessage")
    public void handleMessage(@Payload MessageRequest messageRequest, SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> response = new HashMap<>();
        try {
            if(messageRequest.getType().equals("GuildRequest")){
                String result=guildServices.checkBeforeRequestToGuild(messageRequest.getSender());
                if(!result.equals("Success")){
                    response.put("status", "error");
                    response.put("message", "Already in the guild "+result);
                    simpMessagingTemplate.convertAndSendToUser(
                        messageRequest.getSender(),
                        "/queue/responses",
                        response
                    );
                    return;
                }
            }
            String saveResult = notificationService.saveNotification(
                messageRequest.getSender(),
                messageRequest.getReciever(),
                messageRequest.getMessage(),
                messageRequest.getType()
            );

            if ("Success".equals(saveResult)) {
                response.put("status", "success");
                response.put("message", "Request sent successfully!");
                response.put("data", messageRequest);

                // Notify the sender
                simpMessagingTemplate.convertAndSendToUser(
                    messageRequest.getSender(),
                    "/queue/responses",
                    response
                );

                // Notify the recipient
                Map<String, String> formattedMessage = formatMessage(messageRequest,"Request");
                simpMessagingTemplate.convertAndSendToUser(
                    messageRequest.getReciever(),
                    "/queue/notifications",
                    formattedMessage
                );
            }
            else if("User Requested".equals(saveResult)){
                response.put("status", "confusion");
                response.put("message", messageRequest.getReciever()+" already requested you.");
                simpMessagingTemplate.convertAndSendToUser(
                    messageRequest.getSender(),
                    "/queue/responses",
                    response
                );
            } 
            else {
                response.put("status", "error");
                response.put("message", "Already requested.");
                simpMessagingTemplate.convertAndSendToUser(
                    messageRequest.getSender(),
                    "/queue/responses",
                    response
                );
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Internal server error.");
            simpMessagingTemplate.convertAndSendToUser(
                messageRequest.getSender(),
                "/queue/responses",
                response
            );
        }
    }


    @MessageMapping("/sendReqAccMessage")
    public void sendRequestAcceptedMessage(MessageRequest messageRequest){
        System.out.println("Iam the owner");
        try {
            String res="";
            Map<String, String> formattedMessage = formatMessage(messageRequest,"Accept");
            if(messageRequest.getType().equals("REQUEST")){
                System.out.println("Iam request");
                res=notificationService.acceptRequest(messageRequest.getSender(), messageRequest.getReciever(),messageRequest.getMessage());
            }
            else if(messageRequest.getType().equals("ADMINREQUEST")){
                notificationService.acceptAdminRequest(messageRequest.getSender(), messageRequest.getReciever(),messageRequest.getMessage());
            }
            else{
                System.out.println("Hi iam entering the controller");
                notificationService.acceptGuildRequest(messageRequest.getSender(), messageRequest.getReciever(),messageRequest.getMessage());
            }
            if(res.equals("Success")){
                System.out.println("res"+res);
                simpMessagingTemplate.convertAndSendToUser(messageRequest.getSender(), "/queue/notifications/accept",formattedMessage);
            }
            else{
                simpMessagingTemplate.convertAndSendToUser(messageRequest.getReciever(), "/queue/notifications/failed",res);
            }
        } catch (Exception e) {
            logger.error("Failed to handle message: {}", e.getMessage());
        }
    }
}
