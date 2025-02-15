package com.example.QuantumCoding.guild;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.GuildChallengesRepository;
import com.example.QuantumCoding.Repositories.GuildRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.guildControllers.PostQuestionModel;
import com.example.QuantumCoding.model.ChallengeStatus;
import com.example.QuantumCoding.model.GuildChallenges;
import com.example.QuantumCoding.model.GuildDetails;
import com.example.QuantumCoding.model.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GuildChallengeServices {

    private final GuildChallengesRepository guildChallengesRepository;
    private final GuildRepository guildRepository;
    private final UserRepository userRepository;

    public String saveGuildChallengeInDatabase(PostQuestionModel postQuestionModel){
        try{
            Optional<GuildDetails> guildTeamExist=guildRepository.findByGuildName(postQuestionModel.getGuildName());
            if(guildTeamExist.isPresent()){
                GuildDetails guildTeam=guildTeamExist.get();
                boolean status=false;
                if(guildTeam.getMembers().size()==0){
                    status=true;
                }
                int availableQubits=guildTeam.getQubits()-postQuestionModel.getQubits();
                if(availableQubits<=0){
                    throw new IllegalArgumentException("Insufficient Qubits");
                }
                GuildChallenges guildChallenges=GuildChallenges.builder()
                .guildName(postQuestionModel.getGuildName())
                .guildAdmin(guildTeam.getAdmin())
                .postedBy(postQuestionModel.getPostedBy())
                .title(postQuestionModel.getTitle())
                .description(postQuestionModel.getTitle())
                .inputFormat(postQuestionModel.getInputFormat())
                .outputFormat(postQuestionModel.getOutputFormat())
                .exampleTestCaes(postQuestionModel.getExampleTestCases())
                .hiddenTestCases(postQuestionModel.getHiddenTestCases())
                .solutions(postQuestionModel.getSolutions())
                .status(ChallengeStatus.UNSOLVED)
                .approvedBy(Collections.singletonList(postQuestionModel.getPostedBy()))
                .approveStatus(status)
                .acceptedGuildName("")
                .expiryDateTime(LocalDateTime.now())  
                .timeLimit(postQuestionModel.getTimeLimit())
                .qubits(postQuestionModel.getQubits()).build();


                guildTeam.setQubits(availableQubits);
                guildRepository.save(guildTeam);
                guildChallengesRepository.save(guildChallenges);

            }
            else{
                throw new NoSuchElementException("Guild not found");
            }

        }catch(Exception e){
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
        return "Success";
    }

    public String guildAccept(String username,String guildName,String guildId){
        Optional<GuildChallenges> guildExist=guildChallengesRepository.findByGuildChallengeIdToModify(guildId);
        Optional<GuildDetails> guildChallengeAcceptExist=guildRepository.findByGuildName(guildName);
        if(guildExist.isPresent() && guildChallengeAcceptExist.isPresent()){
            GuildChallenges guildExisted=guildExist.get();
            GuildDetails guildChallengeAcc=guildChallengeAcceptExist.get();
            if(guildChallengeAcc.getQubits()>=guildExisted.getQubits()){
                int timeLimit=guildExisted.getTimeLimit();
                guildExisted.setExpiryDateTime(LocalDateTime.now());
                guildExisted.setAcceptedGuildName(guildName);
                guildExisted.setStatus(ChallengeStatus.ACCEPTED);
                guildChallengesRepository.save(guildExisted);

                guildChallengeAcc.setChallengeAccepted("Yes");
                guildChallengeAcc.setChallengeId(guildId);
                guildRepository.save(guildChallengeAcc);
                return "Success";
            }
            return "Insuffiecient qubits";
        }
        return "question or guild not present";
    }

    public Optional<GuildChallenges> getSpecificChallengeToSolve(String guildId) {
        return guildChallengesRepository.findByGuildChallengeId(guildId);
    }

    public String modifyTimeLimit(String guildId){
        System.out.println("Myguildid");
        System.out.println(guildId);
        Optional<GuildChallenges> challenge=guildChallengesRepository.findByGuildChallengeIdToModify(guildId);
        if(challenge.isPresent()){
            GuildChallenges getChallenge=challenge.get();
            int timeLimit = getChallenge.getTimeLimit();  // Time limit in minutes
            LocalDateTime expiryDateTime = LocalDateTime.now().plus(timeLimit, ChronoUnit.MINUTES);
    
            getChallenge.setExpiryDateTime(expiryDateTime);
            guildChallengesRepository.save(getChallenge);
            return "Success";
        }
        return "Failed";
    }
    

    public String solvedGuildChallenge(String id,String guildName,String username){
        Optional<GuildChallenges> guildExist=guildChallengesRepository.findByGuildChallengeIdToModify(id);
        Optional<GuildDetails> guildChallengeAcceptExist=guildRepository.findByGuildName(guildName);
        Optional<Users> userDetails=userRepository.findByUsername(username);
        if(guildExist.isPresent() && guildChallengeAcceptExist.isPresent() && userDetails.isPresent()){
            Users user=userDetails.get();
            GuildChallenges guildExisted=guildExist.get();
            Optional<GuildDetails> guildLostTeam=guildRepository.findByGuildName(guildExisted.getGuildName());
            if(guildLostTeam.isPresent()){
                // GuildDetails guildWon=guildWonTeam.get();
                // guildWon.setQubits(guildExisted.getQubits()*2);
                // guildRepository.save(guildWon);

                GuildDetails guildChallengeAcc=guildChallengeAcceptExist.get();
                guildChallengeAcc.setQubits(guildChallengeAcc.getQubits()+(guildExisted.getQubits()/2));
                user.setTotalQubits(user.getTotalQubits()+(int)(guildExisted.getQubits()/2));
                user.setBadges((int)(user.getTotalQubits()+(guildExisted.getQubits()/2))/10);
                userRepository.save(user);
                guildChallengeAcc.setChallengeAccepted("No");
                guildRepository.save(guildChallengeAcc);

                guildExisted.setQubits(0);
                guildExisted.setStatus(ChallengeStatus.SOLVED);
                guildChallengesRepository.save(guildExisted);

                return "Success";
            }
            return "Failed";
        }
        return "Failed";
    }

    public String unsolvedGuildChallenge(String id,String guildName){
        Optional<GuildChallenges> guildExist=guildChallengesRepository.findByGuildChallengeIdToModify(id);
        Optional<GuildDetails> guildChallengeAcceptExist=guildRepository.findByGuildName(guildName);
        if(guildExist.isPresent() && guildChallengeAcceptExist.isPresent()){
            GuildChallenges guildExisted=guildExist.get();
            Optional<GuildDetails> guildWonTeam=guildRepository.findByGuildName(guildExisted.getGuildName());
            if(guildWonTeam.isPresent()){
                GuildDetails guildWon=guildWonTeam.get();
                guildWon.setQubits(guildExisted.getQubits()+guildWon.getQubits());
                guildRepository.save(guildWon);

                GuildDetails guildChallengeAcc=guildChallengeAcceptExist.get();
                guildChallengeAcc.setQubits(guildChallengeAcc.getQubits()-guildExisted.getQubits());
                guildRepository.save(guildChallengeAcc);

                guildExisted.setStatus(ChallengeStatus.UNSOLVED);
                guildExisted.setExpiryDateTime(LocalDateTime.now());
                guildChallengesRepository.save(guildExisted);

                return "Success";
            }
            return "Failed";
        }
        return "Failed";
    }

    public List<GuildChallenges> notApprovedGuildChallenges(String guildname, String username) {
        List<GuildChallenges> notApprovedQuestions = guildChallengesRepository.findNotApprovedQuestions(guildname);
        return notApprovedQuestions;
    }

    public String challengeApprovedByUser(String username,String guildname,String id){
        Optional<GuildChallenges> notApprovedGuildChallenge=guildChallengesRepository.findByGuildChallengeIdToModify(id);
        Optional<GuildDetails> guildDetails=guildRepository.findByGuildName(guildname);
        if(notApprovedGuildChallenge.isPresent() && guildDetails.isPresent()){
            GuildDetails details=guildDetails.get();
            GuildChallenges notApprovedChallenge=notApprovedGuildChallenge.get();
            List<String> approvedBy=notApprovedChallenge.getApprovedBy();
            approvedBy.add(username);
            if(details.getMembers().size()+1==approvedBy.size()){
                notApprovedChallenge.setApproveStatus(true);
            }
            notApprovedChallenge.setApprovedBy(approvedBy);
            guildChallengesRepository.save(notApprovedChallenge);
            return "Success";
        }
        return "Failed";
    }

    public List<GuildChallenges> approvedGuildChallenges(String guildname){
        List<GuildChallenges> getApprovedChallengeses=guildChallengesRepository.findAllUnsolvedChallenges(guildname);
        return getApprovedChallengeses;        
    }

    public List<GuildChallenges> getAllApprovedAndUnsolvedGuildChallenges(){
        List<GuildChallenges> unsolvedGuildChallengePro=guildChallengesRepository.findAllProblems();
        return unsolvedGuildChallengePro;
    }


    
}
