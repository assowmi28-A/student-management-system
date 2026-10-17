"""Pydantic schemas and input validation for student records."""
import re
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


_PHONE_PATTERN = re.compile(r"^\+91\d{10}$")
_NAME_PATTERN = re.compile(r"^[^\W\d_](?:[^\W\d_]|[ '-](?=[^\W\d_]))*$")
Gender = Literal["Male", "Female", "Other"]


class StudentFields(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str
    email: EmailStr = Field(max_length=254)
    date_of_birth: date
    gender: Gender
    course: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=500)

    @field_validator("first_name", "last_name", "phone", "email", "course", "address", mode="before")
    @classmethod
    def strip_text_fields(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not value[:1].isupper() or not _NAME_PATTERN.fullmatch(value):
            raise ValueError(
                "Name must start with a capital letter and contain only letters, "
                "spaces, apostrophes, or hyphens."
            )
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not _PHONE_PATTERN.fullmatch(value):
            raise ValueError("Phone number must be +91 followed by exactly 10 digits.")
        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future.")
        return value

    @field_validator("course", "address")
    @classmethod
    def validate_non_empty_text(cls, value: str) -> str:
        if not value:
            raise ValueError("This field cannot be blank.")
        return value


class StudentCreate(StudentFields):
    pass


class StudentUpdate(StudentFields):
    pass


class StudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    phone: str
    email: EmailStr | None
    date_of_birth: date | None
    gender: str | None
    course: str | None
    address: str | None


class StudentPage(BaseModel):
    items: list[StudentRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class StudentSummary(BaseModel):
    total_students: int
    total_courses: int
    male_students: int
    female_students: int


class CountItem(BaseModel):
    label: str
    total: int


class StudentReports(BaseModel):
    total_students: int
    total_courses: int
    male_students: int
    female_students: int
    other_students: int
    course_counts: list[CountItem]
    gender_counts: list[CountItem]
