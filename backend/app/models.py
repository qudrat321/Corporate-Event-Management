from datetime import date
from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

class Event(Base):

    __table_name = "events"
    id:Mapped[int] = mapped_column(primary_key=True)
    name:Mapped[str] = mapped_column(String(200))
    description:Mapped[str | None] = mapped_column(Text, default=None)
    event_date:Mapped[date] = mapped_column(Date)
    location:Mapped[str] = mapped_column(String(255))
    max_capacity:Mapped[int] = mapped_column()


