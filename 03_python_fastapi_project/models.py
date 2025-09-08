from datetime import datetime

from database import Base
from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    Float,
    String,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    price = Column(Float)
    description = Column(String)
    stock = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

    __table_args__ = (UniqueConstraint("product_id", name="uq_cart_product"),)
