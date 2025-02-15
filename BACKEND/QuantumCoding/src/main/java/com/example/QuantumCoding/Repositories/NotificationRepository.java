package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.QuantumCoding.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String>
{
     List<Notification> findByReciever(String reciever);

     List<Notification> findBySender(String sender);
 
     @Query("{ '$or': [ { 'sender': ?0 }, { 'reciever': ?0 }, { 'sender': ?1 }, { 'reciever': ?1 } ] }")
     List<Notification> findBySenderOrReciever(String username, String guildName);

     @Query(value = "{ '$or': [ { 'sender': ?0 }, { 'reciever': ?0 }, { 'sender': ?1 }, { 'reciever': ?1 } ] }", count = true)
     long countBySenderOrReceiver(String username, String guildName);

 
     @Query("{ 'sender': ?0, 'reciever': ?1, 'message': ?2 }")
     Optional<Notification> findBySenderAndRecieverAndMessage(String sender, String reciever, String message);

     @Query("{ 'sender': ?0, 'type': 'GUILDREQUEST' }")
     Optional<Notification> findBySenderAndType(String sender);
     
}
