from datetime import date
from pydantic import BaseModel, EmailStr, Field


class StudentCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=7, max_length=20)
    date_of_birth: date
    gender: str = Field(min_length=1, max_length=20)
    course: str = Field(min_length=2, max_length=100)
    address: str = Field(min_length=5, max_length=500)