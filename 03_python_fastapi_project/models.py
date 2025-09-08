from datetime import datetime

from database import Base
from sqlalchemy import Column, DateTime, Integer, Float, String


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    description = Column(String)
    stock = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
