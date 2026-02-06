import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { BookOpen, User, Wallet, Award, PlusCircle, LogIn, ChevronRight, CheckCircle, Smartphone, UserPlus, Lock, Mail, Tag, Globe, BarChart, Play, Loader2, Trophy, Clock } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { authApi, courseApi } from './api';

// --- COMPONENTS ---

const Navbar = ({ user, balance, onLogout }) => (
  <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">
      LMS Academy
    </Link>
    <div className="flex items-center gap-6">
      <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium">
        <BookOpen size={20} /> Courses
      </Link>
      {user ? (
        <>
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium">
            <User size={20} /> Dashboard
          </Link>
          {user.accountNumber && (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-bold">
              <Wallet size={18} /> {balance !== null ? balance : '...'} BDT
            </div>
          )}
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-500 font-medium">Sign Out</button>
        </>
      ) : (
        <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-black transition-colors flex items-center gap-2">
          <LogIn size={18} /> Join / Login
        </Link>
      )}
    </div>
  </nav>
);

const CourseCard = ({ course }) => (
  <div className="premium-card bg-white rounded-3xl p-6 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
        <BookOpen size={24} />
      </div>
      <span className="text-2xl font-black text-indigo-600 font-mono">{course.price} ৳</span>
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{course.title}</h3>
    <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2">{course.description}</p>
    <Link
      to={`/course/${course._id}`}
      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-600 transition-all group text-center"
    >
      Enroll Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </div>
);

// --- PAGES ---

const Home = ({ courses }) => (
  <div className="max-w-7xl mx-auto py-12 px-6">
    <header className="mb-12 text-center md:text-left">
      <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
        Upgrade Your <br />
        <span className="text-indigo-600">Future.</span>
      </h1>
      <p className="text-lg text-slate-500 max-w-2xl font-medium">High-quality materials in Text, Audio, and Video. Secure transactions with our integrated banking system.</p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  </div>
);

const CourseDetails = ({ onBuy, user }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.get(id).then(res => {
      setCourse(res.data);
      setLoading(false);
    }).catch(err => {
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
              <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Tag size={14} /> {course.category}</span>
              <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"><BarChart size={14} /> {course.level}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">{course.title}</h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">{course.description}</p>

            <div className="space-y-4 pt-8 border-t border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Course Syllabus</h2>
              <div className="space-y-3">
                {course.materials?.map((m, idx) => (
                  <div key={m._id} className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between border border-transparent">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 text-sm shadow-sm">{idx + 1}</div>
                      <h4 className="font-bold text-slate-700">{m.title}</h4>
                    </div>
                    <Lock size={16} className="text-slate-300" />
                  </div>
                ))}
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
            <button onClick={() => onBuy(course)} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-xl shadow-indigo-100 flex justify-center items-center gap-3">
              <Award size={24} /> Enroll Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Player Page (Post-Purchase View) ---
const CoursePlayer = ({ user }) => {
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
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">{course.title}</h1>
            <p className="text-slate-500 font-medium">Progress: <span className="text-indigo-600 font-bold">{enrollment.progress}%</span></p>
          </div>
          {enrollment.status === 'completed' && (
            <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full font-black flex items-center gap-2">
              <Trophy size={20} /> Graduate
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-12">
          <h2 className="text-xl font-black text-slate-900 mb-6">Course Path</h2>
          <div className="space-y-4">
            {course.materials?.map((m, idx) => {
              const isCompleted = enrollment.completedMaterials?.includes(m._id);
              return (
                <div key={m._id} className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                    </div>
                    <p className={`font-bold ${isCompleted ? 'text-slate-400' : 'text-slate-700'}`}>{m.title}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                    {m.type}
                  </span>
                </div>
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

// --- Learning Session (View Materials) ---
const LearningSession = ({ user }) => {
  const { courseId, materialIndex } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          courseApi.get(courseId),
          courseApi.getEnrollment(user._id, courseId)
        ]);
        setCourse(cRes.data);
        setEnrollment(eRes.data);
      } catch (err) {
        toast.error("Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user._id]);

  const handleNext = async () => {
    const currentMaterial = course.materials[materialIndex];
    setFinishing(true);
    try {
      await courseApi.finishMaterial(enrollment._id, currentMaterial._id);
      const nextIdx = parseInt(materialIndex) + 1;
      if (nextIdx < course.materials.length) {
        navigate(`/learn/${courseId}/${nextIdx}`);
      } else {
        toast.success("Congratulations! You've finished the course.");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error("Failed to update progress");
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading Material...</div>;

  const material = course.materials[materialIndex];
  if (!material) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-20 px-6">
        <Link to={`/player/${courseId}`} className="text-indigo-600 font-bold flex items-center gap-2 mb-12 hover:underline">
          <ChevronRight size={18} className="rotate-180" /> Back to Course Overview
        </Link>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{material.type}</span>
            <span className="text-slate-400 font-bold text-sm">Step {parseInt(materialIndex) + 1} of {course.materials.length}</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 leading-tight">{material.title}</h1>
        </div>

        <div className="prose prose-slate max-w-none mb-20 text-lg leading-relaxed text-slate-700 bg-slate-50 p-10 rounded-[2.5rem] min-h-[400px]">
          {material.content}
        </div>

        <div className="flex justify-between items-center bg-white sticky bottom-10 p-6 rounded-3xl shadow-2xl border border-slate-100 ring-4 ring-slate-50">
          <div className="w-1/2 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${Math.round(((parseInt(materialIndex) + 1) / course.materials.length) * 100)}%` }}></div>
          </div>
          <button
            disabled={finishing}
            onClick={handleNext}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {finishing ? <Loader2 className="animate-spin" /> : (parseInt(materialIndex) + 1 === course.materials.length ? "Finish Course" : "Next Module")}
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'learner' });
  const navigate = useNavigate();

  const handleAction = async (e) => {
    e.preventDefault();
    const loading = toast.loading(isLogin ? "Signing in..." : "Creating account...");
    try {
      let res;
      if (isLogin) {
        res = await authApi.login({ email: formData.email, password: formData.password });
        toast.success("Welcome back!", { id: loading });
      } else {
        res = await authApi.signup({ ...formData });
        toast.success("Account created! Please login.", { id: loading });
        setIsLogin(true); return;
      }
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed", { id: loading });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-slate-100 ring-1 ring-slate-50">
        <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Login</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Join</button>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-6">{isLogin ? "Secure Login" : "Start Learning"}</h2>
        <form onSubmit={handleAction} className="space-y-4">
          {!isLogin && (<div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Full Name</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="auth-input" placeholder="John Doe" /></div>)}
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Mail size={12} /> Email Address</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="auth-input" placeholder="john@example.com" /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Lock size={12} /> Password</label><input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="auth-input" placeholder="••••••" /></div>
          {!isLogin && (<><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1"><Smartphone size={12} /> Phone Number</label><input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="auth-input" placeholder="+1..." /></div><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Role</label><select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="auth-input"><option value="learner">Learner (Buyer)</option><option value="instructor">Instructor (Seller)</option></select></div></>)}
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 mt-4">{isLogin ? "Sign In" : "Register Account"}</button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onSetupBank, balance }) => {
  const [acc, setAcc] = useState('');
  const [sec, setSec] = useState('');
  const [myCourses, setMyCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && user._id) courseApi.myCourses(user._id).then(res => setMyCourses(res.data));
  }, [user]);

  if (!user.accountNumber) return (
    <div className="max-w-xl mx-auto py-20 px-6 font-sans">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-slate-100">
        <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse"><Wallet size={48} /></div>
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Connect Your Bank</h2>
        <p className="text-slate-500 mb-10 font-medium text-lg">To enable transactions, link your existing bank account and secret key.</p>
        <div className="space-y-4 text-left">
          <div className="relative"><Wallet className="absolute left-5 top-5 text-slate-400" size={20} /><input value={acc} onChange={e => setAcc(e.target.value)} placeholder="Account Number" className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-amber-100 transition-all font-bold" /></div>
          <div className="relative"><Lock className="absolute left-5 top-5 text-slate-400" size={20} /><input value={sec} type="password" onChange={e => setSec(e.target.value)} placeholder="Secret Phrase" className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-amber-100 transition-all font-bold" /></div>
          <button onClick={() => onSetupBank(acc, sec)} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl mt-4">Authorize Connection</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`dashboard-nav ${activeTab === 'overview' ? 'active' : ''}`}><CheckCircle size={20} /> Overview</button>
            <button onClick={() => setActiveTab('courses')} className={`dashboard-nav ${activeTab === 'courses' ? 'active' : ''}`}><BookOpen size={20} /> {user.role === 'learner' ? 'My Library' : 'My Content'}</button>
            <button onClick={() => setActiveTab('certificates')} className={`dashboard-nav ${activeTab === 'certificates' ? 'active' : ''}`}><Award size={20} /> My Certificates</button>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                <div className="flex items-end gap-2"><p className="text-5xl font-black text-slate-900 font-mono">{balance}</p><p className="text-xl font-bold text-slate-400 pb-1">BDT</p></div>
              </div>
              <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
                <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mb-2">Account Type</p>
                <p className="text-5xl font-black uppercase italic tracking-tighter">{user.role}</p>
                <Award className="absolute -right-4 -bottom-4 text-indigo-500 opacity-20 group-hover:scale-125 transition-all duration-500" size={120} />
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
              <h3 className="text-3xl font-black text-slate-900 mb-8">Course Library</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map(en => (
                  <div key={en._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><BookOpen size={24} /></div>
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
                    <Link to={`/player/${en.course._id}`} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                      <Play size={18} fill="currentColor" /> View and Resume
                    </Link>
                  </div>
                ))}
                {myCourses.length === 0 && <p className="text-slate-500 py-12 text-center col-span-2 italic">Search courses to start learning.</p>}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 font-sans">
              <h3 className="text-3xl font-black text-slate-900 mb-8">My Certificates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.filter(en => en.status === 'completed').map(en => (
                  <div key={en._id} className="p-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center gap-4 text-center">
                    <Trophy size={48} className="text-amber-300 mb-2" />
                    <div>
                      <h4 className="text-xl font-black">{en.course.title}</h4>
                      <p className="text-indigo-200 text-sm font-bold">Earned on {new Date(en.completedAt).toLocaleDateString()}</p>
                    </div>
                    <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-black text-sm mt-2 hover:bg-black hover:text-white transition-all">Download PDF</button>
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
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [balance, setBalance] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { courseApi.list().then(res => setCourses(res.data)); }, []);

  useEffect(() => {
    if (user && user.accountNumber) {
      authApi.getBalance(user.accountNumber).then(res => setBalance(res.data.balance)).catch(() => toast.error("Bank sync failed"));
    }
  }, [user]);

  const handleSetupBank = async (acc, sec) => {
    const loader = toast.loading("Connecting to bank...");
    try {
      const res = await authApi.setupBank(user.email, acc, sec);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Bank account linked!", { id: loader });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to link bank", { id: loader });
    }
  };

  const handleBuy = async (course) => {
    if (!user) return toast.error("Please login to enroll");
    if (!user.accountNumber) return toast("Link bank in Dashboard first", { icon: '🏦' });
    const secret = prompt(`Authorized Payment: Buy "${course.title}" for ${course.price} BDT. Enter bank secret:`);
    if (!secret) return;
    setLoading(true);
    const id = toast.loading("Authorizing payment...");
    try {
      await courseApi.buy({ learnerId: user._id, learnerBankAccount: user.accountNumber, secret, courseId: course._id });
      toast.success("Enrollment Successful!", { id });
      authApi.getBalance(user.accountNumber).then(res => setBalance(res.data.balance));
    } catch (e) {
      toast.error(e.response?.data?.message || "Transaction failed", { id });
    } finally { setLoading(false); }
  };

  const logout = () => { localStorage.removeItem('user'); setUser(null); setBalance(null); toast.success("Logged out"); };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
        <Toaster position="top-center" />
        <Navbar user={user} balance={balance} onLogout={logout} />
        {loading && (<div className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-md flex flex-col items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div><p className="font-black text-indigo-600 text-xl tracking-tighter">SECURE BANK TRANSACTION...</p></div>)}
        <Routes>
          <Route path="/" element={<Home courses={courses} />} />
          <Route path="/login" element={<AuthPage setUser={setUser} />} />
          <Route path="/course/:id" element={<CourseDetails onBuy={handleBuy} user={user} />} />
          <Route path="/player/:id" element={user ? <CoursePlayer user={user} /> : <Navigate to="/login" />} />
          <Route path="/learn/:courseId/:materialIndex" element={user ? <LearningSession user={user} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} onSetupBank={handleSetupBank} balance={balance} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}
