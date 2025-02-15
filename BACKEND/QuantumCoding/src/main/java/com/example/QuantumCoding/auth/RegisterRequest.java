package com.example.QuantumCoding.auth;

import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.Size;
import com.example.QuantumCoding.model.Role;
import com.example.QuantumCoding.model.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String id;

        private String name;


        private String username;


        private String email;

        Status stage=Status.BEGINNER;
        private String linkedIn;
        private String github;

        @Size(min=8,max=50)
        private String password;

        private List<String> Connections=new ArrayList<>();

        private String guildName;

        private List<String> languages=new ArrayList<>();

        private int badges=0;

        private int totalQubits=0;

        private boolean verified=false;

        Role role=Role.USER;
}
