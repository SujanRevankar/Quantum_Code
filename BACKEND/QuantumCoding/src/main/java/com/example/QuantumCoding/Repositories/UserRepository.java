package com.example.QuantumCoding.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.example.QuantumCoding.model.Status;
import com.example.QuantumCoding.model.Users;

public interface UserRepository extends MongoRepository <Users,String>{
    
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);

    // @Query(value = "{}", fields = "{'_id': 0, 'password': 0}")
    // List<Users> findAll();


    @Query(value = "{ 'guildName': '' }", fields = "{ 'username': 1, 'badges': 1, '_id': 0, 'totalQuibits': 1, 'stagee': 1, 'Connections': 1 }")
    List<Users> findByEmptyGuildName();

    @Query(value = "{'role': { $ne: 'ADMIN' }}", fields = "{'username': 1, 'guildName': 1, 'totalQubits': 1, 'badges': 1, 'stage':1}")
    List<Users> findAllUsersDetailsForLeaderBoard(Sort sort);
    

    @Query(value = "{'stage':?0}", fields = "{'username': 1, 'guildName': 1, 'totalQubits': 1, 'badges': 1}")
    List<Users> findAllUsersDetailsForLeaderBoardBasedOnsage(Sort sort,Status stage);

    @Query(value = "{'username':?0}", fields = "{'guildName': 1}")
    Optional<Users> findGuildNameByUserName(String username);

}
