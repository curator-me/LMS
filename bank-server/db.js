import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
export let accountsCollection;
export let bankTransactionsCollection;

export async function connectBankDB() {
  try {
    await client.connect();
    console.log("✅ Connected to Bank MongoDB");

    db = client.db(process.env.MONGO_DATABASE || "LMS_BANK");
    
    accountsCollection = db.collection("accounts");
    bankTransactionsCollection = db.collection("transactions");

    return {
      db,
      accountsCollection,
      bankTransactionsCollection,
    };
  } catch (error) {
    console.error("Bank MongoDB connection failed:", error);
    process.exit(1);
  }
}
