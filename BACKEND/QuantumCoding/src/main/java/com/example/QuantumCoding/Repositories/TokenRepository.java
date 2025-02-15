package com.example.QuantumCoding.Repositories;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.example.QuantumCoding.token.Token;

public interface TokenRepository extends MongoRepository<Token,String> {

        @Query("{ 'user': ?0, 'revoked': false }")
        Optional<Token> findAllValidTokenByUser(String email);
        Optional<Token> findByToken(String token);
}
