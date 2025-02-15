package com.example.QuantumCoding.model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.QuantumCoding.token.Token;

import lombok.Getter;
import lombok.Setter;


@Document(collection = "Users")
@Getter
@Setter
public class Users implements UserDetails{
        @Id
        private String id;

        @NotBlank
        @Indexed(unique = true)
        @Size(min=4,max=100)
        private String username;

        @NotBlank
        @Email
        @Indexed(unique=true)
        @Size( max=100)
        private String email;

        @Field("stage")
        private Status stage=Status.BEGINNER;
        private String linkedIn;
        private String github;

        @Size(min=8,max=50)
        private String password;

        private List<String> Connections=new ArrayList<>();

        private String guildName;

        @Field("guildRole")
        private Role guildRole;

        private List<String> languages=new ArrayList<>();

        private int badges=0;

        private int totalQubits=0;

        private boolean verified=false;

        @DBRef
        private List<Token> tokens; 

        @Field("role")
        private Role role=Role.USER;

        @Override
        public String toString() {
            return "User [Id=" + id  + ", UserName=" + username + ", Email=" + email + ", Stage="
                    + stage + ", LinkedIn=" + linkedIn + ", Github=" + github + ", Password=" + password
                    + ", Connections=" + Connections + ", GuildName=" + guildName + ", Languages=" + languages
                    + ", Badges=" + badges + ", TotalQubits=" + totalQubits + ", role=" + role + ", verified=" +verified+ "]";
        }

         @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Assuming Role enum has values like USER, ADMIN
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_"+role.name()));
        return authorities;
    }
    public String getByUserEmail(){
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; 
    }

    @Override
    public boolean isEnabled() {
        return true; 
    }
        
}
