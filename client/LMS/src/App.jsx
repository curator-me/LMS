import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Home, AuthPage, CourseDetails, CoursePlayer, LearningSession, Dashboard, InstructorDashboard, AdminDashboard } from './pages';
import { authApi, courseApi } from './api';

function MainApp() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [balance, setBalance] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    courseApi.list().then(res => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (user && user.accountNumber) {
      authApi.getBalance(user.accountNumber)
        .then(res => setBalance(res.data.balance))
        .catch(() => toast.error("Bank sync failed"));
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
      await courseApi.buy({
        learnerId: user._id,
        learnerBankAccount: user.accountNumber,
        secret,
        courseId: course._id
      });
      toast.success("Enrollment Successful!", { id });
      authApi.getBalance(user.accountNumber).then(res => setBalance(res.data.balance));

      // Redirect to course player after purchase
      navigate(`/player/${course._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Transaction failed", { id });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setBalance(null);
    toast.success("Logged out");
    navigate('/');
  };

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'instructor') {
      return <InstructorDashboard user={user} balance={balance} />;
    }
    if (user.role === 'admin' || user.email === 'ADMIN') {
      return <AdminDashboard />;
    }
    return <Dashboard user={user} onSetupBank={handleSetupBank} balance={balance} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <Toaster position="top-center" />
      <Navbar user={user} balance={balance} onLogout={logout} />

      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/20 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-indigo-600 text-xl tracking-tighter">SECURE BANK TRANSACTION...</p>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home courses={courses} user={user} />} />
        <Route path="/login" element={<AuthPage setUser={(u) => { setUser(u); navigate('/dashboard'); }} />} />
        <Route path="/course/:id" element={<CourseDetails onBuy={handleBuy} user={user} />} />
        <Route path="/player/:id" element={user ? <CoursePlayer user={user} /> : <Navigate to="/login" />} />
        <Route path="/learn/:courseId/:materialIndex" element={user ? <LearningSession user={user} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={renderDashboard()} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
