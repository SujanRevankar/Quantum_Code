package com.example.QuantumCoding.guild;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.GuildRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.model.GuildDetails;
import com.example.QuantumCoding.model.Role;
import com.example.QuantumCoding.model.Status;
import com.example.QuantumCoding.model.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuildServices {

    private final UserRepository repo;
    private final GuildRepository guildRepository;;

    public List<Users> getGuildUsersWithDetails() {
        List<Users> emptyGuildName=repo.findByEmptyGuildName();
        if (emptyGuildName.isEmpty()) {
            return Collections.emptyList();
        }
            return emptyGuildName.stream().map(user -> {
                // Calculate total connections dynamically
                int totalConnections = (user.getConnections() != null) ? user.getConnections().size() : 0;
        
                // Create a new `Users` object with the required fields
                Users simplifiedUser = new Users();
                simplifiedUser.setUsername(user.getByUserEmail()); // Set username
                simplifiedUser.setBadges(user.getBadges()); // Set badges
                simplifiedUser.setTotalQubits(user.getTotalQubits()); // Set totalQubits
                simplifiedUser.setStage(user.getStage()); // Set stage
                simplifiedUser.setConnections(new ArrayList<>(List.of(String.valueOf(totalConnections)))); // Add total connections
        
                return simplifiedUser;
            }).collect(Collectors.toList());
    }
    public List<GuildDetails> getAllGuildDetails(){
        List<GuildDetails> allGuildDetails=guildRepository.findAll();
        if (allGuildDetails.isEmpty()) {
            return Collections.emptyList();
        }
        return allGuildDetails;
    }

    public List<Users> getUsersWithDetails() {
        List<Users> allUsersDetails=repo.findAll();
        if (allUsersDetails.isEmpty()) {
            return Collections.emptyList();
        }
        return allUsersDetails.stream().map(user -> {
            // Calculate total connections dynamically
            int totalConnections = (user.getConnections() != null) ? user.getConnections().size() : 0;
    
            // Create a new `Users` object with the required fields
            Users simplifiedUser = new Users();
            simplifiedUser.setUsername(user.getByUserEmail()); // Set username
            simplifiedUser.setBadges(user.getBadges()); // Set badges
            simplifiedUser.setTotalQubits(user.getTotalQubits()); // Set totalQubits
            simplifiedUser.setStage(user.getStage()); // Set stage
            simplifiedUser.setGuildName(user.getGuildName());
            simplifiedUser.setConnections(new ArrayList<>(List.of(String.valueOf(totalConnections)))); // Add total connections
    
            return simplifiedUser;
        }).collect(Collectors.toList());
    }
    public String addLanguagesToTheDB(String username,String language){
        Optional<Users> userExistsOrNot=repo.findByUsername(username);
        if(!userExistsOrNot.isPresent()){
            return "Failed";
        }
        Users userExisted=userExistsOrNot.get();
        List<String> languageList=userExisted.getLanguages();
        if(languageList.contains(language)){
            return "Failed";
        }
        languageList.add(language);
        userExisted.setLanguages(languageList);
        repo.save(userExisted);
        return "Success";
    }

    public String createGuild(String admin,String guildname){
        Optional<Users> existingUser=repo.findByUsername(admin);
        if(!guildRepository.findByGuildName(guildname).isPresent() && existingUser.isPresent()){
            Users user=existingUser.get();
            if(!user.getGuildName().isEmpty()){
                return "present";
            }
            GuildDetails details=GuildDetails.builder()
            .guildName(guildname)
            .admin(admin)
            .members(new ArrayList<>())
            .qubits(300)
            .challengeAccepted("No")
            .challengeId("")
            .build();
    
            guildRepository.save(details);
            user.setGuildName(guildname);
            user.setGuildRole(Role.ADMIN);
            repo.save(user);
            return "Success";
        }
        return "Failed";
    }

    public String checkBeforeRequestToGuild(String username){
        Optional<Users> usernameInGuild=repo.findGuildNameByUserName(username);
        if(usernameInGuild.isPresent()){
            Users usernamePresent=usernameInGuild.get();
            if(!usernamePresent.getGuildName().isEmpty()){
                return usernamePresent.getGuildName();
            }
        }
        return "Success";
    }

    public String addUserToGuild(String username, String adminname) {
        // Check if the guild exists
        Optional<GuildDetails> existingDetails = guildRepository.findByAdmin(adminname);
        if (existingDetails.isEmpty()) {
            return "Guild not found";
        }
        GuildDetails details = existingDetails.get();
        List<String> members = details.getMembers();
        
        // If the members list is null, initialize it
        if (members == null) {
            members = new ArrayList<>();
        }
    
        // Check if the user is already a member of the guild
        if (members.contains(username)) {
            return "User already a member of the guild";
        }
        
        // Check if the user exists in the system
        Optional<Users> usernameInGuild = repo.findByUsername(username);
        if (usernameInGuild.isEmpty()) {
            return "User not found in the system";
        }
    
        // Add the user to the guild
        Users guildMember = usernameInGuild.get();
        guildMember.setGuildName(details.getGuildName());
        guildMember.setGuildRole(Role.MEMBER);
        repo.save(guildMember); // Save updated user details
    
        // Add user to guild members list and save
        members.add(username);
        details.setMembers(members);
        guildRepository.save(details); // Save updated guild details
    
        return "Success";
    }
    

    public String deleteGuild(String username,String guildname){
        try{
            Optional<GuildDetails> existingDetails=guildRepository.findByGuildName(guildname);
            if(existingDetails.isPresent()){
                GuildDetails guildDetails=existingDetails.get();
                if(guildDetails.getAdmin().equals(username)){
                    for(String memberName:guildDetails.getMembers()){
                        Optional<Users> existingMember=repo.findByUsername(memberName);
                        if(existingMember.isPresent()){
                            Users guildMember=existingMember.get();
                            guildMember.setGuildName("");
                            guildMember.setGuildRole(Role.NONE);
                            repo.save(guildMember);
                        }
                    }
                    guildRepository.delete(guildDetails);
                    return "Success";
                }
                else{
                    return "Admin not found";
                }
            }
            return "Guild not found";
            
        }catch(Exception e){
            e.printStackTrace();
            return "Error";
        }
    }

    public String removeUserFromGuild(String admin,String username,String guildname){
        try{
            Optional<GuildDetails> existingDetails=guildRepository.findByGuildName(guildname);
            if(existingDetails.isPresent()){
                GuildDetails guildDetails=existingDetails.get();
                if(guildDetails.getAdmin().equals(admin)){
                    if(guildDetails.getMembers()!=null && guildDetails.getMembers().contains(username)){
                        guildDetails.getMembers().remove(username);
                        guildRepository.save(guildDetails);
                        Optional<Users> existingMember=repo.findByUsername(username);
                        if(existingMember.isPresent()){
                            Users guildMember=existingMember.get();
                            guildMember.setGuildName("");
                            guildMember.setGuildRole(Role.NONE);
                            repo.save(guildMember);
                        }
                        return "Success";
                    }
                    else{
                        return "Member not found";
                    }
                }
                else{
                    return "Admin not found";
                }
            }
            return "Guild not found";
            
        }catch(Exception e){
            e.printStackTrace();
            return "Error";
        }
    }

    public void addingExtraInformation(String linkedin,String github,String language,String username){

        Optional<Users> existingUser=repo.findByEmail(username);
        if(existingUser.isPresent()){
            Users userIsPresent=existingUser.get();
            userIsPresent.setLinkedIn(linkedin);
            userIsPresent.setGithub(github);
            // if(type.equals("Beginner"))
            //     userIsPresent.setStage(Status.BEGINNER);
            // else if(type.equals("Intermediate"))
            //     userIsPresent.setStage(Status.INTERMEDIATE);
            // else if(type.equals("Advanced"))
            //     userIsPresent.setStage(Status.ADVANCED);
            if(userIsPresent.getLanguages()==null)
                userIsPresent.setLanguages(new ArrayList<>());
            userIsPresent.getLanguages().add(language);
            repo.save(userIsPresent);
        }

    }

    public GuildDetails getGuildDetails(String guildname){
        Optional<GuildDetails> guildExist=guildRepository.findByGuildName(guildname);
        if(guildExist.isPresent()){
            GuildDetails guildDetails=guildExist.get();
            return guildDetails;
        }
        throw new RuntimeException("Guild with name " + guildname + " is not present");
    }

    public List<GuildDetails> getGuildLeaderBoardList() {
        Sort sort = Sort.by(Sort.Direction.DESC, "qubits");
        List<GuildDetails> leaderboard = guildRepository.findAllGuildDetailsForLeaderBoard(sort);
        
        if (!leaderboard.isEmpty()) {
            return leaderboard;
        }
        return Collections.emptyList();
    }
    

    public List<Users> getAllStageUsersLeaderBoardList() {
        Sort sort = Sort.by(Sort.Direction.DESC, "totalQubits");
        List<Users> usersleaderboard = repo.findAllUsersDetailsForLeaderBoard(sort);
        
        if (!usersleaderboard.isEmpty()) {
            return usersleaderboard;
        }
        return Collections.emptyList();
    }

    public List<Users> getAllUsersDetailsForLeaderBoardBasedOnStage(Status stage) {
        Sort sort = Sort.by(Sort.Direction.DESC, "totalQubits");
        List<Users> usersleaderboard = repo.findAllUsersDetailsForLeaderBoardBasedOnsage(sort,stage);
        
        if (!usersleaderboard.isEmpty()) {
            return usersleaderboard;
        }
        return Collections.emptyList();
    }

}
