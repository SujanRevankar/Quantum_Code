package com.example.QuantumCoding.AllQuestionsServices;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.AllQuestionsRepository;
import com.example.QuantumCoding.Repositories.SaveJavaSolvedQuestionsRepository;
import com.example.QuantumCoding.Repositories.SavePythonSolvedQuestionsRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.model.AllQuestions;
import com.example.QuantumCoding.model.SaveJavaSolvedQuestions;
import com.example.QuantumCoding.model.SavePythonSolvedQuestions;
import com.example.QuantumCoding.model.Status;
import com.example.QuantumCoding.model.Submission;
import com.example.QuantumCoding.model.Users;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SaveSolutionsInDataBaseService {

    private final SaveJavaSolvedQuestionsRepository saveJavaSolvedQuestionsRepository;
    private final SavePythonSolvedQuestionsRepository savePythonSolvedQuestionsRepository;
    private final UserRepository userRepository;
    private final AllQuestionsRepository allQuestionsRepository;

    public void saveTheSolvedSolution(String username,Status status,String questionId,String code,String overAllOutput, int gainedQubits,String language){
        Optional<Users> userDetails=userRepository.findByUsername(username);
        if(!userDetails.isPresent()){
            System.out.println("User not present");
            return;
        }
        System.out.println("Nammme "+username+" "+gainedQubits);
        Users userExist=userDetails.get();
        if(language.equals("Java")){
            Optional<SaveJavaSolvedQuestions> existingUser = saveJavaSolvedQuestionsRepository.findByUsernameAndTypeAndQuestionId(username,status,questionId);
            if(existingUser.isPresent()){
                SaveJavaSolvedQuestions userIsPresent=existingUser.get();
                SaveJavaSolvedQuestions(userIsPresent,userExist,overAllOutput,gainedQubits,questionId,code,username,status);
            }
            else{
                savingTheJavaUserNotPresent(userExist,code,overAllOutput,gainedQubits,questionId, username,status);           
            }

        }
        else if(language.equals("Python")){
            Optional<SavePythonSolvedQuestions> existingUser = savePythonSolvedQuestionsRepository.findByUsernameAndTypeAndQuestionId(username,status,questionId);
            if(existingUser.isPresent()){
                SavePythonSolvedQuestions userIsPresent=existingUser.get();
                SavePythonSolvedQuestions(userIsPresent,userExist,overAllOutput,gainedQubits,questionId,code,username,status);
            }
            else{
                savingThePythonUserNotPresent(userExist,code,overAllOutput,gainedQubits,questionId, username,status);           
            }
        }
    }

    private void SaveJavaSolvedQuestions(SaveJavaSolvedQuestions existingUser,Users userExist,String overAllOutput,int gainedQubits,String questionId,String code,String username,Status status){
        Optional<AllQuestions> questionDetails=allQuestionsRepository.findByQuestionId(questionId);
        if( overAllOutput.equals("Correct")){
            savingCorrectJavaSolution(existingUser, userExist, code, overAllOutput, gainedQubits);
        }
        else if( overAllOutput.equals("Incorrect")){
            savingIncorrectJavaSolution(existingUser, code, overAllOutput);

        }
        else{
            if(overAllOutput.equals("Correct")){
                userExist.setTotalQubits(userExist.getBadges()+(gainedQubits));
                userExist.setBadges((int)((userExist.getBadges()+(gainedQubits))/10));
                userRepository.save(userExist);
            }
            SaveJavaSolvedQuestions user=SaveJavaSolvedQuestions.builder()
            .questionId(questionId)
            .username(username)
            .status(status)
            .submissions(new ArrayList<Submission>() {{
                add(new Submission(code, overAllOutput, LocalDateTime.now()));
            }})
            .gainedQubits(gainedQubits)
        .timeStamp(LocalDateTime.now())
        .build();
        saveJavaSolvedQuestionsRepository.save(user);
    }
    }

    private void SavePythonSolvedQuestions(SavePythonSolvedQuestions existingUser,Users userExist,String overAllOutput,int gainedQubits,String questionId,String code,String username,Status status){
        Optional<AllQuestions> questionDetails=allQuestionsRepository.findByQuestionId(questionId);
        if( overAllOutput.equals("Correct")){
            savingCorrectPythonSolution(existingUser, userExist, code, overAllOutput, gainedQubits);
        }
        else if( overAllOutput.equals("Incorrect")){
           savingIncorrectPythonSolution(existingUser, code, overAllOutput);
        }
    }

    private void savingCorrectPythonSolution(SavePythonSolvedQuestions existingUser,Users userExist,String code,String overAllOutput,int gainedQubits){
        if(existingUser.getSubmissions()==null){
            existingUser.setSubmissions(new ArrayList<>());
            userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
            userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));
            userRepository.save(userExist);
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.setGainedQubits(gainedQubits);
            existingUser.getSubmissions().add(submission);
        }
        else{
            boolean badgesAllocated=false;
            int incorrectCount=0;
            if(existingUser.getGainedQubits()==0){
                incorrectCount=existingUser.getSubmissions().size();
                    gainedQubits=gainedQubits-incorrectCount<=1?1:gainedQubits-incorrectCount;
                    userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
                    userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));                    
                    userRepository.save(userExist);
                    existingUser.setGainedQubits(gainedQubits);
            }
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        savePythonSolvedQuestionsRepository.save(existingUser);
    }

    private void savingCorrectJavaSolution(SaveJavaSolvedQuestions existingUser,Users userExist,String code,String overAllOutput,int gainedQubits){
        if(existingUser.getSubmissions()==null){
            existingUser.setSubmissions(new ArrayList<>());
            userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
            userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));  
            userRepository.save(userExist);
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.setGainedQubits(gainedQubits);
            existingUser.getSubmissions().add(submission);
        }
        else{
            boolean badgesAllocated=false;
            int incorrectCount=0;
            if(existingUser.getGainedQubits()==0){
                incorrectCount=existingUser.getSubmissions().size();
                    gainedQubits=gainedQubits-incorrectCount<=1?1:gainedQubits-incorrectCount;
                    userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
                    userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));  
                    userRepository.save(userExist);
                    existingUser.setGainedQubits(gainedQubits);
            }
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        saveJavaSolvedQuestionsRepository.save(existingUser);
    }

    private void savingIncorrectPythonSolution(SavePythonSolvedQuestions existingUser,String code,String overAllOutput){
        System.out.println("Hiii iammmm");
        if(existingUser.getSubmissions()==null){
            existingUser.setSubmissions(new ArrayList<>());
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        else{
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        savePythonSolvedQuestionsRepository.save(existingUser);
    }

    private void savingIncorrectJavaSolution(SaveJavaSolvedQuestions existingUser,String code,String overAllOutput){
        System.out.println("Hiii iammmm");
        if(existingUser.getSubmissions()==null){
            existingUser.setSubmissions(new ArrayList<>());
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        else{
            Submission submission=new Submission(code,overAllOutput,LocalDateTime.now());
            existingUser.getSubmissions().add(submission);
        }
        saveJavaSolvedQuestionsRepository.save(existingUser);
    }

    private void savingThePythonUserNotPresent(Users userExist,String code,String overAllOutput,int gainedQubits,String questionId,String username,Status status){
        if(overAllOutput.equals("Correct")){
            userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
            userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));            
            userRepository.save(userExist);
        }
        SavePythonSolvedQuestions user=SavePythonSolvedQuestions.builder()
        .questionId(questionId)
        .username(username)
        .status(status)
        .submissions(new ArrayList<Submission>() {{
            add(new Submission(code, overAllOutput, LocalDateTime.now()));
        }})
        .gainedQubits(gainedQubits)
    .timeStamp(LocalDateTime.now())
    .build();
    savePythonSolvedQuestionsRepository.save(user);
    }

    private void savingTheJavaUserNotPresent(Users userExist,String code,String overAllOutput,int gainedQubits,String questionId,String username,Status status){
        if(overAllOutput.equals("Correct")){
            userExist.setTotalQubits(userExist.getTotalQubits()+gainedQubits);
            userExist.setBadges((int)((userExist.getTotalQubits()+gainedQubits)/10));            
            userRepository.save(userExist);
        }
        SaveJavaSolvedQuestions user=SaveJavaSolvedQuestions.builder()
        .questionId(questionId)
        .username(username)
        .status(status)
        .submissions(new ArrayList<Submission>() {{
            add(new Submission(code, overAllOutput, LocalDateTime.now()));
        }})
        .gainedQubits(gainedQubits)
    .timeStamp(LocalDateTime.now())
    .build();
    saveJavaSolvedQuestionsRepository.save(user);
    }
}
