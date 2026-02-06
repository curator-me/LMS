import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle, BookOpen, Award, Wallet, Lock, Play, Trophy,
    Clock, TrendingUp, Calendar, Flame, User, Mail, Phone,
    CreditCard, PlusCircle, Trash2, Video, FileText, ChevronRight
} from 'lucide-react';
import { courseApi } from '../api';
import { toast } from 'react-hot-toast';

export const InstructorDashboard = ({ user, balance }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState({ courses: [], totalEnrollments: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    // Upload Form State
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Web Development',
        level: 'beginner',
        language: 'English',
        materials: [{ type: 'text', title: '', content: '' }]
    });

    useEffect(() => {
        if (user && user._id) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const res = await courseApi.instructorDashboard(user._id);
            setDashboardData(res.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = () => {
        setNewCourse({
            ...newCourse,
            materials: [...newCourse.materials, { type: 'text', title: '', content: '' }]
        });
    };

    const handleRemoveMaterial = (index) => {
        const updated = [...newCourse.materials];
        updated.splice(index, 1);
        setNewCourse({ ...newCourse, materials: updated });
    };

    const handleMaterialChange = (index, field, value) => {
        const updated = [...newCourse.materials];
        updated[index][field] = value;
        setNewCourse({ ...newCourse, materials: updated });
    };

    const handleUploadCourse = async (e) => {
        e.preventDefault();
        const loader = toast.loading("Uploading course...");
        try {
            await courseApi.upload({
                ...newCourse,
                instructorId: user._id,
                instructorBankAccount: user.accountNumber
            });
            toast.success("Course uploaded! You received a 500 BDT bonus.", { id: loader });
            setNewCourse({
                title: '', description: '', price: '', category: 'Web Development',
                level: 'beginner', language: 'English',
                materials: [{ type: 'text', title: '', content: '' }]
            });
            setActiveTab('overview');
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed", { id: loader });
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Instructor Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="w-full lg:w-72 shrink-0">
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`dashboard-nav ${activeTab === 'overview' ? 'active' : ''}`}
                        >
                            <TrendingUp size={20} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`dashboard-nav ${activeTab === 'upload' ? 'active' : ''}`}
                        >
                            <PlusCircle size={20} /> Upload New Course
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`dashboard-nav ${activeTab === 'profile' ? 'active' : ''}`}
                        >
                            <User size={20} /> My Profile
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Earnings</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black text-slate-900 font-mono">{dashboardData.totalRevenue}</p>
                                        <p className="text-lg font-bold text-slate-400 pb-1">BDT</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                                    <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mb-2">Total Students</p>
                                    <p className="text-4xl font-black">{dashboardData.totalEnrollments}</p>
                                    <User className="absolute -right-2 -bottom-2 text-indigo-400 opacity-20 group-hover:scale-110 transition-all duration-500" size={80} />
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Courses Published</p>
                                    <p className="text-4xl font-black text-slate-900">{dashboardData.courses.length}</p>
                                    <BookOpen className="absolute -right-2 -bottom-2 text-slate-100 opacity-80 group-hover:scale-110 transition-all duration-500" size={80} />
                                </div>
                            </div>

                            {/* Course List */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                                <h3 className="text-3xl font-black text-slate-900 mb-8">My Published Content</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dashboardData.courses.map(course => (
                                        <div key={course._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 line-clamp-1">{course.title}</h4>
                                                        <p className="text-xs text-slate-400">{course.category} • {course.level}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs font-black text-indigo-600">
                                                    {course.price} ৳
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Students</p>
                                                    <p className="text-xl font-black text-slate-800">{course.enrollmentCount}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl text-center shadow-sm">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Earnings</p>
                                                    <p className="text-xl font-black text-indigo-600">{course.revenue} ৳</p>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/course/${course._id}`}
                                                className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-sm group-hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                Preview Course <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    ))}
                                    {dashboardData.courses.length === 0 && (
                                        <p className="text-slate-500 py-12 text-center col-span-2 italic">No courses uploaded yet. Start sharing your knowledge!</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'upload' && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                            <h3 className="text-3xl font-black text-slate-900 mb-8">Upload New Course</h3>
                            <form onSubmit={handleUploadCourse} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Course Title</label>
                                        <input
                                            required
                                            value={newCourse.title}
                                            onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                            className="auth-input"
                                            placeholder="e.g. Advanced React Patterns"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Price (BDT)</label>
                                        <input
                                            required type="number"
                                            value={newCourse.price}
                                            onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                                            className="auth-input"
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Description</label>
                                    <textarea
                                        required
                                        value={newCourse.description}
                                        onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="auth-input min-h-[100px] py-4"
                                        placeholder="Tell your students what they will learn..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Category</label>
                                        <select value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} className="auth-input">
                                            <option>Web Development</option>
                                            <option>Data Science</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Level</label>
                                        <select value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })} className="auth-input">
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Language</label>
                                        <input value={newCourse.language} onChange={e => setNewCourse({ ...newCourse, language: e.target.value })} className="auth-input" />
                                    </div>
                                </div>

                                {/* Materials Section */}
                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xl font-black text-slate-900">Course Materials</h4>
                                        <button
                                            type="button" onClick={handleAddMaterial}
                                            className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
                                        >
                                            <PlusCircle size={18} /> Add Material
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {newCourse.materials.map((m, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                                                {idx > 0 && (
                                                    <button
                                                        type="button" onClick={() => handleRemoveMaterial(idx)}
                                                        className="absolute top-4 right-4 text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type</label>
                                                        <select
                                                            value={m.type} onChange={e => handleMaterialChange(idx, 'type', e.target.value)}
                                                            className="auth-input bg-white"
                                                        >
                                                            <option value="text">📄 Text Content</option>
                                                            <option value="video">🎥 Video URL</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Material Title</label>
                                                        <input
                                                            required value={m.title} onChange={e => handleMaterialChange(idx, 'title', e.target.value)}
                                                            className="auth-input bg-white" placeholder="e.g. Introduction"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                        {m.type === 'text' ? 'Content' : 'Video URL'}
                                                    </label>
                                                    {m.type === 'text' ? (
                                                        <textarea
                                                            required value={m.content} onChange={e => handleMaterialChange(idx, 'content', e.target.value)}
                                                            className="auth-input bg-white min-h-[100px]" placeholder="Paste your text content here..."
                                                        />
                                                    ) : (
                                                        <input
                                                            required value={m.url || ''} onChange={e => handleMaterialChange(idx, 'url', e.target.value)}
                                                            className="auth-input bg-white" placeholder="https://res.cloudinary.com/..."
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 mt-8"
                                >
                                    <PlusCircle size={24} /> Publish Course
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                            <h3 className="text-3xl font-black text-slate-900 mb-8">Instructor Profile</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-black">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">{user.name}</h4>
                                        <p className="text-slate-500 font-bold capitalize">Professional {user.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Mail size={20} className="text-indigo-600" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Email</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{user.email}</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Phone size={20} className="text-indigo-600" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Phone</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{user.phone || 'Not provided'}</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CreditCard size={20} className="text-indigo-600" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Payout Account</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{user.accountNumber}</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar size={20} className="text-indigo-600" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Instructor Since</p>
                                        </div>
                                        <p className="font-bold text-slate-800">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
