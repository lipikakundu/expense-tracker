const API_URL = "https://expense-tracker-api-0pg2.onrender.com";

let editingTransactionId = null;

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

                <div class="transaction-actions">

                    <button
                        class="edit-button"
                        onclick="editTransaction(${transaction.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        Delete
                    </button>

                </div>

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

            let response;

            if (editingTransactionId === null) {

                // --------------------
                // Create
                // --------------------

                response = await fetch(
                    `${API_URL}/transactions`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(transaction)
                    }
                );

            } else {

                // --------------------
                // Update
                // --------------------

                response = await fetch(
                    `${API_URL}/transactions/${editingTransactionId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(transaction)
                    }
                );
            }

            if (!response.ok) {

                const error = await response.json();

                throw new Error(
                    error.detail || "Request failed"
                );
            }

            // Reset edit mode
            editingTransactionId = null;

            // Reset form
            document.getElementById("transactionForm").reset();

            // Restore form UI
            document.querySelector(
                ".transaction-form h2"
            ).textContent = "Add Transaction";

            document.querySelector(
                ".add-button"
            ).textContent = "Add Transaction";

            // Refresh data
            await loadSummary();
            await loadTransactions();

        } catch (error) {

            console.error(
                "Transaction error:",
                error
            );

            alert(`Operation failed: ${error.message}`);
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


// --------------------
// Edit Transaction
// --------------------

async function editTransaction(transactionId) {

    try {

        const response = await fetch(
            `${API_URL}/transactions/${transactionId}`
        );

        if (!response.ok) {
            const error = await response.json();

            throw new Error(
                error.detail || "Failed to fetch transaction"
            );
        }

        const transaction = await response.json();

        // Remember which transaction is being edited
        editingTransactionId = transactionId;

        // Fill the form with existing values
        document.getElementById("amount").value =
            transaction.amount;

        document.getElementById("category").value =
            transaction.category;

        document.getElementById("type").value =
            transaction.type;

        document.getElementById("description").value =
            transaction.description || "";

        document.getElementById("transactionDate").value =
            transaction.transaction_date;

        // Change form heading
        document.querySelector(".transaction-form h2").textContent =
            "Edit Transaction";

        // Change button text
        document.querySelector(".add-button").textContent =
            "Update Transaction";

        // Scroll to form
        document.querySelector(".transaction-form").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Edit transaction error:",
            error
        );

        alert(`Failed to load transaction: ${error.message}`);
    }
}