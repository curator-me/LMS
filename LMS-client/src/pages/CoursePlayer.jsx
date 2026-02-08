import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { Play, CheckCircle, Trophy, ChevronRight, Video, FileText, HelpCircle, Volume2 } from 'lucide-react';


import { toast } from 'react-hot-toast';
import { courseApi } from '../api';

export const CoursePlayer = ({ user }) => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, eRes] = await Promise.all([
                    courseApi.get(id),
                    courseApi.getEnrollment(user._id, id)
                ]);
                setCourse(cRes.data);
                setEnrollment(eRes.data);
            } catch (err) {
                toast.error("Failed to load enrollment data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user._id]);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading your course...</div>;
    if (!enrollment) return <Navigate to={`/course/${id}`} />;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <Link to="/dashboard" className="text-indigo-600 font-bold flex items-center gap-2 mb-8 hover:underline">
                <ChevronRight size={18} className="rotate-180" /> Back to Dashboard
            </Link>

            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">{course.title}</h1>
                        <p className="text-slate-500 font-medium">
                            Progress: <span className="text-indigo-600 font-bold">{enrollment.progress}%</span>
                        </p>
                    </div>
                    {enrollment.status === 'completed' && (
                        <Link to={`/certificate/${id}`} className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-black flex items-center gap-2 hover:bg-emerald-100 transition-all">
                            <Trophy size={20} /> Graduate
                        </Link>
                    )}
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-12">
                    <h2 className="text-xl font-black text-slate-900 mb-6">Course Path</h2>
                    <div className="space-y-4">
                        {course.materials?.map((m, idx) => {
                            const isCompleted = enrollment.completedMaterials?.includes(m._id);
                            const getMaterialIcon = () => {
                                switch (m.type) {
                                    case 'video': return <Video size={14} />;
                                    case 'audio': return <Volume2 size={14} />;
                                    case 'mcq': return <HelpCircle size={14} />;
                                    default: return <FileText size={14} />;
                                }
                            };

                            return (
                                <Link
                                    to={`/learn/${id}/${idx}`}
                                    key={m._id}
                                    className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                            }`}>
                                            {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={isCompleted ? 'text-slate-400' : 'text-indigo-600'}>
                                                {getMaterialIcon()}
                                            </span>
                                            <p className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-slate-700'} group-hover:text-indigo-600`}>{m.title}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'
                                        }`}>
                                        {m.type}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                </div>

                <button
                    onClick={() => navigate(`/learn/${id}/0`)}
                    className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                >
                    <Play size={24} fill="currentColor" /> {enrollment.progress > 0 ? "Resume Learning" : "Start Learning"}
                </button>
            </div>
        </div>
    );
};
