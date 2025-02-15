package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.QuantumCoding.model.SavePythonSolvedQuestions;
import com.example.QuantumCoding.model.Status;

@Repository
public interface SavePythonSolvedQuestionsRepository extends  MongoRepository<SavePythonSolvedQuestions, String>{

    @Query("{ 'username': ?0, 'status': ?1, 'questionId': ?2 }")
    Optional<String> findSolutionByUsernameAndTypeAndQuestion(String username, Status status, String questionId);
    
    @Query("{ 'username': ?0, 'status': ?1, 'questionId':?2 }")
    Optional<SavePythonSolvedQuestions> findByUsernameAndTypeAndQuestionId(String username,Status status,String questionNo);

    @Query("{ 'username': ?0, 'status': ?1 }")
    Optional<SavePythonSolvedQuestions> findByUsernameAndType(String username,Status status);

    @Query(value = "{ 'username': ?0, 'status': ?1 }", fields = "{'gainedQubits': 1, 'questionId': 1, '_id': 0}")
    List<SavePythonSolvedQuestions> findByUsernameAndTypeGetgainedQubits(String username, Status status);

    @Query(value = "{'username': ?0, 'status': ?1, 'gainedQubits': { $gt: 0 }}", count = true)
    long countAllSolvedQuestions(String username, Status status);
}
