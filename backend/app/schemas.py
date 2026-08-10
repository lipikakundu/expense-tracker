from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):

    amount: Annotated[
        Decimal,
        Field(
            ...,
            gt=0,
            description="Amount of the transaction",
            examples=[500.00, 1250.50]
        )
    ]

    category: Annotated[
        str,
        Field(
            ...,
            min_length=1,
            max_length=50,
            description="Category of the transaction",
            examples=["Food", "Travel", "Shopping", "Bills"]
        )
    ]

    type: Annotated[
        Literal["income", "expense"],
        Field(
            ...,
            description="Type of the transaction",
            examples=["expense"]
        )
    ]

    description: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=255,
            description="Optional description of the transaction",
            examples=["Lunch at college"]
        )
    ]

    transaction_date: Annotated[
        date,
        Field(
            ...,
            description="Date on which the transaction occurred",
            examples=["2026-08-10"]
        )
    ]

class TransactionResponse(BaseModel):

    id: Annotated[
        int,
        Field(description="Unique ID of the transaction")
    ]

    amount: Annotated[
        Decimal,
        Field(description="Amount of the transaction")
    ]

    category: Annotated[
        str,
        Field(description="Category of the transaction")
    ]

    type: Annotated[
        Literal["income", "expense"],
        Field(description="Type of the transaction")
    ]

    description: Annotated[
        Optional[str],
        Field(description="Description of the transaction")
    ] = None

    transaction_date: Annotated[
        date,
        Field(description="Date of the transaction")
    ]

    created_at: Annotated[
        datetime,
        Field(description="Time when the transaction was created")
    ]

class TransactionUpdate(BaseModel):

    amount: Annotated[
        Optional[Decimal],
        Field(
            default=None,
            gt=0,
            description="Updated transaction amount",
            examples=[550.00]
        )
    ]

    category: Annotated[
        Optional[str],
        Field(
            default=None,
            min_length=1,
            max_length=50,
            description="Updated transaction category",
            examples=["Food"]
        )
    ]

    type: Annotated[
        Optional[Literal["income", "expense"]],
        Field(
            default=None,
            description="Updated transaction type"
        )
    ]

    description: Annotated[
        Optional[str],
        Field(
            default=None,
            max_length=255,
            description="Updated transaction description"
        )
    ]

    transaction_date: Annotated[
        Optional[date],
        Field(
            default=None,
            description="Updated transaction date"
        )
    ]