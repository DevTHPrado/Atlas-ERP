from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database.session import get_session
from app.exceptions.handlers import ForbiddenError, UnauthorizedError
from app.repositories.user_repository import SqlAlchemyUserRepository


@dataclass(frozen=True)
class CurrentUser:
    """Immutable representation of the authenticated user from JWT."""

    id: UUID
    company_id: UUID
    permissions: list[str]


def get_user_repository(
    session: Session = Depends(get_session),
) -> SqlAlchemyUserRepository:
    """Provide a user repository instance."""
    return SqlAlchemyUserRepository(session)


def get_current_user(authorization: str = Header("")) -> CurrentUser:
    """Extract and validate the current user from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Token de autenticacao ausente.")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_token(token)
        return CurrentUser(
            id=UUID(payload["sub"]),
            company_id=UUID(payload["company_id"]),
            permissions=list(payload.get("permissions", [])),
        )
    except Exception as exc:
        raise UnauthorizedError("Token de autenticacao invalido.") from exc


def require_permission(permission: str):
    """Factory that returns a dependency requiring a specific permission."""

    def dependency(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if (
            permission not in current_user.permissions
            and "admin:*" not in current_user.permissions
        ):
            raise ForbiddenError(
                "Permissao insuficiente para executar esta acao."
            )
        return current_user

    return dependency
