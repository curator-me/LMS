import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectBankDB, accountsCollection, bankTransactionsCollection } from "./db.js";

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());
app.use(cors());

// --- BANK ROUTES ---

/**
 * Account Schema:
 * {
 *   accountNumber: "ACC100200",
 *   userId: "...", // Optional or linked ID
 *   secret: "...", 
 *   accountType: "savings",
 *   balance: 2500,
 *   currency: "BDT",
 *   status: "active",
 *   createdAt: "..."
 * }
 */

// 1. Setup/Create Bank Account (Internal use / Seeding)
app.post("/accounts/setup", async (req, res) => {
  try {
    const { accountNumber, secret, balance, accountType, currency, userId } = req.body;
    
    const existing = await accountsCollection.findOne({ accountNumber });
    if (existing) return res.status(400).json({ message: "Account already exists" });

    await accountsCollection.insertOne({
      accountNumber,
      secret,
      balance: parseFloat(balance) || 0,
      accountType: accountType || "savings",
      currency: currency || "BDT",
      status: "active",
      userId: userId || null,
      createdAt: new Date()
    });

    res.status(201).json({ message: "Bank account created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get Balance (Verifies accountNumber)
app.get("/accounts/balance/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await accountsCollection.findOne({ accountNumber });
    if (!account) return res.status(404).json({ message: "Account not found" });
    
    res.json({ 
      balance: account.balance, 
      currency: account.currency,
      status: account.status 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Transfer (Learner to LMS) - Validates Secret
app.post("/transfer", async (req, res) => {
  try {
    const { fromAccount, fromSecret, toAccount, amount } = req.body;
    const value = parseFloat(amount);

    const sender = await accountsCollection.findOne({ accountNumber: fromAccount, secret: fromSecret });
    if (!sender) return res.status(401).json({ message: "Authentication failed: Invalid account or secret" });
    if (sender.balance < value) return res.status(400).json({ message: "Insufficient balance" });

    const receiver = await accountsCollection.findOne({ accountNumber: toAccount });
    if (!receiver) return res.status(404).json({ message: "Recipient account not found" });

    // Atomic update simulation (not true ACID but fine for this task)
    await accountsCollection.updateOne({ accountNumber: fromAccount }, { $inc: { balance: -value } });
    await accountsCollection.updateOne({ accountNumber: toAccount }, { $inc: { balance: value } });

    const tx = {
      from: fromAccount,
      to: toAccount,
      amount: value,
      type: "transfer",
      timestamp: new Date(),
      status: "completed"
    };
    await bankTransactionsCollection.insertOne(tx);

    res.json({ message: "Transfer completed", transactionId: tx._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Create Transaction Record (LMS to Instructor)
app.post("/transfer-records", async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    const record = {
      from: fromAccount,
      to: toAccount,
      amount: parseFloat(amount),
      type: "pending_collection",
      timestamp: new Date(),
      status: "pending"
    };
    const result = await bankTransactionsCollection.insertOne(record);
    res.json({ message: "Pending transaction record created", recordId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function start() {
  await connectBankDB();
  app.listen(port, () => console.log(`Bank Server running on port ${port}`));
}

start();
