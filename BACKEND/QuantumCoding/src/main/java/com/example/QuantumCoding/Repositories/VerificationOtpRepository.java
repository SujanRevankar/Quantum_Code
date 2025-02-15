package com.example.QuantumCoding.Repositories;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.QuantumCoding.model.VerificationOtp;

public interface VerificationOtpRepository extends MongoRepository<VerificationOtp,String>{

        Optional<VerificationOtp> findByEmail(String email);

}
