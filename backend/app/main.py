from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")


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
            detail="Transaction not found"
        )

    return transaction