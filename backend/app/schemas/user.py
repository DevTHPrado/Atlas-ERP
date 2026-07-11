from pydantic import BaseModel, EmailStr


class UserListItem(BaseModel):
    """Schema for user listing responses."""

    id: str
    full_name: str
    email: EmailStr
    job_title: str | None
    is_active: bool
