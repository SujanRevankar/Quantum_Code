package com.example.QuantumCoding.AllQuestionsServices;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.AllQuestionsRepository;
import com.example.QuantumCoding.codingControllers.ExecutionResult;
import com.example.QuantumCoding.codingModels.CodeRequest;
import com.example.QuantumCoding.codingModels.OutputAndBadges;
import com.example.QuantumCoding.codingModels.QuestionType;
import com.example.QuantumCoding.codingModels.TestCaseResults;
import com.example.QuantumCoding.codingModels.TestCases;
import com.example.QuantumCoding.model.AllQuestions;
import com.example.QuantumCoding.model.Status;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CodeExicutorServices {

    private final AllQuestionsRepository allQuestionsRepository;
    private int overAllOutput=0;
    public ExecutionResult executeCodeWithTestCases(CodeRequest codeRequest){
        int count=0;
        System.out.println("Hi  iam execute code");
        overAllOutput=codeRequest.getTestCases().size();
        System.out.println("Overall "+overAllOutput);
        String uniqueFileName = "Main.java"; 
        if(codeRequest.getLanguage().equals("Python")){
            uniqueFileName="Main.py";
        }
        Path userDirectory = Paths.get(System.getProperty("user.home"), "docker-shared", codeRequest.getUsername()); // Unique directory for each user
        Path codeFile = userDirectory.resolve(uniqueFileName);
        OutputAndBadges outputAndQubits=new OutputAndBadges();
        List<TestCaseResults> testCaseResults =new ArrayList<>();
        try {
            System.out.println("What are you doping bro"+(codeRequest.getQuestionType()==QuestionType.VERYEASY)+" and "+ codeRequest.getLanguage());
            Files.createDirectories(userDirectory);
            Files.write(codeFile, codeRequest.getCode().getBytes());
            
            for(TestCases testCase: codeRequest.getTestCases()){
                count++;
                ProcessBuilder pb = new ProcessBuilder();
                // if(codeRequest.getQuestionType()==QuestionType.VERYEASY && "Java".equals(codeRequest.getLanguage())){
                //     System.out.println("Hiii iam veryeasy");
                //     pb.command(
                //     "docker", "run", "--rm",
                //                 "-v", codeFile.getParent().toAbsolutePath() + ":/code",  // Mount user-specific directory
                //                 "java-runner",  // Use the custom Java runner image
                //                 "/bin/sh", "-c",
                //                 "javac /code/" + uniqueFileName + " && " + 
                //                 "java -cp /code Main"
                //     );

                // }
                if ("Java".equals(codeRequest.getLanguage())) {
                    System.out.println("Hiii iam easy");

                    pb.command(
            "docker", "run", "--rm",
                        "-v", codeFile.getParent().toAbsolutePath() + ":/code",  // Mount user-specific directory
                        "java-runner",  // Use the custom Java runner image
                        "/bin/sh", "-c",
                        "echo '" + testCase.getInput() + "' > /code/input.txt && " + 
                        "javac /code/" + uniqueFileName + " && " + 
                        "java -cp /code Main < /code/input.txt"
                );
                }
                else if (codeRequest.getLanguage().equals("Python")) {
                    pb.command(
                        "docker", "run", "--rm",
                                    "-v", codeFile.getParent().toAbsolutePath() + ":/code",  // Mount user-specific directory
                                    "python-runner",  // Use a custom Python runner image
                                    "/bin/sh", "-c",
                                    "echo '" + testCase.getInput() + "' > /code/input.txt && " +
                                    "python3 /code/" + uniqueFileName + " < /code/input.txt"
                    );
                    
                }
                Process process = pb.start();
                BufferedReader stdOutput = new BufferedReader(new InputStreamReader(process.getInputStream()));
                BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()));

                StringBuilder output = new StringBuilder();
                String line;
                while ((line = stdOutput.readLine()) != null) {
                        output.append(line).append("\n");
                }

                StringBuilder error = new StringBuilder();
                while ((line = stdError.readLine()) != null) {
                        error.append(line).append("\n");
                }
                if (error.length() > 0) {
                    deleteFilesAndDirectory(userDirectory);

                    throw new RuntimeException("Code execution error: " + error.toString());
                }

                System.out.println("STDOUT: " + output);
                System.out.println("STDERR: " + error);
                System.out.println("count :"+count);
                process.waitFor();
    
                String actualOutput = output.toString().trim().replaceAll("\\s+", " "); // Replace multiple spaces with a single space
                String expectedOutput = testCase.getExpectedOutput();

                System.out.println("Output: " + actualOutput);
                System.out.println("Is Pass: " + actualOutput.equals(expectedOutput));

                boolean isPass = actualOutput.equals(expectedOutput);
                if(!isPass){
                    overAllOutput-=1;
                }
                if(count>2 && (codeRequest.getStatus()==Status.BEGINNER ||codeRequest.getStatus()==Status.ADVANCED || codeRequest.getStatus()==Status.INTERMEDIATE) && codeRequest.getQuestionType()!=QuestionType.VERYEASY){
                    System.out.println("count "+count);
                    testCaseResults.add(new TestCaseResults("input"+count, "output"+count, actualOutput, isPass));
                }
                else{
                    testCaseResults.add(new TestCaseResults(testCase.getInput(), testCase.getExpectedOutput(), actualOutput, isPass));
                }
            }
            outputAndQubits.setQubits(overAllOutput==codeRequest.getTestCases().size()?codeRequest.getQubits():0);
            outputAndQubits.setOverAllOutput(overAllOutput==codeRequest.getTestCases().size()?"Correct":"Incorrect");

            deleteFilesAndDirectory(userDirectory);
            
        } catch (IOException  | InterruptedException e) {

            throw new RuntimeException("Error during code execution: " + e.getMessage(), e);
        }
        
        return new ExecutionResult(testCaseResults,outputAndQubits);
    }

    private void deleteFilesAndDirectory(Path userDirectory) throws IOException {
    // List all files in the user's directory
    try (DirectoryStream<Path> stream = Files.newDirectoryStream(userDirectory)) {
        for (Path entry : stream) {
            // Delete each file
            Files.deleteIfExists(entry);
        }
    } catch (IOException e) {
        throw new IOException("Error deleting files in directory: " + userDirectory, e);
    }

    // Delete the empty directory itself
    try {
        Files.deleteIfExists(userDirectory);
    } catch (IOException e) {
        throw new IOException("Error deleting directory: " + userDirectory, e);
    }
}

public List<Map<String, String>> getAllHiddenTestCases(String questionId, Status status) {
    List<Map<String, String>> hiddenTestCasesList = new ArrayList<>();
    System.out.println("ALlqWelcome");

    Optional<AllQuestions> testCases = allQuestionsRepository.findAllHiddenTestCases(questionId, status);

    System.out.println("ALlq"+testCases.isPresent());

    if (testCases.isPresent()) {
        System.out.println("ALlq"+testCases.get());

        AllQuestions extractingTestCases = testCases.get();


        if (extractingTestCases.getHiddenTestCases() != null) {
            for (TestCases testCase : extractingTestCases.getHiddenTestCases()) {
                System.out.println("Processing hidden test case...");
                String input = (String) testCase.getInput();
                String expectedOutput = (String) testCase.getExpectedOutput();
                System.out.println("Input: " + input + ", Expected Output: " + expectedOutput);
                Map<String,String> hidden=new HashMap<>();
                 hidden.put("input", input);
                hidden.put("expectedOutput", expectedOutput);
                hiddenTestCasesList.add(hidden);
            }
        } else {
            System.out.println("No hidden test cases available for the given question.");
        }
    } else {
        System.out.println("No test cases found for questionId: " + questionId + " and status: " + status);
    }

    return hiddenTestCasesList;
}
}
