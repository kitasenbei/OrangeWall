from pydantic import BaseModel


class UserPreferencesBase(BaseModel):
    favoriteTools: list[str] = []
    theme: str = "system"
    sidebarCollapsed: bool = False


class UserPreferencesUpdate(BaseModel):
    favoriteTools: list[str] | None = None
    theme: str | None = None
    sidebarCollapsed: bool | None = None


class UserPreferencesResponse(UserPreferencesBase):
    userId: str
