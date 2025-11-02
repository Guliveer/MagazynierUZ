package org.example.magazynieruz.dto.auth;

import java.io.Serializable;

public record RegisterRequest(String username, String password) implements Serializable {
}
