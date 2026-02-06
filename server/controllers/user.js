import { usersCollection } from "../database/connectDb.js";
import { ObjectId } from "mongodb";
import { bankManager } from "./bankManager.js";

// Signup
export async function signup(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;
    
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = {
      name,
      email,
      password, // In real app, hash this
      role,
      phone,
      accountNumber: null,
      secret: null,
      createdAt: new Date()
    };

    const result = await usersCollection.insertOne(user);
    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Login with email and password
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Initialize / Setup Wallet
export async function setupBank(req, res) {
  try {
    const { email, accountNumber, secret } = req.body;
    
    // 1. Validate with Bank Server first (verify the account exists in bank)
    try {
      await bankManager.validateAccount(accountNumber, secret);
    } catch (e) {
      return res.status(400).json({ message: "Bank account validation failed. Ensure account exists and secret is correct." });
    }

    // 2. Update LMS User
    const result = await usersCollection.findOneAndUpdate(
      { email },
      { $set: { accountNumber, secret } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ message: "User not found" });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get Balance proxy
export async function getBalance(req, res) {
  try {
    const { accountNumber } = req.params;
    const data = await bankManager.getBalance(accountNumber);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bank balance" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
