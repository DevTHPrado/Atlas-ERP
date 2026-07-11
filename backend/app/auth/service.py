from app.auth.schemas import AuthenticatedUser, LoginRequest, TokenResponse
from app.config.settings import settings
from app.core.security import create_access_token, verify_password
from app.exceptions.handlers import UnauthorizedError
from app.repositories.user_repository import UserRepository


class AuthService:
    """Service layer for authentication operations."""

    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def login(self, payload: LoginRequest) -> TokenResponse:
        """Authenticate a user and return a JWT token."""
        user = self.users.get_by_email(payload.email.lower())
        if user is None or not verify_password(
            payload.password, user.password_hash
        ):
            raise UnauthorizedError("Email ou senha invalidos.")

        permissions = (
            [permission.code for permission in user.role.permissions]
            if user.role
            else []
        )
        access_token = create_access_token(
            user.id, user.company_id, permissions
        )
        return TokenResponse(
            access_token=access_token,
            expires_in_minutes=settings.access_token_expire_minutes,
            user=AuthenticatedUser(
                id=str(user.id),
                company_id=str(user.company_id),
                full_name=user.full_name,
                email=user.email,
                permissions=permissions,
            ),
        )
