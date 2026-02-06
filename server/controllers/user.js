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
      password,
      role,
      phone,
      accountNumber: null,
      secret: null,
      activityLog: [],
      weeklyStreak: 0,
      lastVisit: new Date(),
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

    // Update activity tracking
    const now = new Date();
    const lastVisit = user.lastVisit ? new Date(user.lastVisit) : null;
    
    let weeklyStreak = user.weeklyStreak || 0;
    
    if (lastVisit) {
      const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        weeklyStreak += 1;
      } else if (daysDiff > 1) {
        weeklyStreak = 1;
      }
    } else {
      weeklyStreak = 1;
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { lastVisit: now, weeklyStreak },
        $push: { activityLog: { action: 'login', timestamp: now } }
      }
    );

    const updatedUser = await usersCollection.findOne({ _id: user._id });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Initialize / Setup Wallet
export async function setupBank(req, res) {
  try {
    const { email, accountNumber, secret } = req.body;
    
    try {
      await bankManager.validateAccount(accountNumber, secret);
    } catch (e) {
      return res.status(400).json({ message: "Bank account validation failed." });
    }

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

// Get user activity stats
export async function getUserStats(req, res) {
  try {
    const { userId } = req.params;
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      weeklyStreak: user.weeklyStreak || 0,
      activityLog: user.activityLog || [],
      lastVisit: user.lastVisit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
