const API_URL = "https://expense-tracker-api-0pg2.onrender.com";

// Load summary and transactions when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadSummary();
    loadTransactions();
});


// --------------------
// Load Summary
// --------------------

async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/transactions/summary`);

        if (!response.ok) {
            throw new Error("Failed to load summary");
        }

        const data = await response.json();

        document.getElementById("balance").textContent =
            `₹${data.balance}`;

        document.getElementById("income").textContent =
            `₹${data.total_income}`;

        document.getElementById("expense").textContent =
            `₹${data.total_expense}`;

    } catch (error) {
        console.error("Summary error:", error);
    }
}


// --------------------
// Load Transactions
// --------------------

async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);

        if (!response.ok) {
            throw new Error("Failed to load transactions");
        }

        const transactions = await response.json();

        const transactionCount =
            document.getElementById("transactionCount");

        transactionCount.textContent =
            `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`;

        const transactionList =
            document.getElementById("transactionList");

        transactionList.innerHTML = "";

        if (transactions.length === 0) {
            transactionList.innerHTML =
                "<p>No transactions found.</p>";
            return;
        }

        transactions.forEach(transaction => {

            const item = document.createElement("div");

            item.className = "transaction-item";

                    
        item.innerHTML = `
            <div class="transaction-info">
                <h4>${transaction.category}</h4>

                <p>
                    ${transaction.description || "No description"}
                    • ${transaction.transaction_date}
                </p>
            </div>

            <div class="transaction-right">

                <div class="transaction-amount">
                    ₹${transaction.amount}
                </div>

                <button
                    class="delete-button"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>
        `;



            transactionList.appendChild(item);
        });

    } catch (error) {
        console.error("Transaction error:", error);
    }
}


// --------------------
// Add Transaction
// --------------------

document
    .getElementById("transactionForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const transaction = {
            amount: parseFloat(
                document.getElementById("amount").value
            ),

            category:
                document.getElementById("category").value,

            type:
                document.getElementById("type").value,

            description:
                document.getElementById("description").value,

            transaction_date:
                document.getElementById("transactionDate").value
        };

        try {
            const response = await fetch(
                `${API_URL}/transactions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(transaction)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.detail || "Failed to create transaction"
                );
            }

            // Clear the form
            document.getElementById("transactionForm").reset();

            // Refresh the page data
            await loadSummary();
            await loadTransactions();

        } catch (error) {
            console.error(
                "Create transaction error:",
                error
            );

            alert(`Failed to add transaction: ${error.message}`);
        }
    });


// --------------------
// Delete Transaction
// --------------------

async function deleteTransaction(transactionId) {

    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/transactions/${transactionId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const error = await response.json();

            throw new Error(
                error.detail || "Failed to delete transaction"
            );
        }

        // Refresh the data after deletion
        await loadSummary();
        await loadTransactions();

    } catch (error) {

        console.error(
            "Delete transaction error:",
            error
        );

        alert(`Failed to delete transaction: ${error.message}`);
    }
}

