import { BookOpen, Wallet, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ user, balance, onLogout }) => (
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
                        <BookOpen size={20} /> Dashboard
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
                    <Lock size={18} /> Join / Login
                </Link>
            )}
        </div>
    </nav>
);
