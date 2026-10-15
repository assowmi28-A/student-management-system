
from datetime import date

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import models, schemas

app = FastAPI(title="Student Management API")

# Allow the local frontend and deployed Vercel frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://student-management-system-dj9x.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - (
        (today.month, today.day) < (dob.month, dob.day)
    )


def clean(value):
    return value.strip() if isinstance(value, str) else value


def student_data(student):
    dob = student.date_of_birth
    return {
        "id": student.id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "name": student.name,
        "email": student.email,
        "phone_number": student.phone_number,
        "date_of_birth": dob.isoformat() if dob else None,
        "gender": student.gender,
        "course": student.course,
        "address": student.address,
        "age": calculate_age(dob) if dob else student.age,
    }


def validate_payload(student: schemas.StudentCreate):
    if student.date_of_birth >= date.today():
        raise HTTPException(
            status_code=400,
            detail="Date of birth must be in the past.",
        )

    if not clean(student.first_name) or not clean(student.last_name):
        raise HTTPException(
            status_code=400,
            detail="First and last name cannot be blank.",
        )

    if not clean(student.course):
        raise HTTPException(
            status_code=400,
            detail="Course cannot be blank.",
        )


def apply_fields(record: models.Student, student: schemas.StudentCreate):
    first = clean(student.first_name)
    last = clean(student.last_name)

    record.first_name = first
    record.last_name = last
    record.name = f"{first} {last}"
    record.email = str(student.email).strip().lower()
    record.phone_number = clean(student.phone_number)
    record.date_of_birth = student.date_of_birth
    record.gender = clean(student.gender)
    record.course = clean(student.course)
    record.address = clean(student.address)
    record.age = calculate_age(student.date_of_birth)


def get_student_or_404(db: Session, student_id: int):
    student = db.get(models.Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.get("/")
def home():
    return {"message": "Student Management API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    rows = db.query(models.Student.course).distinct().all()
    courses = sorted({r[0] for r in rows if r[0]})
    return {"total": len(courses), "courses": courses}


@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    records = db.query(models.Student).order_by(models.Student.id).all()
    return [student_data(student) for student in records]


@app.get("/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    return student_data(get_student_or_404(db, student_id))


@app.post("/students", status_code=201)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
):
    validate_payload(student)

    email = str(student.email).strip().lower()
    duplicate = db.query(models.Student).filter(
        models.Student.email == email
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered.",
        )

    new_student = models.Student()
    apply_fields(new_student, student)
    db.add(new_student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email is already registered.",
        )

    db.refresh(new_student)
    return {
        "message": "Student added successfully",
        "student": student_data(new_student),
    }


@app.put("/students/{student_id}")
def update_student(
    student_id: int,
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
):
    existing = get_student_or_404(db, student_id)
    validate_payload(student)

    email = str(student.email).strip().lower()
    duplicate = db.query(models.Student).filter(
        models.Student.email == email,
        models.Student.id != student_id,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="This email is already used by another student.",
        )

    apply_fields(existing, student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email is already used by another student.",
        )

    db.refresh(existing)
    return {
        "message": "Student updated successfully",
        "student": student_data(existing),
    }


@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = get_student_or_404(db, student_id)
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
