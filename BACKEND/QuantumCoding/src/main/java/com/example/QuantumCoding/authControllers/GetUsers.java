package com.example.QuantumCoding.authControllers;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.AllQuestionsServices.AllProgrammingQuestionsServices;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.guild.GuildServices;
import com.example.QuantumCoding.model.GuildDetails;
import com.example.QuantumCoding.model.Status;
import com.example.QuantumCoding.model.UserResponse;
import com.example.QuantumCoding.model.Users;
import com.example.QuantumCoding.services.NotificationService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/get")
@AllArgsConstructor
@CrossOrigin(origins="http://localhost:5173")
public class GetUsers {
    
    // @Autowired
    private final UserRepository repo;
    // @Autowired
    private final GuildServices guildServices;
    private final AllProgrammingQuestionsServices allProgrammingQuestionsServices;
    private final NotificationService notificationService;

    @GetMapping("/details")
    public ResponseEntity<?> gettingDetails(Principal principal) {
        // Fetch Authentication object from SecurityContext
        Authentication authentication = (Authentication) SecurityContextHolder.getContext().getAuthentication();

        // Retrieve UserDetails or custom user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Extract details from UserDetails
        String email = userDetails.getUsername(); // Extract username
        System.out.println("Iam just checking dont worry"+email);
        // Collection<? extends GrantedAuthority> roles = userDetails.getAuthorities(); // Extract roles

        // Fetch additional user data from the database if required
        Optional<Users> userExistence = repo.findByEmail(email);
        if(userExistence.isPresent()){
            Users user=userExistence.get();
            UserResponse userResponse=new UserResponse();
            boolean java=user.getLanguages().contains("Java");
            boolean python=user.getLanguages().contains("Python");
            List<Long> allCounts=allProgrammingQuestionsServices.getAllQuestionsCounts(user.getStage(), user.getByUserEmail(), java, python);
            long notificationCount=notificationService.getAllNotificationCount(user.getByUserEmail(),user.getGuildName());
            userResponse.setUsername(user.getByUserEmail());
            userResponse.setEmail(user.getUsername());
            userResponse.setBadges(user.getBadges());
            userResponse.setConnections(user.getConnections());
            userResponse.setGithub(user.getGithub());
            userResponse.setLinkedIn(user.getLinkedIn());
            userResponse.setStage(user.getStage());
            userResponse.setTotalQubits(user.getTotalQubits());
            userResponse.setLanguages(user.getLanguages());
            userResponse.setGuildname(user.getGuildName());
            userResponse.setRole(user.getRole());
            userResponse.setVerified(user.isVerified());
            userResponse.setAllQuestions(allCounts.get(0));
            if(java)
                userResponse.setJavaSolvedQuestions(allCounts.get(1));
            if(python)
                userResponse.setPythonSolvedQuestions(allCounts.get(2));
            userResponse.setNotificationCount(notificationCount);
            return ResponseEntity.ok(userResponse);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not valid");
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@RequestParam String searchUser){
        if(searchUser.equals("GUILDSEARCH")){
            List<Users> guildSearch=guildServices.getGuildUsersWithDetails();
            if(guildSearch.size()==0 || guildSearch==null){
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Empty");
            }
            return ResponseEntity.ok(guildSearch);
        }
        else if(searchUser.equals("GUILDNAMES")){
            List<GuildDetails> guildNames=guildServices.getAllGuildDetails();
            if(guildNames.size()==0 || guildNames==null){
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Empty");
            }
            return ResponseEntity.ok(guildNames);
        }
        else{
            List<Users> guildSearchUsers=guildServices.getUsersWithDetails();
            if(guildSearchUsers.size()==0 || guildSearchUsers==null){
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Empty");
            }
            return ResponseEntity.ok(guildSearchUsers);
        }

    }
    // @GetMapping("/")
    @PostMapping("/add")
    public ResponseEntity<String> addingSomeInformation(@RequestBody InfoRequest infoRequest){
        String linkedin=infoRequest.getLinkedin();
        String github=infoRequest.getGithub();
        String language=infoRequest.getLanguage();
        // String type=infoRequest.getType();
        String username=infoRequest.getUsername();
        guildServices.addingExtraInformation(linkedin,github,language,username);

        return ResponseEntity.ok("Added Successfully");
    }

    @PostMapping("/add/languages")
    public ResponseEntity<String> addingextraLanguagesToDatabase(@RequestBody LanguageModel languageModel){
        String result=guildServices.addLanguagesToTheDB(languageModel.getUsername(),languageModel.getLanguage());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> gettingTheLeaderboardList(){
        List<Users> allUsersLeaderboardDetails=guildServices.getAllStageUsersLeaderBoardList();
        System.out.println(allUsersLeaderboardDetails);
        if(allUsersLeaderboardDetails.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Empty");
        }
        return ResponseEntity.ok(allUsersLeaderboardDetails);
    }

    @GetMapping("/leaderboard/stage")
    public ResponseEntity<?> gettingTheLeaderboardListBasedOnstage(@RequestParam String status){
        Status stage=Status.BEGINNER;
        if(status.equals("INTERMEDIATE"))
            stage=Status.INTERMEDIATE;
        else if(status.equals("ADVANCED"))
            stage=Status.ADVANCED;
        List<Users> allUsersLeaderboardDetails=guildServices.getAllUsersDetailsForLeaderBoardBasedOnStage(stage);
        if(allUsersLeaderboardDetails.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Empty");
        }
        return ResponseEntity.ok(allUsersLeaderboardDetails);
    }

    

    public static class InfoRequest{
        private String linkedin;
        private String github;
        private String language;
        // private String type;
        private String username;

        public String getUsername() {
            return username;
        }
        public void setUsername(String username) {
            this.username = username;
        }
        public void setLinkedin(String linkedin) {
            this.linkedin = linkedin;
        }
        public void setGithub(String github) {
            this.github = github;
        }
        public void setLanguage(String language) {
            this.language = language;
        }
        // public void setType(String type) {
        //     this.type = type;
        // }
        public String getLinkedin() {
            return linkedin;
        }
        public String getGithub() {
            return github;
        }
        public String getLanguage() {
            return language;
        }
        // public String getType() {
        //     return type;
        // }
        
    }

    
}
