import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Award, Download, Eye, ChevronRight, Lock, CheckCircle, User, Calendar, ExternalLink, Clock } from 'lucide-react';
import { courseApi } from '../api';
import { toast } from 'react-hot-toast';

export const CertificatePreview = ({ user }) => {
    const { courseId } = useParams();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await courseApi.getEnrollmentStatus(user._id, courseId);
                setStatus(res.data);
            } catch (err) {
                toast.error("Failed to load certificate status");
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [courseId, user._id]);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Verifying achievements...</div>;

    if (!status || status.status !== 'completed') {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                    <Lock size={64} className="mx-auto text-slate-200 mb-6" />
                    <h2 className="text-3xl font-black text-slate-900 mb-4">Certificate Locked</h2>
                    <p className="text-slate-500 font-medium mb-8">
                        You need to complete all materials in this course to earn your certificate.
                    </p>
                    <Link to={`/player/${courseId}`} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all">
                        Resume Learning
                    </Link>
                </div>
            </div>
        );
    }

    const { isCollected, instructorName } = status;

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <Link to="/dashboard" className="text-indigo-600 font-bold flex items-center gap-2 mb-8 hover:underline">
                <ChevronRight size={18} className="rotate-180" /> Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                        {/* Certificate Background UI */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-50 rounded-full -ml-32 -mb-32 opacity-50"></div>

                        <div className="relative z-10 border-8 border-double border-slate-100 p-12 text-center rounded-[2rem]">
                            <Trophy size={80} className="mx-auto text-amber-400 mb-8" />
                            <h4 className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-4">Certificate of Completion</h4>
                            <p className="text-slate-400 font-medium mb-2 text-lg italic">This is to certify that</p>
                            <h1 className="text-5xl font-black text-slate-900 mb-8 font-serif uppercase tracking-tight">{user.name}</h1>
                            <p className="text-slate-400 font-medium mb-2 text-lg italic">has successfully completed the course</p>
                            <h2 className="text-3xl font-black text-indigo-900 mb-12">"Node.js & MongoDB Fundamentals"</h2>

                            <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-100">
                                <div className="text-left">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Instructor</p>
                                    <p className="font-bold text-slate-900">{instructorName}</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-black text-xs">
                                        LMS<br />SEAL
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Verified</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                    <p className="font-bold text-slate-900">{new Date(status.completedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-32">
                        <h3 className="text-2xl font-black text-slate-900 mb-6">Your Achievement</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <CheckCircle className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-xs font-black text-emerald-600 uppercase">Status</p>
                                    <p className="font-bold text-emerald-900">Graduated</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isCollected ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
                                {isCollected ? <Award className="text-indigo-500" size={24} /> : <Clock className="text-amber-500 animate-pulse" size={24} />}
                                <div>
                                    <p className={`text-xs font-black uppercase ${isCollected ? 'text-indigo-600' : 'text-amber-600'}`}>Certification Access</p>
                                    <p className={`font-bold ${isCollected ? 'text-indigo-900' : 'text-amber-900'}`}>
                                        {isCollected ? 'Approved & Verified' : 'Waiting for Approval'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!isCollected && (
                            <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Please wait while we verify the transaction. The certificate will be available once the instructor collects the course funds.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={() => isCollected ? setShowModal(true) : toast.error("Certification awaiting approval")}
                                className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isCollected ? 'bg-indigo-600 text-white hover:bg-black shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Eye size={20} /> Preview Certificate
                            </button>
                            <button
                                onClick={() => isCollected ? toast.success("Downloading...") : toast.error("Certification awaiting approval")}
                                className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${isCollected ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <Download size={20} /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Modal Preview */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] p-10 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                            ✕
                        </button>

                        <div className="bg-white border-4 border-slate-800 p-8 text-center rounded-[2rem]">
                            <Trophy size={60} className="mx-auto text-amber-400 mb-6" />
                            <h4 className="text-indigo-600 font-black uppercase text-xs mb-4">Official Certification</h4>
                            <h1 className="text-4xl font-black text-slate-900 mb-6">{user.name}</h1>
                            <p className="text-slate-500 font-medium mb-8">has accomplished excellence in completing the curriculum of "LMS Academy" for the course of study provided by {instructorName}.</p>
                            <div className="h-[2px] bg-slate-100 w-1/2 mx-auto mb-8"></div>
                            <div className="flex justify-between px-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Verification ID</p>
                                    <p className="font-mono text-xs font-bold">{status._id.substring(0, 10).toUpperCase()}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl">
                                    <CheckCircle size={14} className="text-indigo-600" />
                                    <p className="text-xs font-black text-indigo-600 uppercase">LMS Certified</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => toast.success("Preparing PDF...")}
                                className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-xl hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-indigo-200"
                            >
                                <Download size={24} /> Download Final Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
