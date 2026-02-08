import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, BookOpen, Award, Wallet, Lock, Play, Trophy, Clock, TrendingUp, Calendar, Flame, User, Mail, Phone, CreditCard } from 'lucide-react';
import { courseApi, authApi } from '../api';

export const Dashboard = ({ user, onSetupBank, balance }) => {
    const [acc, setAcc] = useState('');
    const [sec, setSec] = useState('');
    const [myCourses, setMyCourses] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [userStats, setUserStats] = useState({ weeklyStreak: 0, activityLog: [] });

    useEffect(() => {
        if (user && user._id) {
            courseApi.myCourses(user._id).then(res => setMyCourses(res.data));

            // Fetch user stats
            fetch(`http://localhost:8000/user/stats/${user._id}`)
                .then(res => res.json())
                .then(data => setUserStats(data))
                .catch(err => console.error('Failed to fetch stats:', err));
        }
    }, [user]);

    if (!user.accountNumber) {
        return (
            <div className="max-w-xl mx-auto py-20 px-6 font-sans">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-slate-100">
                    <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <Wallet size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Connect Your Bank</h2>
                    <p className="text-slate-500 mb-10 font-medium text-lg">
                        To enable transactions, link your existing bank account and secret key.
                    </p>
                    <div className="space-y-4 text-left">
                        <div className="relative">
                            <Wallet className="absolute left-5 top-5 text-slate-400" size={20} />
                            <input
                                value={acc}
                                onChange={e => setAcc(e.target.value)}
                                placeholder="Account Number"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-amber-100 transition-all font-bold"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-5 text-slate-400" size={20} />
                            <input
                                value={sec}
                                type="password"
                                onChange={e => setSec(e.target.value)}
                                placeholder="Secret Phrase"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-amber-100 transition-all font-bold"
                            />
                        </div>
                        <button
                            onClick={() => onSetupBank(acc, sec)}
                            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl mt-4"
                        >
                            Authorize Connection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-72 shrink-0">
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`dashboard-nav ${activeTab === 'overview' ? 'active' : ''}`}
                        >
                            <CheckCircle size={20} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`dashboard-nav ${activeTab === 'courses' ? 'active' : ''}`}
                        >
                            <BookOpen size={20} /> {user.role === 'learner' ? 'My Library' : 'My Content'}
                        </button>
                        <button
                            onClick={() => setActiveTab('certificates')}
                            className={`dashboard-nav ${activeTab === 'certificates' ? 'active' : ''}`}
                        >
                            <Award size={20} /> My Certificates
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`dashboard-nav ${activeTab === 'profile' ? 'active' : ''}`}
                        >
                            <User size={20} /> My Profile
                        </button>
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black text-slate-900 font-mono">{balance}</p>
                                        <p className="text-lg font-bold text-slate-400 pb-1">BDT</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                                    <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mb-2">Total Courses</p>
                                    <p className="text-4xl font-black">{myCourses.length}</p>
                                    <BookOpen className="absolute -right-2 -bottom-2 text-indigo-400 opacity-20 group-hover:scale-110 transition-all duration-500" size={80} />
                                </div>

                                <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                                    <p className="text-orange-200 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
                                        <Flame size={12} /> Weekly Streak
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-4xl font-black">{userStats.weeklyStreak}</p>
                                        <p className="text-lg font-bold text-orange-200 pb-1">days</p>
                                    </div>
                                    <Calendar className="absolute -right-2 -bottom-2 text-orange-400 opacity-20 group-hover:scale-110 transition-all duration-500" size={80} />
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                                    <TrendingUp size={24} className="text-indigo-600" /> Recent Activity
                                </h3>
                                <div className="space-y-3">
                                    {userStats.activityLog?.slice(-5).reverse().map((activity, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                                <p className="font-bold text-slate-700 capitalize">{activity.action}</p>
                                            </div>
                                            <p className="text-xs text-slate-400 font-bold">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                    {(!userStats.activityLog || userStats.activityLog.length === 0) && (
                                        <div className="py-12 text-center text-slate-400 font-medium">No recent activity.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'courses' && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                            <h3 className="text-3xl font-black text-slate-900 mb-8">Course Library</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myCourses.map(en => (
                                    <div key={en._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                <BookOpen size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 line-clamp-1">{en.course.title}</h4>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-indigo-600 h-full" style={{ width: `${en.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500">{en.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/player/${en.course._id}`}
                                            className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play size={18} fill="currentColor" /> View and Resume
                                        </Link>
                                    </div>
                                ))}
                                {myCourses.length === 0 && (
                                    <p className="text-slate-500 py-12 text-center col-span-2 italic">Search courses to start learning.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                            <h3 className="text-3xl font-black text-slate-900 mb-8">My Certificates</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myCourses.filter(en => en.status === 'completed').map(en => (
                                    <div
                                        key={en._id}
                                        className="p-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center gap-4 text-center"
                                    >
                                        <Trophy size={48} className="text-amber-300 mb-2" />
                                        <div>
                                            <h4 className="text-xl font-black">{en.course.title}</h4>
                                            <p className="text-indigo-200 text-sm font-bold">
                                                Earned on {new Date(en.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-black text-sm mt-2 hover:bg-black hover:text-white transition-all">
                                            Download PDF
                                        </button>
                                    </div>
                                ))}
                                {myCourses.filter(en => en.status === 'completed').length === 0 && (
                                    <div className="col-span-2 text-center py-20 px-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                        <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                                        <p className="font-bold text-slate-400">Finish your first course to earn a certificate!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
                            <h3 className="text-3xl font-black text-slate-900 mb-8">My Profile</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-black">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">{user.name}</h4>
                                        <p className="text-slate-500 font-bold capitalize">{user.role}</p>
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
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Bank Account</p>
                                        </div>
                                        <p className="font-bold text-slate-800">{user.accountNumber}</p>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar size={20} className="text-indigo-600" />
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Member Since</p>
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
