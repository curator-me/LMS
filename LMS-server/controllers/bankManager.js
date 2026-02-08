import axios from "axios";

const BANK_URL = process.env.BANK_SERVER_URL || "http://localhost:8001";

export const bankManager = {
  // Check if a bank account exists and matches secret
  validateAccount: async (accountNumber, secret) => {
    try {
      const res = await axios.get(`${BANK_URL}/accounts/balance/${accountNumber}`);
      // In this simulation, we'll assume if we get balance, it's valid. 
      // A real system would have a dedicated verification endpoint.
      return res.data;
    } catch (e) {
      throw new Error("Invalid bank account details");
    }
  },

  // Perform a direct transfer (Learner -> Org)
  transfer: async (fromAccount, fromSecret, toAccount, amount) => {
    const res = await axios.post(`${BANK_URL}/transfer`, {
      fromAccount,
      fromSecret,
      toAccount,
      amount
    });
    return res.data;
  },

  // Create a record for instructor to collect later
  createCollectionRecord: async (fromAccount, toAccount, amount) => {
    const res = await axios.post(`${BANK_URL}/transfer-records`, {
      fromAccount,
      toAccount,
      amount
    });
    return res.data;
  },

  getBalance: async (accountNumber) => {
    const res = await axios.get(`${BANK_URL}/accounts/balance/${accountNumber}`);
    return res.data;
  },

  getTransactions: async (accountNumber) => {
    const res = await axios.get(`${BANK_URL}/transactions/${accountNumber}`);
    return res.data;
  },
  getPendingEarnings: async (accountNumber) => {
    const res = await axios.get(`${BANK_URL}/transactions/${accountNumber}`);
    // Filter only pending items where this account is the receiver
    return res.data.filter(tx => tx.to === accountNumber && tx.status === "pending" && tx.type === "pending_collection");
  },

  requestPayout: async (accountNumber, secret, transactionId) => {
    const res = await axios.post(`${BANK_URL}/payout`, {
      accountNumber,
      secret,
      transactionId
    });
    return res.data;
  }
};
