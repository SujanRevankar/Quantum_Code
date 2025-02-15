package com.example.QuantumCoding.guild;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.QuantumCoding.codingControllers.ExecutionResult;
import com.example.QuantumCoding.codingModels.OutputAndBadges;
import com.example.QuantumCoding.codingModels.TestCaseResults;
import com.example.QuantumCoding.codingModels.TestCases;
import com.example.QuantumCoding.guildControllers.ChallengeModel;
import com.example.QuantumCoding.guildControllers.SolvedChallengeModel;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgrammingExecutorServices {

    public ExecutionResult executingTheCode(SolvedChallengeModel challengeModel){
        int count=0;
        int overAllOutput=challengeModel.getTestCases().size();
        System.out.println("Hi  iam execute code");
        System.out.println(challengeModel.getLanguage());
        System.out.println(challengeModel.getLanguage());
        System.out.println(challengeModel.getTestCases());
        System.out.println(challengeModel.getCode());
        String uniqueFileName="Main.py";
        if(challengeModel.getLanguage().equals("Java")){
            uniqueFileName = "Main.java"; 
        }
        Path userDirectory = Paths.get(System.getProperty("user.home"), "docker-shared", challengeModel.getGuildname()); // Unique directory for each user
        Path codeFile = userDirectory.resolve(uniqueFileName);
        OutputAndBadges outputAndQubits=new OutputAndBadges();
        List<TestCaseResults> testCaseResults =new ArrayList<>();

        try {
            Files.createDirectories(userDirectory);
            Files.write(codeFile, challengeModel.getCode().getBytes());
            
            for(TestCases testCase: challengeModel.getTestCases()){
                count++;
                ProcessBuilder pb = new ProcessBuilder();
               
                if ("Java".equals(challengeModel.getLanguage())) {
                    System.out.println("Hiii iam Java");

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
                else if (challengeModel.getLanguage().equals("Python")) {
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
                if(count>2){
                    System.out.println("count "+count);
                    testCaseResults.add(new TestCaseResults("input"+count, "output"+count, actualOutput, isPass));
                }
                else{
                    testCaseResults.add(new TestCaseResults(testCase.getInput(), testCase.getExpectedOutput(), actualOutput, isPass));
                }
            }
            outputAndQubits.setQubits(overAllOutput==challengeModel.getTestCases().size()?challengeModel.getQubits():0);
            outputAndQubits.setOverAllOutput(overAllOutput==challengeModel.getTestCases().size()?"Correct":"Incorrect");

            deleteFilesAndDirectory(userDirectory);
        }
            catch (IOException  | InterruptedException e) {

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


public ExecutionResult executingTheSampleCode(ChallengeModel challengeModel){
    int count=0;
    int overAllOutput=challengeModel.getTestCases().size();
    System.out.println("Hi  iam execute code");
    String uniqueFileName="Main.py";
    if(challengeModel.getLanguage().equals("Java")){
        uniqueFileName = "Main.java"; 
    }
    Path userDirectory = Paths.get(System.getProperty("user.home"), "docker-shared", challengeModel.getGuildName()); // Unique directory for each user
    Path codeFile = userDirectory.resolve(uniqueFileName);
    OutputAndBadges outputAndQubits=new OutputAndBadges();
    List<TestCaseResults> testCaseResults =new ArrayList<>();

    try {
        Files.createDirectories(userDirectory);
        Files.write(codeFile, challengeModel.getCode().getBytes());
        
        for(TestCases testCase: challengeModel.getTestCases()){
            count++;
            ProcessBuilder pb = new ProcessBuilder();
           
            if ("Java".equals(challengeModel.getLanguage())) {
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
            else if (challengeModel.getLanguage().equals("Python")) {
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
            testCaseResults.add(new TestCaseResults(testCase.getInput(), testCase.getExpectedOutput(), actualOutput, isPass));
        }
        outputAndQubits.setOverAllOutput(overAllOutput==challengeModel.getTestCases().size()?"Correct":"Incorrect");

        deleteFilesAndDirectory(userDirectory);
    }
        catch (IOException  | InterruptedException e) {

        throw new RuntimeException("Error during code execution: " + e.getMessage(), e);
    }
    
    return new ExecutionResult(testCaseResults,outputAndQubits);
    

}


}
