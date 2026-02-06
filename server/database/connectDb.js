import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Exported collections
let usersCollection;

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(process.env.MONGO_DATABASE || "LMS");
    usersCollection = db.collection("users");

    return {
      db,
      usersCollection,
    };
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

// Export collections directly
export {
  usersCollection,
};