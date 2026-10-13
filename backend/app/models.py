from sqlalchemy import Column, Integer, String, Date
from .database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    name = Column(String(200), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    course = Column(String(100), nullable=False)
    address = Column(String(500), nullable=True)
    age = Column(Integer, nullable=True)