from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.dependencies.auth import CurrentUser, require_permission
from app.models.user import User
from app.schemas.user import UserListItem

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("", response_model=list[UserListItem])
def list_users(
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(require_permission("users:read")),
) -> list[UserListItem]:
    """List all users belonging to the current user's company."""
    users = session.scalars(
        select(User)
        .where(User.company_id == current_user.company_id)
        .order_by(User.full_name)
    ).all()
    return [
        UserListItem(
            id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            job_title=user.job_title,
            is_active=user.is_active,
        )
        for user in users
    ]
