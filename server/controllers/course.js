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
      _id: { $in: (course.materials || []).map(mId => new ObjectId(mId)) }
    }).sort({ order: 1 }).toArray();

    // Fetch instructor info
    const instructor = await usersCollection.findOne({
      _id: ObjectId.isValid(course.instructorId) ? new ObjectId(course.instructorId) : course.instructorId
    });

    res.json({ ...course, materials, instructorName: instructor?.name || "Unknown Instructor" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Instructor uploads course
export async function uploadCourse(req, res) {
  try {
    let { title, description, price, instructorId, instructorBankAccount, category, level, language, materials } = req.body;

    // Handle multipart form data if materials is a string
    if (typeof materials === 'string') {
      materials = JSON.parse(materials);
    }

    // 1. Create Course without materials first
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

    const courseResult = await coursesCollection.insertOne(course);
    const courseId = courseResult.insertedId;

    // 2. Insert materials if any
    let materialIds = [];
    if (materials && materials.length > 0) {
      const materialDocs = materials.map((m, idx) => {
        const materialDoc = {
          ...m,
          courseId: courseId,
          order: idx + 1,
          createdAt: new Date()
        };

        // Assign file URL if uploaded
        if (req.files) {
          const file = req.files.find(f => f.fieldname === `file_${idx}`);
          if (file) {
            // Local storage URL (commenting out Cloudinary as requested)
            // materialDoc.url = `https://res.cloudinary.com/...`; 
            materialDoc.url = `http://localhost:8000/storage/${file.mimetype.split("/")[0] === "audio" ? "audio" : "video"}/${file.filename}`;
          }
        }

        return materialDoc;
      });
      const materialResult = await materialsCollection.insertMany(materialDocs);
      materialIds = Object.values(materialResult.insertedIds);
    }

    // 3. Update course with material IDs
    await coursesCollection.updateOne(
      { _id: courseId },
      { $set: { materials: materialIds } }
    );

    // Initial reward for uploading
    await bankManager.createCollectionRecord(LMS_ORG_ACCOUNT, instructorBankAccount, 500);

    res.status(201).json({ message: "Course uploaded successfully.", courseId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// Learner buys course
export async function buyCourse(req, res) {
  try {
    const { learnerId, learnerBankAccount, secret, courseId } = req.body;

    // Check if already bought
    const existingEnrollment = await enrollmentsCollection.findOne({
      learnerId,
      courseId: new ObjectId(courseId)
    });
    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (existingEnrollment) {
      return res.status(400).json({ message: "You already own this course." });
    }

    const bankRes = await bankManager.transfer(learnerBankAccount, secret, LMS_ORG_ACCOUNT, course.price);

    if (bankRes.transactionId) {
      await enrollmentsCollection.insertOne({
        learnerId,
        courseId: new ObjectId(courseId),
        status: "paid",
        completedMaterials: [],
        progress: 0,
        enrolledAt: new Date()
      });

      await bankManager.createCollectionRecord(LMS_ORG_ACCOUNT, course.instructorBankAccount, course.price);
      res.json({ message: "Course purchased!", courseId });
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

    const updatedEnrollment = await enrollmentsCollection.findOneAndUpdate(
      { _id: new ObjectId(enrollmentId) },
      { $addToSet: { completedMaterials: materialId } },
      { returnDocument: 'after' }
    );

    const completedCount = updatedEnrollment.completedMaterials.length;
    const progress = Math.round((completedCount / totalMaterials) * 100);

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
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" }
    ]).toArray();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get specific enrollment details
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

// Get Instructor Courses and Stats
export async function getInstructorDashboardData(req, res) {
  try {
    const { instructorId } = req.params;

    // 1. Get all courses by this instructor
    const courses = await coursesCollection.find({ instructorId }).toArray();
    const courseIds = courses.map(c => c._id);

    // 2. Get enrollments for these courses
    const enrollments = await enrollmentsCollection.find({
      courseId: { $in: courseIds }
    }).toArray();

    // 3. Detailed stats per course
    const courseStats = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId.toString() === course._id.toString());
      return {
        ...course,
        enrollmentCount: courseEnrollments.length,
        revenue: courseEnrollments.length * course.price
      };
    });

    const totalEnrollments = enrollments.length;
    const totalRevenue = courseStats.reduce((sum, c) => sum + c.revenue, 0);

    // 4. Get pending payouts from bank if instructor has account
    let pendingPayouts = [];
    const instructor = await usersCollection.findOne({ _id: new ObjectId(instructorId) });
    if (instructor && instructor.accountNumber) {
      pendingPayouts = await bankManager.getPendingEarnings(instructor.accountNumber);
    }

    res.json({
      courses: courseStats,
      totalEnrollments,
      totalRevenue,
      pendingPayouts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function requestPayout(req, res) {
  try {
    const { instructorId, secret, transactionId } = req.body;

    const instructor = await usersCollection.findOne({ _id: new ObjectId(instructorId) });
    if (!instructor || !instructor.accountNumber) {
      return res.status(400).json({ message: "Instructor bank account not found" });
    }

    const result = await bankManager.requestPayout(instructor.accountNumber, secret, transactionId);
    res.json(result);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || error.message
    });
  }
}
