from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Request schema for user login."""

    email: str
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    """Response schema with access token and user info."""

    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: "AuthenticatedUser"


class AuthenticatedUser(BaseModel):
    """Serialized user returned within the token response."""

    id: str
    company_id: str
    full_name: str
    email: str
    permissions: list[str]
