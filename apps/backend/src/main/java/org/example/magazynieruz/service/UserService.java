package org.example.magazynieruz.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.example.magazynieruz.dto.auth.LoginRequest;
import org.example.magazynieruz.dto.auth.RegisterRequest;
import org.example.magazynieruz.mapper.UserMapper;
import org.example.magazynieruz.model.Role;
import org.example.magazynieruz.repository.RoleRepository;
import org.example.magazynieruz.repository.UserRepository;
import org.example.magazynieruz.model.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, AuthenticationManager authenticationManager, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.authenticationManager = authenticationManager;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.username()).isPresent()) {
            log.error("Username is already in use");
            throw new IllegalArgumentException("User with this username: " + registerRequest.username() + " already exists");
        }
        log.info("Creating user: " + registerRequest.username());
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_USER not found."));

        User user = userMapper.toEntity(registerRequest);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of(defaultRole));

        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        userRepository.delete(userToDelete);
    }

    public User authenticate(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.username(),
                    request.password()
            ));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return userRepository.findByUsername(request.username())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
