package org.example.magazynieruz.mapper;

import org.example.magazynieruz.dto.RegisterRequest;
import org.example.magazynieruz.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedSourcePolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
    User toEntity(RegisterRequest registerRequest);
}
