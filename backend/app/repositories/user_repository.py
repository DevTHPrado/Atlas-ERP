from abc import ABC, abstractmethod
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository(ABC):
    """Abstract interface for user data access."""

    @abstractmethod
    def get_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    @abstractmethod
    def get(self, user_id: UUID) -> User | None:
        raise NotImplementedError


class SqlAlchemyUserRepository(UserRepository):
    """SQLAlchemy implementation of the UserRepository."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email, User.is_active.is_(True))
        return self.session.scalar(stmt)

    def get(self, user_id: UUID) -> User | None:
        return self.session.get(User, user_id)
