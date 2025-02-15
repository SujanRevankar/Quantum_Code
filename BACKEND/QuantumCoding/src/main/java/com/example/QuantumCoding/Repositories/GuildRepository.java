package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.QuantumCoding.model.GuildDetails;

public interface GuildRepository extends MongoRepository< GuildDetails,String>{

    Optional<GuildDetails> findByGuildName(String guildname);
    Optional<GuildDetails> findByAdmin(String adminname);

    @Query(value = "{}", fields = "{'qubits': 0, 'challengeAccepted': 0, 'challengeId': 0}")
    List<GuildDetails> findAllGuildDetails();

    @Query(value = "{}", fields = "{'guildId': 1, 'guildName': 1, 'qubits': 1, '_id': 0}")
    List<GuildDetails> findAllGuildDetailsForLeaderBoard(Sort sort);
    

    
    
    
}
