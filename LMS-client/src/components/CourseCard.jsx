import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CourseCard = ({ course, isEnrolled = false }) => (
    <div className="premium-card bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <BookOpen size={24} />
            </div>
            {isEnrolled ? (
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black uppercase">Enrolled</span>
            ) : (
                <span className="text-2xl font-black text-indigo-600 font-mono">{course.price} ৳</span>
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{course.title}</h3>
        <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2">{course.description}</p>
        <Link
            to={isEnrolled ? `/player/${course._id}` : `/course/${course._id}`}
            className={`w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all group text-center ${isEnrolled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-900 text-white hover:bg-indigo-600'
                }`}
        >
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
    </div>
);
