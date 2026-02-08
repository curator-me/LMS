import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tag, BarChart, Lock, Award, BookOpen, Video, FileText, HelpCircle, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { courseApi } from '../api';


export const CourseDetails = ({ onBuy, user }) => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        courseApi.get(id)
            .then(res => {
                setCourse(res.data);
                setLoading(false);
            })
            .catch(err => {
                toast.error("Failed to load course details");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Course...</div>;
    if (!course) return <div className="p-20 text-center font-bold text-slate-400">Course not found</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex gap-4 mb-6">
                            <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} /> {course.category}
                            </span>
                            <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <BarChart size={14} /> {course.level}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">{course.title}</h1>
                        <p className="text-indigo-600 font-bold mb-4">Instructor: {course.instructorName}</p>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">{course.description}</p>

                        <div className="space-y-4 pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-black text-slate-900">Course Syllabus</h2>
                            <div className="space-y-3">
                                {course.materials?.map((m, idx) => {
                                    const getMaterialIcon = () => {
                                        switch (m.type) {
                                            case 'video': return <Video size={16} className="text-indigo-600" />;
                                            case 'audio': return <Volume2 size={16} className="text-indigo-600" />;
                                            case 'mcq': return <HelpCircle size={16} className="text-indigo-600" />;
                                            default: return <FileText size={16} className="text-indigo-600" />;
                                        }
                                    };

                                    return (
                                        <div key={m._id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between border border-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 text-sm shadow-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getMaterialIcon()}
                                                    <h4 className="font-bold text-slate-700">{m.title}</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-indigo-50 text-indigo-600">
                                                    {m.type}
                                                </span>
                                                <Lock size={16} className="text-slate-300" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 sticky top-32">
                        <div className="text-center mb-8">
                            <div className="flex justify-center items-center gap-1">
                                <span className="text-5xl font-black text-slate-900">{course.price}</span>
                                <span className="text-xl font-bold text-slate-400 mt-4">BDT</span>
                            </div>
                        </div>
                        <button
                            onClick={() => onBuy(course)}
                            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-xl shadow-indigo-100 flex justify-center items-center gap-3"
                        >
                            <Award size={24} /> Enroll Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
