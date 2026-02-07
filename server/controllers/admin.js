import { usersCollection, coursesCollection, enrollmentsCollection } from "../database/connectDb.js";

export async function getAdminStats(req, res) {
    try {
        const totalUsers = await usersCollection.countDocuments({ role: "learner" });
        const totalInstructors = await usersCollection.countDocuments({ role: "instructor" });
        const totalCourses = await coursesCollection.countDocuments({});
        const totalBought = await enrollmentsCollection.countDocuments({});

        // Visit stats (Daily/Weekly unique users)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailyVisit = await usersCollection.countDocuments({
            "activityLog": {
                $elemMatch: {
                    action: "login",
                    timestamp: { $gte: oneDayAgo }
                }
            }
        });

        const weeklyVisit = await usersCollection.countDocuments({
            "activityLog": {
                $elemMatch: {
                    action: "login",
                    timestamp: { $gte: oneWeekAgo }
                }
            }
        });

        // Top courses based on enrollment
        const topCourses = await enrollmentsCollection.aggregate([
            { $group: { _id: "$courseId", enrollments: { $sum: 1 } } },
            { $sort: { enrollments: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "courseInfo"
                }
            },
            { $unwind: "$courseInfo" },
            {
                $project: {
                    title: "$courseInfo.title",
                    enrollments: 1
                }
            }
        ]).toArray();

        res.json({
            totalUsers,
            totalInstructors,
            totalCourses,
            totalBought,
            dailyVisit,
            weeklyVisit,
            topCourses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
