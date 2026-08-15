using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Application.DTOs;
using Atlas.Application.Exceptions;
using Atlas.Application.Interfaces;
using Atlas.Domain.Entities;
using Atlas.Infrastructure.Data;
using Atlas.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Atlas.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AtlasDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AtlasDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
    }

    public async Task<TokenResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .ThenInclude(r => r!.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        var permissions = user.Role?.RolePermissions
            .Select(rp => rp.Permission.Code)
            .ToList() ?? new List<string>();

        var (token, expiresIn) = _jwtTokenGenerator.GenerateToken(user, permissions);
        var refreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(ct);

        var userInfo = new UserInfo(
            Id: user.Id,
            FullName: user.FullName,
            Email: user.Email,
            JobTitle: user.JobTitle,
            CompanyId: user.CompanyId,
            Role: user.Role?.Name,
            Permissions: permissions
        );

        return new TokenResponse(
            AccessToken: token,
            TokenType: "bearer",
            ExpiresIn: expiresIn,
            RefreshToken: refreshTokenString,
            User: userInfo
        );
    }

    public async Task<TokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Role)
            .ThenInclude(r => r!.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && !rt.IsRevoked, ct);

        if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedException("Token de atualização inválido ou expirado");
        }

        var user = refreshToken.User;
        var permissions = user.Role?.RolePermissions
            .Select(rp => rp.Permission.Code)
            .ToList() ?? new List<string>();

        var (newToken, expiresIn) = _jwtTokenGenerator.GenerateToken(user, permissions);
        refreshToken.IsRevoked = true;

        var newRefreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        await _context.SaveChangesAsync(ct);

        var userInfo = new UserInfo(
            Id: user.Id,
            FullName: user.FullName,
            Email: user.Email,
            JobTitle: user.JobTitle,
            CompanyId: user.CompanyId,
            Role: user.Role?.Name,
            Permissions: permissions
        );

        return new TokenResponse(
            AccessToken: newToken,
            TokenType: "bearer",
            ExpiresIn: expiresIn,
            RefreshToken: newRefreshTokenString,
            User: userInfo
        );
    }

    public async Task RecoverPasswordAsync(PasswordRecoveryRequest request, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (user != null)
        {
            _logger.LogInformation("Solicitação de recuperação de senha para: {Email}", request.Email);
        }
    }

    public async Task ResetPasswordAsync(PasswordResetRequest request, CancellationToken ct = default)
    {
        _logger.LogInformation("Redefinição de senha processada.");
        await Task.CompletedTask;
    }
}

public class UserService : IUserService
{
    private readonly AtlasDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(AtlasDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserListItem>> ListUsersAsync(Guid companyId, CancellationToken ct = default)
    {
        return await _context.Users
            .Where(u => u.CompanyId == companyId)
            .OrderBy(u => u.FullName)
            .Select(u => new UserListItem(
                u.Id.ToString(),
                u.FullName,
                u.Email,
                u.JobTitle,
                u.IsActive
            ))
            .ToListAsync(ct);
    }

    public async Task<UserListItem> UpdateProfileAsync(Guid userId, UserProfileUpdate request, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) throw new NotFoundException("Usuário não encontrado");

        if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName;
        if (!string.IsNullOrWhiteSpace(request.Email)) user.Email = request.Email;

        await _context.SaveChangesAsync(ct);

        return new UserListItem(
            user.Id.ToString(),
            user.FullName,
            user.Email,
            user.JobTitle,
            user.IsActive
        );
    }

    public async Task ChangePasswordAsync(Guid userId, UserChangePassword request, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null) throw new NotFoundException("Usuário não encontrado");

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new AppException("Senha atual incorreta", 400);
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync(ct);
    }
}
