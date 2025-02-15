package com.example.QuantumCoding.token;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import com.example.QuantumCoding.model.TokenType;
import com.example.QuantumCoding.model.Users;
import lombok.Builder;
import lombok.Data;

@Document(collection = "users_token")
@Data
@Builder
public class Token {
    @Id
    private String id;

    private String token;

    @Field("type")
    private TokenType type=TokenType.Bearer;

    private boolean revoked;

    private boolean expired;

    @DBRef
    private Users user;
}
