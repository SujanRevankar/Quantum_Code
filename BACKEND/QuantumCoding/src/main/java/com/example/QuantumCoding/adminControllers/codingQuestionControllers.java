package com.example.QuantumCoding.adminControllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.AllQuestionsServices.AllProgrammingQuestionsServices;
import com.example.QuantumCoding.model.AllQuestions;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/add")
@RequiredArgsConstructor
public class codingQuestionControllers {

    private final AllProgrammingQuestionsServices allProgrammingQuestionsServices;

    @PostMapping("/questions")
    public ResponseEntity<?> addCodingQuestons(@RequestBody AllQuestions allQuestions){
        String status=allProgrammingQuestionsServices.addCodingQuestions(allQuestions);
        if(status.equals("Failed")){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Question already exist");
        }
        return ResponseEntity.ok(status);
    }
}
