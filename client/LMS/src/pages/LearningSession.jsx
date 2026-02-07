import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { ChevronRight, Loader2, Video, FileText, HelpCircle, Volume2, CheckCircle, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { courseApi } from '../api';

export const LearningSession = ({ user }) => {
    const { courseId, materialIndex } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
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
                // Reset quiz result when material changes
                setQuizResult(null);
                setSelectedAnswers({});
            } catch (err) {
                toast.error("Failed to load session");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, user._id, materialIndex]);

    const handleCheckQuiz = () => {
        const material = course.materials[materialIndex];
        const questions = material.questions || (material.question ? [{ question: material.question, options: material.options, correctAnswer: material.correctAnswer }] : []);

        const allAnswered = questions.every((_, idx) =>
            selectedAnswers[idx] !== undefined
        );

        if (!allAnswered) {
            toast.error("Please answer all questions before checking");
            return;
        }

        const correctCount = questions.filter((q, idx) => {
            const selectedOpt = q.options[selectedAnswers[idx]];
            return selectedOpt === q.correctAnswer || selectedAnswers[idx] === q.correctAnswer;
        }).length;

        const score = Math.round((correctCount / questions.length) * 100);
        setQuizResult({ score, correctCount, total: questions.length });
        toast.success(`Analysis complete! Score: ${score}%`);
    };

    const handleNext = async () => {
        const currentMaterial = course.materials[materialIndex];

        if (currentMaterial.type === 'mcq' && !quizResult) {
            toast.error("Please check your answers before proceeding");
            return;
        }

        setFinishing(true);
        try {
            await courseApi.finishMaterial(enrollment._id, currentMaterial._id);
            const nextIdx = parseInt(materialIndex) + 1;
            if (nextIdx < course.materials.length) {
                setSelectedAnswers({}); // Reset answers for next material
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

    const renderMaterialContent = () => {
        switch (material.type) {
            case 'video':
                return (
                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8">
                        <video
                            controls
                            className="w-full"
                            src={material.url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );

            case 'audio':
                return (
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] mb-8">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <Volume2 size={48} className="text-indigo-600" />
                            <h3 className="text-2xl font-black text-slate-900">Audio Lesson</h3>
                        </div>
                        <audio
                            controls
                            className="w-full"
                            src={material.url}
                        >
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                );

            case 'mcq':
                const questions = material.questions || (material.question ? [{ question: material.question, options: material.options, correctAnswer: material.correctAnswer }] : []);
                return (
                    <div className="space-y-6 mb-8">
                        {questions.map((question, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black shrink-0">
                                        {qIdx + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 pt-1">{question.question}</h3>
                                </div>
                                <div className="space-y-3 ml-14">
                                    {question.options.map((option, oIdx) => (
                                        <button
                                            key={oIdx}
                                            disabled={!!quizResult}
                                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                            className={`w-full text-left p-4 rounded-2xl font-bold transition-all border-2 ${selectedAnswers[qIdx] === oIdx
                                                ? (quizResult
                                                    ? (question.options[oIdx] === question.correctAnswer ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white')
                                                    : 'bg-indigo-600 border-indigo-600 text-white shadow-lg')
                                                : (quizResult && question.options[oIdx] === question.correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-transparent text-slate-700 hover:bg-slate-100')
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{String.fromCharCode(65 + oIdx)}. {option}</span>
                                                {quizResult && question.options[oIdx] === question.correctAnswer && (
                                                    <CheckCircle size={18} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {!quizResult ? (
                            <button
                                onClick={handleCheckQuiz}
                                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
                            >
                                Check Answers
                            </button>
                        ) : (
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${quizResult.score >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    <Trophy size={40} />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 mb-2">Quiz Results</h4>
                                <p className="text-slate-500 font-bold text-lg mb-6">
                                    You scored <span className={quizResult.score >= 50 ? 'text-emerald-600' : 'text-rose-600'}>{quizResult.score}%</span>
                                </p>
                                <div className="flex justify-center gap-8">
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Correct</p>
                                        <p className="text-2xl font-black text-emerald-600">{quizResult.correctCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</p>
                                        <p className="text-2xl font-black text-slate-900">{quizResult.total}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'text':
            default:
                return (
                    <div className="prose prose-slate max-w-none mb-20 text-lg leading-relaxed text-slate-700 bg-slate-50 p-10 rounded-[2.5rem] min-h-[400px]">
                        {material.content}
                    </div>
                );
        }
    };

    const getMaterialIcon = () => {
        switch (material.type) {
            case 'video': return <Video size={16} />;
            case 'audio': return <Volume2 size={16} />;
            case 'mcq': return <HelpCircle size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto py-20 px-6">
                <Link to={`/player/${courseId}`} className="text-indigo-600 font-bold flex items-center gap-2 mb-12 hover:underline">
                    <ChevronRight size={18} className="rotate-180" /> Back to Course Overview
                </Link>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            {getMaterialIcon()} {material.type}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">
                            Step {parseInt(materialIndex) + 1} of {course.materials.length}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight">{material.title}</h1>
                </div>

                {renderMaterialContent()}

                <div className="flex justify-between items-center bg-white sticky bottom-10 p-6 rounded-3xl shadow-2xl border border-slate-100 ring-4 ring-slate-50">
                    <div className="w-1/2 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full transition-all duration-500"
                            style={{ width: `${Math.round(((parseInt(materialIndex) + 1) / course.materials.length) * 100)}%` }}
                        ></div>
                    </div>
                    <button
                        disabled={finishing}
                        onClick={handleNext}
                        className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {finishing ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            parseInt(materialIndex) + 1 === course.materials.length ? "Finish Course" : "Next Module"
                        )}
                        <ChevronRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};
