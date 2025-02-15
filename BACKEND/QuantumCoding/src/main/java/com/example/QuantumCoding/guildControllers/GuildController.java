package com.example.QuantumCoding.guildControllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.Repositories.GuildChallengesRepository;
import com.example.QuantumCoding.codingControllers.ExecutionResult;
import com.example.QuantumCoding.codingModels.TestCases;
import com.example.QuantumCoding.guild.GuildChallengeServices;
import com.example.QuantumCoding.guild.GuildServices;
import com.example.QuantumCoding.guild.ProgrammingExecutorServices;
import com.example.QuantumCoding.model.GuildChallenges;
import com.example.QuantumCoding.model.GuildDetails;
import com.example.QuantumCoding.services.NotificationService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GuildController {

    private final ProgrammingExecutorServices programmingExecutorServices; 
    private final GuildServices guildServices;
    private final GuildChallengeServices guildChallengeServices;
    private final NotificationService notificationService;
    private final GuildChallengesRepository guildChallengesRepository;

    @GetMapping("/get/guild/details")
    public ResponseEntity<?> getAllTheDetailsOfGuild(@RequestParam String guildname){
        try{
            GuildDetails guildAllDetails=guildServices.getGuildDetails(guildname);
            return ResponseEntity.ok(guildAllDetails);

        }
        catch(RuntimeException e){
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

    }

    @PostMapping("/check/questions")
    public ResponseEntity<?> addGuildChallenge(@RequestBody ChallengeModel challengeModel) {
        try {
            ExecutionResult executionResult = programmingExecutorServices.executingTheSampleCode(challengeModel);
            return ResponseEntity.ok(executionResult);
        } 
        catch (RuntimeException e) {
                String errorMessage = "An error occurred while executing the code: " + e.getMessage();
                return ResponseEntity.badRequest().body(errorMessage);
        }
    }

    @PostMapping("/post/question")
    public ResponseEntity<?> addChallengedQuestion(@RequestBody PostQuestionModel postQuestionModel){
        try {
            String postingQuestion = guildChallengeServices.saveGuildChallengeInDatabase(postQuestionModel);
            return ResponseEntity.ok("Success");
        } 
        catch (RuntimeException e) {
            System.out.println("InsufficientQUbits");
                String errorMessage = e.getMessage();
                return ResponseEntity.badRequest().body(errorMessage);
        }
    }
    
    
    @PostMapping("/createguild")
    public ResponseEntity<?> createNewGuild(@RequestBody CreateGuildModel createGuildModel){
        String admin=createGuildModel.getAdmin();
        String guildname=createGuildModel.getGuildname();
        String createGuildStatus=guildServices.createGuild(admin, guildname);
        System.out.println(createGuildStatus);
        if(createGuildStatus.equals("Failed")){
            return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).body("The "+guildname+" guild already existed");
        }
        if(createGuildStatus.equals("present")){
            return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).body("Already in the guild");
        }
        return ResponseEntity.ok("Success");
    }
    @PostMapping("/add/userTo/guild")
    public ResponseEntity<?> addUserToTheGuild(@RequestBody CreateGuildModel createGuildModel){
        String username=createGuildModel.getUsername();
        String guildname=createGuildModel.getGuildname();
        String addUserGuild=guildServices.addUserToGuild(username, guildname);
        if(addUserGuild.equals("Success")){
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(addUserGuild);
    }

    @GetMapping("/get/{sender}/notification")
    public ResponseEntity<?> getUserNotificationDetails(@PathVariable String sender){
        try {
            System.out.println("Sender details: " + sender); // Replace with a logger in production
            String finalOutcome = notificationService.getNotificationDetails(sender);
    
            // Check if outcome is null or empty, handle accordingly
            if (finalOutcome == null || finalOutcome.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                     .body("No notifications found for user: " + sender);
            }
    
            // Return response with data
            return ResponseEntity.ok(finalOutcome);
    
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("An error occurred while fetching notifications");
        }
    }
    
    @GetMapping("/get/{guildname}/{username}/not_approved_questions")
    public ResponseEntity<?> getAllNotApprovedQuestions(@PathVariable String guildname,@PathVariable String username){
        List<GuildChallenges> notApprovedChallenges=guildChallengeServices.notApprovedGuildChallenges(guildname, username);
        if(!notApprovedChallenges.isEmpty()){
            return ResponseEntity.ok(notApprovedChallenges);
        }
        return ResponseEntity.ok("Not found");
    }
    @PostMapping("/approve")
    public ResponseEntity<?> approveThePostedQuestion(
            @RequestParam String username,
            @RequestParam String guildname,
            @RequestParam String guildId) {
        System.out.println("HI");
        String lastOutcome=guildChallengeServices.challengeApprovedByUser(username,guildname,guildId);
        if(lastOutcome.equals("Success")){
            return ResponseEntity.ok("Question approved by " + username + " in guild " + guildname);
        }
        return ResponseEntity.badRequest().body("Failed");
    }
    
    @GetMapping("/get/approved/questions/{guildname}")
    public ResponseEntity<?> allApprovedQuestions(@PathVariable String guildname){
        List<GuildChallenges> allUnsolvedChallenges=guildChallengeServices.approvedGuildChallenges(guildname);
        if(allUnsolvedChallenges.isEmpty()){
            return ResponseEntity.ok("not data found");
        }
        return ResponseEntity.ok(allUnsolvedChallenges);

    }


    @GetMapping("/get/all/unsolved/approved/problems")
    public ResponseEntity<?> getAllUnsolvedProblems() {
        List<GuildChallenges> allUnsolvedANApprovedPro=guildChallengeServices.getAllApprovedAndUnsolvedGuildChallenges();
        if(allUnsolvedANApprovedPro.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No data available");
        }
        return ResponseEntity.ok(allUnsolvedANApprovedPro);
    }

    @PostMapping("/accept/challenge")
    public ResponseEntity<?> acceptTheGuildChallenge(@RequestParam String username,@RequestParam String guildname,@RequestParam String guildId) {
        String outcome=guildChallengeServices.guildAccept(username, guildname, guildId);
        if(outcome.equals("Success")){
            return ResponseEntity.ok(outcome);
        }
        else if(outcome.equals("question or guild not present")){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(outcome);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(outcome);
    }

    @GetMapping("/get/accept/problem/solve/{guildId}")
    public ResponseEntity<?> getSpecificChallengeToSolve(@PathVariable String guildId) {
        Optional<GuildChallenges> specificProblem=guildChallengeServices.getSpecificChallengeToSolve(guildId);
        if(specificProblem.isPresent()){
            GuildChallenges problem=specificProblem.get();
            return ResponseEntity.ok(problem);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Not Found");
    }
    
    @PostMapping("/add/time_limit/{guildId}")
    public ResponseEntity<String> postMethodName(@PathVariable String guildId) {
        //TODO: process POST request
        System.out.println("Guild ID"+guildId);
        String finalResult=guildChallengeServices.modifyTimeLimit(guildId);
        if(finalResult.equals("Success"))
            return ResponseEntity.ok(finalResult);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Guild Challenge Not Found");
    }
    
    @PostMapping("/check/solution/to/problem")
    public ResponseEntity<?> checkChallengeSolutions(@RequestBody SolvedChallengeModel solvedChallengeModel){
        Optional<GuildChallenges> getHiddenTestcases=guildChallengesRepository.findByGuildChallengeIdToModify(solvedChallengeModel.getGuildId());
        System.out.println("Testcasse");
        System.out.println(solvedChallengeModel.getTestCases());
        if(getHiddenTestcases.isPresent()){
            GuildChallenges getResult=getHiddenTestcases.get();
            List<Map<String,String>> hiddenTest=getResult.getHiddenTestCases();
            for(Map<String,String> resultCases:hiddenTest){
                String input=resultCases.get("input");
                String expectedOutput=resultCases.get("expectedOutput");
                System.out.println("input "+input+" "+"output "+expectedOutput);
                solvedChallengeModel.getTestCases().add(new TestCases(input,expectedOutput));
            }
            ExecutionResult executionResult=programmingExecutorServices.executingTheCode(solvedChallengeModel);
            LocalDateTime submittedDateTime = LocalDateTime.now();
            LocalDateTime expiryDateTime = getResult.getExpiryDateTime();
            System.out.println("Yes ot not");
            System.out.println(submittedDateTime);
            System.out.println(expiryDateTime);
            System.out.println(submittedDateTime.isBefore(expiryDateTime));
            if (executionResult.getOutputAndQubits().getOverAllOutput().equals("Correct") ){
                if(submittedDateTime.isBefore(expiryDateTime) || submittedDateTime.isEqual(expiryDateTime)){
                    String res=guildChallengeServices.solvedGuildChallenge(solvedChallengeModel.getGuildId(), solvedChallengeModel.getGuildname(),solvedChallengeModel.getUsername());
                    if(res.equals("Success"))
                        return ResponseEntity.ok(executionResult);
                }else{
                    String result=guildChallengeServices.unsolvedGuildChallenge(solvedChallengeModel.getGuildId(), solvedChallengeModel.getGuildname());
                    if (submittedDateTime.isAfter(getResult.getExpiryDateTime())) {
                        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                            .body(Map.of("message", "Time exceeded", "executionResult", executionResult));
                    }
                }
            }else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(executionResult);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error");
    }

    @PostMapping("/delete/guild")
    public ResponseEntity<?> deleteTheGuild(@RequestBody CreateGuildModel createGuildModel){
        String username=createGuildModel.getUsername();
        String guildname=createGuildModel.getGuildname();
        String deleteGuildStatus=guildServices.deleteGuild(username, guildname);
        if(deleteGuildStatus.equals("Success")){
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(deleteGuildStatus);
    }

    @PostMapping("/remove/user/guild")
    public ResponseEntity<?> removeUserFromTheGuild(@RequestBody CreateGuildModel createGuildModel){
        String admin=createGuildModel.getAdmin();
        String username=createGuildModel.getUsername();
        String guildname=createGuildModel.getGuildname();
        String deleteGuildStatus=guildServices.removeUserFromGuild(admin, username, guildname);
        if(deleteGuildStatus.equals("Success")){
            return ResponseEntity.ok("Success");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(deleteGuildStatus);
    }

}
