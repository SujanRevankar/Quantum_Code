package com.example.QuantumCoding.AllQuestionsServices;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.AllQuestionsRepository;
import com.example.QuantumCoding.Repositories.SaveJavaSolvedQuestionsRepository;
import com.example.QuantumCoding.Repositories.SavePythonSolvedQuestionsRepository;
import com.example.QuantumCoding.model.AllQuestions;
import com.example.QuantumCoding.model.SaveJavaSolvedQuestions;
import com.example.QuantumCoding.model.SavePythonSolvedQuestions;
import com.example.QuantumCoding.model.Status;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllProgrammingQuestionsServices {

    // @Autowired
    private final AllQuestionsRepository allQuestionsRepository;
    private final SaveJavaSolvedQuestionsRepository saveJavaSolvedQuestionsRepository;
    private final SavePythonSolvedQuestionsRepository savePythonSolvedQuestionsRepository;

public List<AllQuestionsModel> getAllQuestions(Status status, String username, String language) {
    // if (status == null) {
    //     throw new IllegalArgumentException("Status cannot be null.");
    // }

    List<AllQuestions> allQuestions = allQuestionsRepository.findAllExcludingTestCases(status);
    List<AllQuestionsModel> allQuestionsModel = new ArrayList<>();

    for (AllQuestions question : allQuestions) {
        boolean isSolved=false;
        if(language.equalsIgnoreCase("Java")){
        Optional<SaveJavaSolvedQuestions> javaExists=saveJavaSolvedQuestionsRepository.findByUsernameAndTypeAndQuestionId(username, status,question.getQuestionId());
            if(javaExists.isPresent()){
                SaveJavaSolvedQuestions javaExisted=javaExists.get();
                isSolved=javaExisted.getGainedQubits()>0?true:false;
            }
        }
        else if(language.equalsIgnoreCase("Python")){
            Optional<SavePythonSolvedQuestions> pythonExists=savePythonSolvedQuestionsRepository.findByUsernameAndTypeAndQuestionId(username, status,question.getQuestionId());
            if(pythonExists.isPresent()){
                SavePythonSolvedQuestions pythonExisted=pythonExists.get();
                isSolved=pythonExisted.getGainedQubits()>0?true:false;
            }
        }

        AllQuestionsModel newQuestion = AllQuestionsModel.builder()
            .questionId(question.getQuestionId())
            .title(question.getTitle())
            .questionDescription(question.getQuestionDescription())
            .questionType(question.getQuestionType())
            .status(question.getStatus())
            .inputFormat(question.getInputFormat())
            .outputFormat(question.getOutputFormat())
            .timeComplexity(question.getTimeComplexity())
            .spaceComplexity(question.getSpaceComplexity())
            .timeLimit(question.getTimeLimit())
            .memoryLimit(question.getMemoryLimit())
            .qubits(question.getQubits())
            .knowledgeGained(question.getKnowledgeGained())
            .solved(isSolved)
            .build();

        allQuestionsModel.add(newQuestion);
    }

    return allQuestionsModel;
}


    public AllQuestions getSpecificProblem(String questionId){
        Optional<AllQuestions> problem=allQuestionsRepository.findByQuestionId(questionId);
        if(problem.isPresent()){
            AllQuestions specificProblem=problem.get();
            return specificProblem;
        }
        return problem.get();
    }

    public List<Long> getAllQuestionsCounts(Status status,String username,boolean java,boolean python){
        long allQuestionCount=allQuestionsRepository.countAllQuestionsByStatus(status);
        long allJavaSolvedQuestions=0;
        long allPythonSolvedQuestions=0;
        if(java)
            allJavaSolvedQuestions=saveJavaSolvedQuestionsRepository.countAllSolvedQuestions(username, status);
        if(python)
            allPythonSolvedQuestions=saveJavaSolvedQuestionsRepository.countAllSolvedQuestions(username, status);
        return Arrays.asList(allQuestionCount,allJavaSolvedQuestions,allPythonSolvedQuestions);
    }

    public String addCodingQuestions(AllQuestions allQuestions){
        Optional<AllQuestions> questionExist=allQuestionsRepository.findByQuestionIdOrTitle(allQuestions.getQuestionId(), allQuestions.getTitle());
        System.out.println(questionExist.isPresent());
        if(!questionExist.isPresent()){
            allQuestionsRepository.save(allQuestions);
            return "Question successfully added";
        }
        return "Failed";
    }

}
