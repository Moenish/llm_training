from contextlib import asynccontextmanager
from typing import List, Union

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import create_tables, get_db
from models import Product, CartItem
from sqlalchemy import func, update, delete


class ProductCreate(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


class CartItemUpdate(BaseModel):
    quantity: int


class StatusResponse(BaseModel):
    status: str
    product_id: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


# Add CORS middleware
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/products/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    users = result.scalars().all()
    return users


@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock,
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, product: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()

    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.name is not None:
        setattr(db_product, "name", product.name)
    if product.price is not None:
        setattr(db_product, "price", product.price)
    if product.description is not None:
        setattr(db_product, "description", product.description)
    if product.stock is not None:
        setattr(db_product, "stock", product.stock)

    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.delete("/products/{product_id}", response_model=ProductResponse)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    db_product = result.scalar_one_or_none()

    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(db_product)
    await db.commit()
    return db_product


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


# ------------------------- CART ENDPOINTS -------------------------


@app.get("/cart/", response_model=List[CartItemResponse])
async def get_cart(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            CartItem.id,
            CartItem.product_id,
            CartItem.quantity,
            Product.id.label("p_id"),
            Product.name,
            Product.price,
            Product.description,
            Product.stock,
        ).join(Product, Product.id == CartItem.product_id)
    )
    rows = result.all()
    return [
        {
            "id": r.id,
            "product_id": r.product_id,
            "quantity": r.quantity,
            "product": {
                "id": r.p_id,
                "name": r.name,
                "price": r.price,
                "description": r.description,
                "stock": r.stock,
            },
        }
        for r in rows
    ]


@app.post("/cart/{product_id}", response_model=CartItemResponse)
async def add_to_cart(product_id: int, db: AsyncSession = Depends(get_db)):
    # Decrement stock atomically if available
    stock_update = (
        update(Product)
        .where(Product.id == product_id, Product.stock > 0)
        .values(stock=Product.stock - 1)
        .returning(Product.id)
    )
    stock_result = await db.execute(stock_update)
    if stock_result.first() is None:
        # Verify existence separately
        exists = await db.execute(select(Product.id).where(Product.id == product_id))
        if exists.first() is None:
            raise HTTPException(status_code=404, detail="Product not found")
        raise HTTPException(status_code=400, detail="Out of stock")

    # Increment or insert cart item
    item_exists = await db.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )
    ci = item_exists.scalar_one_or_none()
    if ci is None:
        ci = CartItem(product_id=product_id, quantity=1)
        db.add(ci)
    else:
        await db.execute(
            update(CartItem)
            .where(CartItem.product_id == product_id)
            .values(quantity=CartItem.quantity + 1)
        )
    await db.commit()

    # Reload cart item & product for response
    joined = await db.execute(
        select(
            CartItem.id,
            CartItem.product_id,
            CartItem.quantity,
            Product.id.label("p_id"),
            Product.name,
            Product.price,
            Product.description,
            Product.stock,
        )
        .join(Product, Product.id == CartItem.product_id)
        .where(CartItem.product_id == product_id)
    )
    row = joined.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to load cart item")
    return {
        "id": row.id,
        "product_id": row.product_id,
        "quantity": row.quantity,
        "product": {
            "id": row.p_id,
            "name": row.name,
            "price": row.price,
            "description": row.description,
            "stock": row.stock,
        },
    }


@app.put("/cart/{product_id}", response_model=Union[CartItemResponse, StatusResponse])
async def update_cart_item(
    product_id: int, payload: CartItemUpdate, db: AsyncSession = Depends(get_db)
):
    if payload.quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity must be >= 0")

    item_res = await db.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )
    cart_item = item_res.scalar_one_or_none()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Item not in cart")
    # Fetch current quantity as scalar int to avoid typing issues with ORM attribute
    qty_res = await db.execute(
        select(CartItem.quantity).where(CartItem.product_id == product_id)
    )
    current_qty = qty_res.scalar_one()
    new_qty = payload.quantity
    diff = new_qty - current_qty

    # If increasing quantity ensure stock
    if diff > 0:
        stock_update = (
            update(Product)
            .where(Product.id == product_id, Product.stock >= diff)
            .values(stock=Product.stock - diff)
            .returning(Product.id)
        )
        res = await db.execute(stock_update)
        if res.first() is None:
            raise HTTPException(status_code=400, detail="Not enough stock")
    elif diff < 0:
        # Return stock
        await db.execute(
            update(Product)
            .where(Product.id == product_id)
            .values(stock=Product.stock + (-diff))
        )

    if new_qty == 0:
        await db.execute(delete(CartItem).where(CartItem.product_id == product_id))
    else:
        await db.execute(
            update(CartItem)
            .where(CartItem.product_id == product_id)
            .values(quantity=new_qty)
        )
    await db.commit()

    if new_qty == 0:
        return {"status": "removed", "product_id": product_id}

    joined = await db.execute(
        select(
            CartItem.id,
            CartItem.product_id,
            CartItem.quantity,
            Product.id.label("p_id"),
            Product.name,
            Product.price,
            Product.description,
            Product.stock,
        )
        .join(Product, Product.id == CartItem.product_id)
        .where(CartItem.product_id == product_id)
    )
    row = joined.first()
    if not row:
        raise HTTPException(status_code=500, detail="Failed to load updated cart item")
    return {
        "id": row.id,
        "product_id": row.product_id,
        "quantity": row.quantity,
        "product": {
            "id": row.p_id,
            "name": row.name,
            "price": row.price,
            "description": row.description,
            "stock": row.stock,
        },
    }


@app.delete("/cart/{product_id}")
async def remove_cart_item(product_id: int, db: AsyncSession = Depends(get_db)):
    item_res = await db.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )
    cart_item = item_res.scalar_one_or_none()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Item not in cart")
    qty = cart_item.quantity
    # Return stock then delete
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(stock=Product.stock + qty)
    )
    await db.execute(delete(CartItem).where(CartItem.product_id == product_id))
    await db.commit()
    return {"status": "removed", "product_id": product_id}
