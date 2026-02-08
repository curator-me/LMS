import { connectDB, coursesCollection, usersCollection, materialsCollection, enrollmentsCollection } from "./database/connectDb.js";
import axios from "axios";
import "dotenv/config";

async function seed() {
  await connectDB();
  const BANK_URL = process.env.BANK_SERVER_URL || "http://localhost:8001";

  console.log("Cleaning old data...");
  await usersCollection.deleteMany({});
  await coursesCollection.deleteMany({});
  await materialsCollection.deleteMany({});
  await enrollmentsCollection.deleteMany({});

  // 1. Setup LMS Org Bank Account
  console.log("Setting up LMS Org Bank...");
  try {
    await axios.post(`${BANK_URL}/accounts/setup`, {
      accountNumber: "LMS_ORG_MAIN",
      secret: "org-secret",
      balance: 100000,
      currency: "BDT"
    });
  } catch (e) { }

  // 2. Pre-create Bank Accounts for Users
  const bankAccountsToSeed = [
    { accountNumber: "ACC100200", secret: "secret123", balance: 5000 },
    { accountNumber: "ACC_JOHN", secret: "john789", balance: 2500 },
    { accountNumber: "ACC_SARAH", secret: "sarah456", balance: 3000 },
    { accountNumber: "ACC_MIKE", secret: "mike123", balance: 4000 },
    { accountNumber: "ACC_ALICE", secret: "alice123", balance: 6000 },
    { accountNumber: "ACC_BOB", secret: "bob123", balance: 7500 },
    { accountNumber: "A", secret: "pass123", balance: 5000 },
    { accountNumber: "B", secret: "pass123", balance: 5000 },
    { accountNumber: "C", secret: "pass123", balance: 5000 }
  ];

  for (const acc of bankAccountsToSeed) {
    try {
      await axios.post(`${BANK_URL}/accounts/setup`, {
        ...acc,
        accountType: "savings",
        currency: "BDT"
      });
      console.log(`Seeded bank account: ${acc.accountNumber}`);
    } catch (e) {
      console.log(e);
    }
  }

  // 3. Create Instructors
  const instructors = [
    { name: "John Instructor", email: "john@instructor.com", phone: "123", role: "instructor", accountNumber: "ACC_JOHN", secret: "john789" },
    { name: "Sarah Expert", email: "sarah@instructor.com", phone: "456", role: "instructor", accountNumber: "ACC_SARAH", secret: "sarah456" },
    { name: "Mike Pro", email: "mike@instructor.com", phone: "789", role: "instructor", accountNumber: "ACC_MIKE", secret: "mike123" },
    { name: "Alice Dev", email: "alice@instructor.com", phone: "111", role: "instructor", accountNumber: "ACC_ALICE", secret: "alice123" },
    { name: "Bob Data", email: "bob@instructor.com", phone: "222", role: "instructor", accountNumber: "ACC_BOB", secret: "bob123" },
  ];

  const instructorDocs = [];
  for (const ins of instructors) {
    const res = await usersCollection.insertOne({ ...ins, password: "123", createdAt: new Date() });
    instructorDocs.push({ ...ins, _id: res.insertedId });
  }

  // 3.5 Create Admin
  await usersCollection.insertOne({
    name: "Admin Platform",
    email: "ADMIN",
    password: "admin",
    secret: "admin",
    role: "admin",
    createdAt: new Date(),
    activityLog: []
  });


  // 4. Create Courses with Materials
  const courseData = [
    {
      title: "Node.js & MongoDB Fundamentals",
      description: "Learn backend development with Node.js and MongoDB from scratch.",
      price: 500,
      category: "Web Development",
      level: "beginner",
      language: "English",
      status: "published",
      instructorId: instructorDocs[0]._id,
      instructorBankAccount: instructorDocs[0].accountNumber,
      materials: [
        { type: "text", title: "Intro to Node.js", content: "Node.js allows running JS on the server. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.", order: 1 },
        { type: "video", title: "Node.js Tutorial Video", url: "http://localhost:8000/storage/video/React-in-100-Seconds.mp4", duration: 100, order: 2 },
        { type: "text", title: "Understanding MongoDB", content: "MongoDB is a NoSQL database that stores data in JSON-like documents. It's highly scalable and flexible, perfect for modern applications.", order: 3 },
        {
          type: "mcq", title: "Node.js Basics Quiz", order: 4, questions: [
            { question: "What is Node.js built on?", options: ["V8 Engine", "SpiderMonkey", "Chakra", "JavaScriptCore"], correctAnswer: 0 },
            { question: "Which package manager is used with Node.js?", options: ["pip", "npm", "gem", "composer"], correctAnswer: 1 }
          ]
        }
      ]
    },
    {
      title: "React Mastery",
      description: "Master React and building dynamic user interfaces with ease.",
      price: 800,
      category: "Frontend Development",
      level: "intermediate",
      language: "English",
      status: "published",
      instructorId: instructorDocs[1]._id,
      instructorBankAccount: instructorDocs[1].accountNumber,
      materials: [
        { type: "video", title: "React in 100 Seconds", url: "http://localhost:8000/storage/video/React-in-100-Seconds.mp4", duration: 100, order: 1 },
        { type: "text", title: "React Hooks", content: "Learn about useState, useEffect, and how they manage component lifecycles. Hooks revolutionized React development.", order: 2 },
        { type: "text", title: "Component Architecture", content: "How to structure your React apps effectively using atoms, molecules, and organisms pattern.", order: 3 },
        {
          type: "mcq", title: "React Fundamentals Quiz", order: 4, questions: [
            { question: "Which hook is used for side effects?", options: ["useState", "useEffect", "useContext", "useReducer"], correctAnswer: 1 },
            { question: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"], correctAnswer: 0 }
          ]
        }
      ]
    },
    {
      title: "Python for AI",
      description: "Explore the power of Python in the world of Artificial Intelligence.",
      price: 1200,
      category: "Data Science",
      level: "advanced",
      language: "English",
      status: "published",
      instructorId: instructorDocs[2]._id,
      instructorBankAccount: instructorDocs[2].accountNumber,
      materials: [
        { type: "video", title: "Python in 100 Seconds", url: "http://localhost:8000/storage/video/Python-in-100-Seconds.mp4", duration: 100, order: 1 },
        { type: "text", title: "NumPy Basics", content: "Efficiently handling multi-dimensional arrays with NumPy's powerful library. Essential for data science and machine learning.", order: 2 },
        { type: "text", title: "Intro to Neural Networks", content: "Understanding the biological inspiration and mathematical models behind neural networks. Learn how AI learns from data.", order: 3 },
        {
          type: "mcq", title: "Python AI Quiz", order: 4, questions: [
            { question: "Which library is used for numerical computing?", options: ["Pandas", "NumPy", "Matplotlib", "Seaborn"], correctAnswer: 1 },
            { question: "What is a neural network layer?", options: ["A database", "A transformation of data", "A file system", "A web server"], correctAnswer: 1 }
          ]
        }
      ]

    },
    {
      title: "Fullstack JavaScript",
      description: "Become a professional fullstack developer using Node.js, Express, and React.",
      price: 1000,
      category: "Web Development",
      level: "intermediate",
      language: "English",
      status: "published",
      instructorId: instructorDocs[3]._id,
      instructorBankAccount: instructorDocs[3].accountNumber,
      materials: [
        { type: "text", title: "Frontend vs Backend", content: "Understand the core differences and how they communicate via APIs.", order: 1 },
        { type: "text", title: "Setting up Node.js Environment", content: "Installing Node, npm, and configuring your local dev environment for success.", order: 2 },
        { type: "text", title: "RESTful APIs with Express", content: "Learn the principles of REST and how to implement them using Express.js.", order: 3 }
      ]
    },
    {
      title: "Data Visualization with Python",
      description: "Learn to create stunning charts and dashboards using Matplotlib and Seaborn.",
      price: 700,
      category: "Data Science",
      level: "beginner",
      language: "English",
      status: "published",
      instructorId: instructorDocs[4]._id,
      instructorBankAccount: instructorDocs[4].accountNumber,
      materials: [
        { type: "text", title: "Python Data Structures", content: "Using Lists, dictionaries, and tuples effectively for data storage and retrieval.", order: 1 },
        { type: "text", title: "Matplotlib Basics", content: "Creating line plots, bar charts, and histograms with custom styling.", order: 2 },
        { type: "text", title: "Seaborn for Statistical Plots", content: "Leveraging Seaborn for more advanced and aesthetically pleasing statistical visualizations.", order: 3 }
      ]
    }
  ];

  for (const data of courseData) {
    const { materials, ...courseInfo } = data;
    const courseRes = await coursesCollection.insertOne({ ...courseInfo, createdAt: new Date() });
    const courseId = courseRes.insertedId;

    const materialDocs = materials.map(m => ({ ...m, courseId, createdAt: new Date() }));
    const materialRes = await materialsCollection.insertMany(materialDocs);

    const materialIds = Object.values(materialRes.insertedIds);
    await coursesCollection.updateOne({ _id: courseId }, { $set: { materials: materialIds } });
  }

  console.log("Seeding completed successfully with materials linked!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
