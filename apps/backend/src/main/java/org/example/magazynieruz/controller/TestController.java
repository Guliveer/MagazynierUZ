package org.example.magazynieruz.controller;

import org.example.magazynieruz.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/get")
    public String test(){
        return "test";
    }


    @GetMapping("/usercheck")
    public ResponseEntity<User> testUser(@AuthenticationPrincipal User loggedUser){

     return ResponseEntity.ok(loggedUser);
    }
}
