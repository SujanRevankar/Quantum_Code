package com.example.QuantumCoding.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.example.QuantumCoding.codingModels.TestCases;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Document(collection="guild_challenges")
@Builder
@Getter
@Setter
public class GuildChallenges {

    @Id
    private String guildId;

    private String guildName;
    private String guildAdmin;
    private String postedBy;
    private String title;
    private String description;
    private String inputFormat;
    private String outputFormat;
    private List<Map<String,String>> exampleTestCaes;
    private List<Map<String,String>> hiddenTestCases;
    private List<Map<String,Object>> solutions;
    @Field("status")
    private ChallengeStatus status;
    private List<String> approvedBy;
    private boolean approveStatus;
    private String acceptedGuildName;
    private LocalDateTime expiryDateTime;    
    private int timeLimit;
    private int qubits;
}
