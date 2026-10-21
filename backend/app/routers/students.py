"""CRUD endpoints for student records."""
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student
from app.schemas import (
    StudentCreate,
    StudentPage,
    StudentRead,
    StudentReports,
    StudentSummary,
    StudentUpdate,
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/summary", response_model=StudentSummary)
def student_summary(db: Session = Depends(get_db)) -> StudentSummary:
    total_students = db.scalar(select(func.count()).select_from(Student)) or 0
    total_courses = (
        db.scalar(
            select(
                func.count(
                    func.distinct(func.lower(func.trim(Student.course)))
                )
            ).where(
                Student.course.is_not(None),
                func.trim(Student.course) != "",
            )
        )
        or 0
    )
    return StudentSummary(
        total_students=total_students,
        total_courses=total_courses,
        male_students=db.scalar(
            select(func.count())
            .select_from(Student)
            .where(func.lower(func.trim(Student.gender)) == "male")
        )
        or 0,
        female_students=db.scalar(
            select(func.count())
            .select_from(Student)
            .where(func.lower(func.trim(Student.gender)) == "female")
        )
        or 0,
    )


@router.get("/reports", response_model=StudentReports)
def student_reports(db: Session = Depends(get_db)) -> StudentReports:
    summary = student_summary(db)
    course_rows = db.execute(
        select(
            func.min(func.trim(Student.course)),
            func.count(),
        )
        .where(
            Student.course.is_not(None),
            func.trim(Student.course) != "",
        )
        .group_by(func.lower(func.trim(Student.course)))
        .order_by(func.count().desc(), func.lower(func.trim(Student.course)))
    ).all()
    gender_label = case(
        (
            (Student.gender.is_(None)) | (func.trim(Student.gender) == ""),
            "Not specified",
        ),
        else_=func.trim(Student.gender),
    )
    gender_rows = db.execute(
        select(gender_label, func.count())
        .select_from(Student)
        .group_by(func.lower(gender_label))
        .order_by(func.lower(gender_label))
    ).all()
    known_gender_total = summary.male_students + summary.female_students
    return StudentReports(
        total_students=summary.total_students,
        total_courses=summary.total_courses,
        male_students=summary.male_students,
        female_students=summary.female_students,
        other_students=max(0, summary.total_students - known_gender_total),
        course_counts=[
            {"label": label, "total": total}
            for label, total in course_rows
        ],
        gender_counts=[
            {"label": label, "total": total}
            for label, total in gender_rows
        ],
    )


@router.get("", response_model=StudentPage)
def list_students(
    search: str = Query(default="", max_length=200),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
) -> StudentPage:
    search_term = search.strip()
    statement = select(Student)
    count_statement = select(func.count()).select_from(Student)
    if search_term:
        pattern = f"%{search_term}%"
        condition = or_(
            Student.first_name.ilike(pattern),
            Student.last_name.ilike(pattern),
            (Student.first_name + " " + Student.last_name).ilike(pattern),
            Student.email.ilike(pattern),
            Student.phone.ilike(pattern),
        )
        statement = statement.where(condition)
        count_statement = count_statement.where(condition)

    total = db.scalar(count_statement) or 0
    total_pages = max(1, ceil(total / page_size))
    current_page = min(page, total_pages)
    items = db.scalars(
        statement.order_by(Student.id.asc())
        .offset((current_page - 1) * page_size)
        .limit(page_size)
    ).all()
    return StudentPage(
        items=items,
        total=total,
        page=current_page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)) -> Student:
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/{student_id}", response_model=StudentRead)
def get_student(student_id: int, db: Session = Depends(get_db)) -> Student:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found.")
    return student


@router.put("/{student_id}", response_model=StudentRead)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
) -> Student:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)) -> Response:
    student = db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found.")
    db.delete(student)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
