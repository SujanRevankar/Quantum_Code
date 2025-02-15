package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.QuantumCoding.model.GuildChallenges;

@Repository
public interface GuildChallengesRepository extends MongoRepository<GuildChallenges, String> {

    @Query(value = "{ 'guildId': ?0 }", fields = "{ 'solutions': 0 , 'hiddenTestCases':0}")
    Optional<GuildChallenges> findByGuildChallengeId(String id);
    
    @Query(value = "{ 'guildId': ?0 }")
    Optional<GuildChallenges> findByGuildChallengeIdToModify(String id);

    @Query(value = "{ guildName: ?0, status: 'UNSOLVED', approveStatus: true }", fields = "{ 'solutions': 0 }")
    List<GuildChallenges> findAllUnsolvedChallenges(String guildname);


    @Query(value = "{ 'guildName': ?0, 'approveStatus': false ,status: 'UNSOLVED'}")
    List<GuildChallenges> findNotApprovedQuestions(String guildName);

    @Query(value = "{status: 'UNSOLVED', approveStatus: true }", fields = "{ 'solutions': 0 }")
    List<GuildChallenges> findAllProblems();
    
}
