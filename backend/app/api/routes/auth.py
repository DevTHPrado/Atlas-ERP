from fastapi import APIRouter, Depends

from app.auth.schemas import LoginRequest, TokenResponse
from app.auth.service import AuthService
from app.dependencies.auth import get_user_repository
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["Autenticacao"])


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    users: UserRepository = Depends(get_user_repository),
) -> TokenResponse:
    """Authenticate a user and return a JWT access token."""
    return AuthService(users).login(payload)


@router.post("/logout", status_code=204)
def logout() -> None:
    """Invalidate the current session (client-side token discard)."""
    return None
