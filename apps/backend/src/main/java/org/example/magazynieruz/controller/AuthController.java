package org.example.magazynieruz.controller;


import lombok.RequiredArgsConstructor;
import org.example.magazynieruz.dto.LoginRequest;
import org.example.magazynieruz.dto.LoginResponse;
import org.example.magazynieruz.dto.RegisterRequest;
import org.example.magazynieruz.model.User;
import org.example.magazynieruz.service.JwtService;
import org.example.magazynieruz.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<Void> addNewUser(@RequestBody RegisterRequest registerRequest) {
        userService.createUser(registerRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User userDetails = userService.authenticate(loginRequest);

        return ResponseEntity.ok(new LoginResponse(jwtService.generateToken(userDetails)));
    }

}
