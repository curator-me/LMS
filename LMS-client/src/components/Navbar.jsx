import { BookOpen, Wallet, Lock, LayoutDashboard } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

export const Navbar = ({ user, balance, onLogout }) => {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-2 font-bold transition-all px-3 py-2 rounded-xl ${isActive
            ? 'text-indigo-600 bg-indigo-50 shadow-sm border border-indigo-100'
            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
        }`;

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent">
                LMS Academy
            </Link>
            <div className="flex items-center gap-4">
                <NavLink to="/" end className={linkClass}>
                    <BookOpen size={20} /> Courses
                </NavLink>
                {user ? (
                    <>
                        <NavLink to="/dashboard" className={linkClass}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                        {user.accountNumber && (
                            <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg">
                                <Wallet size={16} className="text-indigo-400" /> {balance !== null ? balance.toLocaleString() : '...'} BDT
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition-all text-sm"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg">
                        <Lock size={18} /> Join
                    </Link>
                )}
            </div>
        </nav>
    );
};
