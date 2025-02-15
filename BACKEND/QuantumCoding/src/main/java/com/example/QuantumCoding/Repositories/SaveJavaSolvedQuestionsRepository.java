package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.QuantumCoding.model.SaveJavaSolvedQuestions;
import com.example.QuantumCoding.model.Status;


@Repository
public interface SaveJavaSolvedQuestionsRepository extends MongoRepository<SaveJavaSolvedQuestions, String> {

    @Query("{ 'username': ?0, 'status': ?1, 'questionId': ?2 }")
    Optional<String> findSolutionByUsernameAndTypeAndQuestion(String username, Status status, String questionId);
    
    @Query("{ 'username': ?0, 'status': ?1, 'questionId':?2 }")
    Optional<SaveJavaSolvedQuestions> findByUsernameAndTypeAndQuestionId(String username,Status status,String questionNo);

    @Query("{ 'username': ?0, 'status': ?1 }")
    List<SaveJavaSolvedQuestions> findByUsernameAndType(String username,Status status);

    @Query(value = "{ 'username': ?0, 'status': ?1 }", fields = "{'gainedQubits': 1, 'questionId': 1, '_id': 0}")
    List<SaveJavaSolvedQuestions> findByUsernameAndTypeGetgainedQubits(String username, Status status);


    @Query(value = "{'username': ?0, 'status': ?1, 'gainedQubits': { $gt: 0 }}", count = true)
    long countAllSolvedQuestions(String username, Status status);
    
    
}
