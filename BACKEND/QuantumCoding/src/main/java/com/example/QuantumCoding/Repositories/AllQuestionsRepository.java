package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.QuantumCoding.model.AllQuestions;
import com.example.QuantumCoding.model.Status;

@Repository
public interface AllQuestionsRepository extends MongoRepository<AllQuestions, String> {
    @Query(value="{'status':?0}",fields="{hiddenTestCases:0}")
    List<AllQuestions> findAllExcludingTestCases(Status status );

    @Query(value="{'questionId':?0, 'status':?1}")
    Optional<AllQuestions> findAllHiddenTestCases(String questionId,Status status);

    @Query(value="{'questionId':?0}",fields="{'hiddenTestCases':0}")
    Optional<AllQuestions> findByQuestionId(String questionId);

    @Query(value = "{ '$or': [ { 'questionId': ?0 }, { 'title': ?1 } ] }")
    Optional<AllQuestions> findByQuestionIdOrTitle(String questionId, String title);

    @Query(value = "{'status': ?0}", count = true)
    long countAllQuestionsByStatus(Status status);

}
