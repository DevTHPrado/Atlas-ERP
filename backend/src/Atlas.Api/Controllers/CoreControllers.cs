using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Atlas.Api.Security;
using Atlas.Application.DTOs;
using Atlas.Application.Exceptions;
using Atlas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Atlas.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var response = await _authService.LoginAsync(request, ct);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        var response = await _authService.RefreshAsync(request, ct);
        return Ok(response);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return NoContent();
    }

    [HttpPost("recover-password")]
    public async Task<IActionResult> RecoverPassword([FromBody] PasswordRecoveryRequest request, CancellationToken ct)
    {
        await _authService.RecoverPasswordAsync(request, ct);
        return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] PasswordResetRequest request, CancellationToken ct)
    {
        await _authService.ResetPasswordAsync(request, ct);
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("api/v1/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;

    public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var data = await _dashboardService.GetDashboardDataAsync(_currentUser.CompanyId.Value, ct);
        return Ok(data);
    }
}

[ApiController]
[Authorize]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICurrentUserService _currentUser;

    public UsersController(IUserService userService, ICurrentUserService currentUser)
    {
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserListItem>>> ListUsers(CancellationToken ct)
    {
        if (!_currentUser.CompanyId.HasValue) throw new UnauthorizedException();
        var users = await _userService.ListUsersAsync(_currentUser.CompanyId.Value, ct);
        return Ok(users);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserListItem>> UpdateProfile([FromBody] UserProfileUpdate request, CancellationToken ct)
    {
        if (!_currentUser.UserId.HasValue) throw new UnauthorizedException();
        var user = await _userService.UpdateProfileAsync(_currentUser.UserId.Value, request, ct);
        return Ok(user);
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] UserChangePassword request, CancellationToken ct)
    {
        if (!_currentUser.UserId.HasValue) throw new UnauthorizedException();
        await _userService.ChangePasswordAsync(_currentUser.UserId.Value, request, ct);
        return NoContent();
    }
}
