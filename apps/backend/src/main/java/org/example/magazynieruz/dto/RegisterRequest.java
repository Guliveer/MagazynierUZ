package org.example.magazynieruz.dto;

import java.io.Serializable;

public record RegisterRequest(String username, String password) implements Serializable {
}
