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

// 4. Create Transfer Record (LMS to Instructor - Pending Collection)
app.post("/transfer-records", async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    const value = parseFloat(amount);

    const tx = {
      from: fromAccount,
      to: toAccount,
      amount: value,
      type: "pending_collection",
      timestamp: new Date(),
      status: "pending"
    };
    await bankTransactionsCollection.insertOne(tx);

    res.status(201).json({ message: "Transfer record created", transactionId: tx._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post("/payout", async (req, res) => {
  try {
    const { accountNumber, secret, transactionId } = req.body;
    const { ObjectId } = await import("mongodb");

    const account = await accountsCollection.findOne({ accountNumber, secret });
    if (!account) return res.status(401).json({ message: "Invalid bank account credentials" });

    const tx = await bankTransactionsCollection.findOne({
      _id: new ObjectId(transactionId),
      to: accountNumber,
      status: "pending"
    });

    if (!tx) return res.status(404).json({ message: "No pending transaction found for this account" });

    const lmsAccount = await accountsCollection.findOne({ accountNumber: tx.from });
    if (!lmsAccount || lmsAccount.balance < tx.amount) {
      return res.status(400).json({ message: "Source account has insufficient funds for this payout" });
    }

    // Process the movement
    await accountsCollection.updateOne({ accountNumber: tx.from }, { $inc: { balance: -tx.amount } });
    await accountsCollection.updateOne({ accountNumber: tx.to }, { $inc: { balance: tx.amount } });

    // Update status
    await bankTransactionsCollection.updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: { status: "completed", processedAt: new Date() } }
    );

    res.json({ message: "Payout successful", amount: tx.amount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Get Transactions for an Account
app.get("/transactions/:accountNumber", async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const txs = await bankTransactionsCollection.find({
      $or: [{ from: accountNumber }, { to: accountNumber }]
    }).sort({ timestamp: -1 }).toArray();
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function start() {
  await connectBankDB();
  app.listen(port, () => console.log(`Bank Server running on port ${port}`));
}

start();
