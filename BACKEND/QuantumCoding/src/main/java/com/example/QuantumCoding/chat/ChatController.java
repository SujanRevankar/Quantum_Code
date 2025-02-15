package com.example.QuantumCoding.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller

public class ChatController {

        @Autowired
        private SimpMessagingTemplate simpMessagingTemplate;


    @MessageMapping("/guild-message")
    public ChatMessage sendToGuildMessage(@Payload ChatMessage chatMessage ){
        simpMessagingTemplate.convertAndSendToUser(chatMessage.getGuildname(),"/guild",chatMessage.getContent());

        System.out.println("From Send Message"+chatMessage);
        return chatMessage;
 
    }
    // @MessageMapping("/chat.addUser")
    // @SendTo("/topic/public")
    // public ChatMessage addUser(@Payload ChatMessage chatMessage,SimpMessageHeaderAccessor headerAccessor){
    //     headerAccessor.getSessionAttributes().put("username",chatMessage.getSender());
    //     return chatMessage;
    // }
    
@MessageMapping("/java-community-chat")
@SendTo("/chatroom/java")
public ChatMessage javaTestMessage(ChatMessage chatMessage) {
    // List<String> messageList=new ArrayList<>();
    // messageList.add(chatMessage.getContent());
    // messageList.add(chatMessage.getGuildname());
    return chatMessage;
}

@MessageMapping("/python-community-chat")
@SendTo("/chatroom/python")
public ChatMessage pythonTestMessage(ChatMessage chatMessage) {
    // List<String> messageList=new ArrayList<>();
    // messageList.add(chatMessage.getContent());
    // messageList.add(chatMessage.getGuildname());
    return chatMessage;
}

}
