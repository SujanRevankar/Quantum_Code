package com.example.QuantumCoding.codingControllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.AllQuestionsServices.AllProgrammingQuestionsServices;
import com.example.QuantumCoding.AllQuestionsServices.AllQuestionsModel;
import com.example.QuantumCoding.AllQuestionsServices.CodeExicutorServices;
import com.example.QuantumCoding.AllQuestionsServices.SaveSolutionsInDataBaseService;
import com.example.QuantumCoding.codingModels.CodeRequest;
import com.example.QuantumCoding.codingModels.OutputAndBadges;
import com.example.QuantumCoding.codingModels.QuestionType;
import com.example.QuantumCoding.codingModels.TestCases;
import com.example.QuantumCoding.model.Status;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("api/v1/code")
@RequiredArgsConstructor
public class CodingController {
    
    private final CodeExicutorServices codeExicutorServices;
    private final SaveSolutionsInDataBaseService saveSolutionsInDataBase;
    private final AllProgrammingQuestionsServices allProgrammingQuestionsServices;
    @PostMapping("/execute")
    public ResponseEntity<?> executingTheCode(@RequestBody CodeRequest codeRequest) {
        System.out.println("Enter");
        try {
            System.out.println("Hidden");

            if(codeRequest.getQuestionType()==QuestionType.EASY || codeRequest.getQuestionType()==QuestionType.MEDIUM|| codeRequest.getQuestionType()==QuestionType.HARD){
                System.out.println("Testcases");

                List<Map<String,String>> hiddenTestCases=codeExicutorServices.getAllHiddenTestCases(codeRequest.getQuestionId(), codeRequest.getStatus());
                System.out.println("Testcases");

                for(Map<String,String> testCases:hiddenTestCases){
                    String input=testCases.get("input");
                    String expectedOutput=testCases.get("expectedOutput");
                    System.out.println("input "+input+" "+"output "+expectedOutput);
                    codeRequest.getTestCases().add(new TestCases(input,expectedOutput));
                }
            }
            ExecutionResult executionResult = codeExicutorServices.executeCodeWithTestCases(codeRequest);
            // List<TestCaseResults> testCaseResults=executionResult.testCaseResults;
            OutputAndBadges outputAndBadges=executionResult.outputAndQubits;
            saveSolutionsInDataBase.saveTheSolvedSolution(codeRequest.getUsername(), codeRequest.getStatus(), codeRequest.getQuestionId(), codeRequest.getCode(), outputAndBadges.getOverAllOutput(),outputAndBadges.getQubits(),codeRequest.getLanguage());
            return ResponseEntity.ok(executionResult); 
        } catch (RuntimeException e) {
            saveSolutionsInDataBase.saveTheSolvedSolution(codeRequest.getUsername(), codeRequest.getStatus(), codeRequest.getQuestionId(), codeRequest.getCode(), "Incorrect", 0,codeRequest.getLanguage());
            String errorMessage = "An error occurred while executing the code: " + e.getMessage();
            return ResponseEntity.badRequest().body(errorMessage);
        }
    }
     @GetMapping("/get/{status}/questions")
     public ResponseEntity<?> getAllBeginnerQuestions(@PathVariable Status status,@RequestParam String username,@RequestParam String language){
        System.out.println("STatus"+status);
        List<AllQuestionsModel> allprogrmmingQuestionsModels=allProgrammingQuestionsServices.getAllQuestions(status,username,language);
        return ResponseEntity.ok(allprogrmmingQuestionsModels);
     }
     @GetMapping("/get")
     public ResponseEntity<?> getSpecficBeginnerQuestion(@RequestParam String questionId){
        return ResponseEntity.ok(allProgrammingQuestionsServices.getSpecificProblem(questionId));
     }
     
}
