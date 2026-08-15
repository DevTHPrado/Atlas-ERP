using System;
using System.Collections.Generic;

namespace Atlas.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record UserInfo(
    Guid Id,
    string FullName,
    string Email,
    string? JobTitle,
    Guid CompanyId,
    string? Role,
    List<string> Permissions
);

public record TokenResponse(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    string? RefreshToken,
    UserInfo? User
);

public record RefreshTokenRequest(string RefreshToken);

public record PasswordRecoveryRequest(string Email);

public record PasswordResetRequest(string Token, string NewPassword);

public record UserListItem(
    string Id,
    string FullName,
    string Email,
    string? JobTitle,
    bool IsActive
);

public record UserProfileUpdate(
    string? FullName,
    string? Email,
    string? Phone,
    string? Language,
    string? Theme
);

public record UserChangePassword(
    string CurrentPassword,
    string NewPassword
);
