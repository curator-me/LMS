import { useState, useEffect } from 'react';
import { CourseCard } from '../components/CourseCard';

export const Home = ({ courses, user }) => {
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

    useEffect(() => {
        if (user && user._id) {
            // Fetch enrolled courses
            fetch(`http://localhost:8000/course/my/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    const ids = new Set(data.map(enrollment => enrollment.courseId.toString()));
                    setEnrolledCourseIds(ids);
                })
                .catch(err => console.error('Failed to fetch enrollments:', err));
        }
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <header className="mb-12 text-center md:text-left">
                <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
                    Upgrade Your <br />
                    <span className="text-indigo-600">Future.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl font-medium">
                    High-quality materials in Text, Audio, and Video. Secure transactions with our integrated banking system.
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <CourseCard
                        key={course._id}
                        course={course}
                        isEnrolled={enrolledCourseIds.has(course._id.toString())}
                    />
                ))}
            </div>
        </div>
    );
};
