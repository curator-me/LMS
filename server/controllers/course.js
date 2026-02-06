import { coursesCollection, enrollmentsCollection, usersCollection, materialsCollection } from "../database/connectDb.js";
import { bankManager } from "./bankManager.js";
import { ObjectId } from "mongodb";

const LMS_ORG_ACCOUNT = process.env.LMS_BANK_ACCOUNT || "LMS_ORG_MAIN";

// Get all courses
export async function getCourses(req, res) {
  try {
    const courses = await coursesCollection.find({}).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get course by ID with materials
export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await coursesCollection.findOne({ _id: new ObjectId(id) });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const materials = await materialsCollection.find({ 
      _id: { $in: course.materials.map(mId => new ObjectId(mId)) } 
    }).sort({ order: 1 }).toArray();

    res.json({ ...course, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Instructor uploads course
export async function uploadCourse(req, res) {
  try {
    const { title, description, price, instructorId, instructorBankAccount, category, level, language } = req.body;
    
    const course = {
      title,
      description,
      price: parseFloat(price),
      instructorId: instructorId,
      instructorBankAccount,
      category,
      level,
      language,
      status: "published",
      materials: [],
      createdAt: new Date()
    };

    const result = await coursesCollection.insertOne(course);
    await bankManager.createCollectionRecord(LMS_ORG_ACCOUNT, instructorBankAccount, 500);

    res.status(201).json({ message: "Course uploaded.", courseId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Learner buys course
export async function buyCourse(req, res) {
  try {
    const { learnerId, learnerBankAccount, secret, courseId } = req.body;
    
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const bankRes = await bankManager.transfer(learnerBankAccount, secret, LMS_ORG_ACCOUNT, course.price);

    if (bankRes.transactionId) {
      await enrollmentsCollection.insertOne({
        learnerId,
        courseId: new ObjectId(courseId),
        status: "paid",
        completedMaterials: [], // Tracking list of completed material IDs
        progress: 0,
        enrolledAt: new Date()
      });

      await bankManager.createCollectionRecord(LMS_ORG_ACCOUNT, course.instructorBankAccount, course.price);
      res.json({ message: "Course purchased!" });
    }
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.response?.data?.message || "Transaction failed" });
  }
}

// Mark material as finished and update progress
export async function finishMaterial(req, res) {
  try {
    const { enrollmentId, materialId } = req.body;
    
    const enrollment = await enrollmentsCollection.findOne({ _id: new ObjectId(enrollmentId) });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    const course = await coursesCollection.findOne({ _id: enrollment.courseId });
    const totalMaterials = course.materials.length;

    // Use $addToSet to ensure uniqueness
    const updatedEnrollment = await enrollmentsCollection.findOneAndUpdate(
      { _id: new ObjectId(enrollmentId) },
      { $addToSet: { completedMaterials: materialId } },
      { returnDocument: 'after' }
    );

    const completedCount = updatedEnrollment.completedMaterials.length;
    const progress = Math.round((completedCount / totalMaterials) * 100);

    // Update progress percentage and check for completion
    const updateData = { progress };
    if (progress === 100) {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }

    await enrollmentsCollection.updateOne(
      { _id: new ObjectId(enrollmentId) },
      { $set: updateData }
    );

    res.json({ message: "Material finished", progress, isCompleted: progress === 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get user enrollments
export async function getMyCourses(req, res) {
  try {
    const { userId } = req.params;
    const enrollments = await enrollmentsCollection.aggregate([
      { $match: { learnerId: userId } },
      { $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
      }},
      { $unwind: "$course" }
    ]).toArray();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get specific enrollment details (for player)
export async function getEnrollment(req, res) {
    try {
        const { userId, courseId } = req.params;
        const enrollment = await enrollmentsCollection.findOne({ 
            learnerId: userId, 
            courseId: new ObjectId(courseId) 
        });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
