import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { ChevronRight, Loader2, Video, FileText, HelpCircle, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { courseApi } from '../api';

export const LearningSession = ({ user }) => {
    const { courseId, materialIndex } = useParams();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
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
    }, [courseId, user._id, materialIndex]);

    const handleNext = async () => {
        const currentMaterial = course.materials[materialIndex];

        // Validate MCQ answers if material is MCQ type
        if (currentMaterial.type === 'mcq') {
            const allAnswered = currentMaterial.questions.every((_, idx) =>
                selectedAnswers[idx] !== undefined
            );

            if (!allAnswered) {
                toast.error("Please answer all questions before proceeding");
                return;
            }

            // Check answers
            const correctCount = currentMaterial.questions.filter((q, idx) =>
                selectedAnswers[idx] === q.correctAnswer
            ).length;

            const score = Math.round((correctCount / currentMaterial.questions.length) * 100);
            toast.success(`Quiz completed! Score: ${score}%`);
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
                return (
                    <div className="space-y-6 mb-8">
                        {material.questions.map((question, qIdx) => (
                            <div key={qIdx} className="bg-slate-50 p-8 rounded-[2.5rem]">
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
                                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })}
                                            className={`w-full text-left p-4 rounded-2xl font-bold transition-all ${selectedAnswers[qIdx] === oIdx
                                                    ? 'bg-indigo-600 text-white shadow-lg'
                                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            {String.fromCharCode(65 + oIdx)}. {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
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
