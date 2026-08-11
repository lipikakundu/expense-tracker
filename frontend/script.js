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

                <div class="transaction-amount">
                    ₹${transaction.amount}
                </div>
            `;

            transactionList.appendChild(item);
        });

    } catch (error) {
        console.error("Transaction error:", error);
    }
}