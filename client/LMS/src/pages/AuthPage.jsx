import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Smartphone, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '../api';

export const AuthPage = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'learner'
    });
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
                setIsLogin(true);
                return;
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
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
                    >
                        Join
                    </button>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-6">
                    {isLogin ? "Secure Login" : "Start Learning"}
                </h2>

                <form onSubmit={handleAction} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="auth-input"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="auth-input"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                            <Lock size={12} /> Password
                        </label>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="auth-input"
                            placeholder="••••••"
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-1">
                                    <Smartphone size={12} /> Phone Number
                                </label>
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="auth-input"
                                    placeholder="+1..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="auth-input"
                                >
                                    <option value="learner">Learner (Buyer)</option>
                                    <option value="instructor">Instructor (Seller)</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                        {isLogin ? "Sign In" : "Register Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};
