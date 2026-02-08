# Bank Server API Documentation

The Bank Server is a simple microservice that handles bank accounts, transfers, and payouts for the Learning Management System.

## Base URL
`http://localhost:8001` (Default)

## Endpoints

### 1. Create/Setup Bank Account
Used to initialize or seed bank accounts.

- **URL:** `/accounts/setup`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "accountNumber": "ACC123",
    "secret": "your_secret_pin",
    "balance": 5000,
    "accountType": "savings",
    "currency": "BDT",
    "userId": "optional_user_id"
  }
  ```
- **Response Code:** `201 Created`
- **Description:** Creates a new bank account if the account number doesn't already exist.

---

### 2. Get Account Balance
Check the balance and status of a bank account.

- **URL:** `/accounts/balance/:accountNumber`
- **Method:** `GET`
- **Response Code:** `200 OK`
- **Description:** Returns the balance, currency, and status of the specified account.

---

### 3. Transfer Funds
Perform a direct transfer between two accounts. Requires authentication (secret).

- **URL:** `/transfer`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "fromAccount": "SENDER_ACC",
    "fromSecret": "pin",
    "toAccount": "RECEIVER_ACC",
    "amount": 1000
  }
  ```
- **Response Code:** `200 OK`
- **Description:** Transfers money from one account to another. Validates sender's secret and balance.

---

### 4. Create Transfer Record (Pending Collection)
Records a transaction as "pending" for later collection (e.g., LMS to Instructor).

- **URL:** `/transfer-records`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "fromAccount": "LMS_ACC",
    "toAccount": "INST_ACC",
    "amount": 500
  }
  ```
- **Response Code:** `201 Created`
- **Description:** Creates a pending transaction record. This does not move money immediately but marks it for payout.

---

### 5. Process Payout
Claim a pending transaction and move funds to the recipient's account.

- **URL:** `/payout`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "accountNumber": "INST_ACC",
    "secret": "pin",
    "transactionId": "mongo_id"
  }
  ```
- **Response Code:** `200 OK`
- **Description:** Validates the recipient and the pending transaction, then moves money from the source to the recipient.

---

### 6. Get Transactions
Retrieve all transactions associated with an account.

- **URL:** `/transactions/:accountNumber`
- **Method:** `GET`
- **Response Code:** `200 OK`
- **Description:** Returns a list of all successful and pending transactions involving the account.
