from datetime import date
from backend.database import SessionLocal, Base, engine
from backend import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

for i in range(1, 13):
    s = models.Student(
        first_name=f"Test{i}",
        last_name="Student",
        name=f"Test{i} Student",
        email=f"test{i}@example.com",
        phone_number=f"+91900000{i:04d}",
        date_of_birth=date(2003, 1, 1),
        gender="Male",
        course="B.Tech AIDS",
        address="Chennai",
        age=22,
    )
    db.add(s)

db.commit()
db.close()
print("12 test students added")