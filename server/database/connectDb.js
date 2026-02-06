import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI is not defined in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
export let usersCollection;
export let coursesCollection;
export let materialsCollection;
export let enrollmentsCollection;
export let transactionsCollection;

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to LMS MongoDB");

    db = client.db(process.env.MONGO_DATABASE || "LMS");
    
    usersCollection = db.collection("users");
    coursesCollection = db.collection("courses");
    materialsCollection = db.collection("materials");
    enrollmentsCollection = db.collection("enrollments");

    transactionsCollection = db.collection("transactions");

    return {
      db,
      usersCollection,
      coursesCollection,
      enrollmentsCollection,
      transactionsCollection,
    };
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}