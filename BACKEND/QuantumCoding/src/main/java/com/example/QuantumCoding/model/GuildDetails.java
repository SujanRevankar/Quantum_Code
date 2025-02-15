package com.example.QuantumCoding.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "guild_details")
@Getter
@Setter
@Builder
public class GuildDetails {

    @Id
    private String guildId;

    @Indexed(unique=true)
    private String guildName;
    
    private String admin;
    private List<String> members=new ArrayList<>();

    private int qubits;

    private String challengeAccepted;
    private String challengeId;
}
