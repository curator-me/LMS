import { useState, useEffect } from 'react';
import {
    Users, BookOpen, UserCheck, ShoppingBag,
    Calendar, Clock, TrendingUp, BarChart3,
    Trophy, ChevronRight
} from 'lucide-react';
import { adminApi } from '../api';
import { toast } from 'react-hot-toast';

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.getStats();
                setStats(res.data);
            } catch (err) {
                toast.error("Failed to load admin stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Admin Intelligence...</div>;

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</p>
            <p className="text-4xl font-black text-slate-900">{value}</p>
            <Icon className={`absolute -right-2 -bottom-2 ${color} opacity-10 group-hover:scale-110 transition-all duration-500`} size={80} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-10">
            <header>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Platform Control Center</h1>
                <p className="text-slate-500 font-bold">Comprehensive analytics and platform oversight</p>
            </header>

            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                <StatCard title="Total Students" value={stats.totalUsers} icon={Users} color="text-indigo-600" />
                <StatCard title="Total Instructors" value={stats.totalInstructors} icon={UserCheck} color="text-emerald-600" />
                <StatCard title="Courses Published" value={stats.totalCourses} icon={BookOpen} color="text-orange-600" />
                <StatCard title="Total Enrollments" value={stats.totalBought} icon={ShoppingBag} color="text-rose-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <TrendingUp className="absolute top-8 right-8 text-indigo-400 opacity-20" size={48} />
                        <h3 className="text-xl font-bold mb-8">Traffic Analytics</h3>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Clock className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Daily Active Users</p>
                                        <p className="text-2xl font-black">{stats.dailyVisit}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Calendar className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Weekly Active Users</p>
                                        <p className="text-2xl font-black">{stats.weeklyVisit}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Courses */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Trending Content</h3>
                            <BarChart3 className="text-slate-300" />
                        </div>
                        <div className="space-y-4 flex-grow">
                            {stats.topCourses.map((course, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                                            <p className="text-xs text-slate-400 font-bold">{course.enrollments} Students Enrolled</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" size={20} />
                                </div>
                            ))}
                            {stats.topCourses.length === 0 && (
                                <p className="text-center py-20 text-slate-400 font-bold italic">No enrollment data available yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
