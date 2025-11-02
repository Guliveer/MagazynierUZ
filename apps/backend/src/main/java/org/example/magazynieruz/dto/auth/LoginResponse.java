package org.example.magazynieruz.dto.auth;

import java.io.Serializable;

public record LoginResponse(String token) implements Serializable {
}
