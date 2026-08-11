from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Expense Tracker API is running"}

@app.post("/transactions")
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db) ):
    new_transaction = models.Transaction(
        amount=transaction.amount,
        category=transaction.category,
        type=transaction.type,
        description=transaction.description,
        transaction_date=transaction.transaction_date
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@app.get("/transactions", response_model=list[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()

    return transactions



@app.get("/transactions/summary",response_model=schemas.TransactionSummary)
def get_transaction_summary(
    db: Session = Depends(get_db)
):
    total_income = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0))
        .filter(models.Transaction.type == "income")
        .scalar()
    )

    total_expense = (
        db.query(func.coalesce(func.sum(models.Transaction.amount), 0))
        .filter(models.Transaction.type == "expense")
        .scalar()
    )

    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    }


@app.get("/transactions/{transaction_id}",response_model=schemas.TransactionResponse)
def get_transaction(transaction_id: int,db: Session = Depends(get_db)):
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction with ID {transaction_id} not found"
        )

    return transaction

@app.put("/transactions/{transaction_id}",response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: schemas.TransactionUpdate,
    db: Session = Depends(get_db)
):
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction with ID {transaction_id} not found"
        )

    update_data = transaction_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int,db: Session = Depends(get_db)):
    transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction with ID {transaction_id} not found"
        )

    db.delete(transaction)
    db.commit()

    return {
        "message": "Transaction deleted successfully"
    }

