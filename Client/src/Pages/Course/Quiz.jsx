import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { FaGraduationCap, FaRedo, FaTrophy } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import {
    getCourseLectures,
    getCourseQuiz,
    resetQuizResult,
    submitCourseQuiz,
} from "../../Redux/Slices/LectureSlice";

function Quiz() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const [searchParams] = useSearchParams();

    const { quiz, quizResult, course } = useSelector((state) => state.lecture);
    const userData = useSelector((state) => state.auth?.data);

    const courseId = state?._id || searchParams.get("id");
    const courseTitle = state?.title || course?.title || "Course";

    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!courseId) {
            navigate("/courses");
            return;
        }
        dispatch(resetQuizResult());

        async function load() {
            setLoading(true);
            if (!state?.title) {
                await dispatch(getCourseLectures(courseId));
            }
            await dispatch(getCourseQuiz(courseId));
            setLoading(false);
        }

        load();
    }, [courseId]);

    const questions = quiz?.questions || [];
    const answeredCount = Object.keys(answers).length;

    const allAnswered = useMemo(
        () => questions.length > 0 && answeredCount === questions.length,
        [answeredCount, questions.length]
    );

    async function handleSubmit(e) {
        e.preventDefault();
        if (!allAnswered) {
            toast.error("Please answer all the questions before submitting");
            return;
        }

        const orderedAnswers = questions.map((_, index) => answers[index] ?? -1);

        setSubmitting(true);
        const response = await dispatch(submitCourseQuiz({ courseId, answers: orderedAnswers }));
        setSubmitting(false);

        if (response?.payload?.result?.passed) {
            try {
                localStorage.setItem(`quiz_passed_${courseId}`, "true");
            } catch {
                // ignore storage errors
            }
        }
    }

    function retryQuiz() {
        dispatch(resetQuizResult());
        setAnswers({});
    }

    function goToCertificate() {
        try {
            const completedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]");
            const courseInfo = state || course;
            if (courseInfo && !completedCourses.find((item) => item._id === courseInfo._id)) {
                completedCourses.push({
                    _id: courseInfo._id,
                    title: courseInfo.title,
                    createdBy: courseInfo.createdBy,
                    thumbnail: courseInfo.thumbnail,
                });
                localStorage.setItem("completedCourses", JSON.stringify(completedCourses));
            }
        } catch {
            // ignore storage errors
        }
        navigate("/certificate", { state: { course: state || course, user: userData } });
    }

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-2xl text-yellow-500 hover:text-yellow-400"
                            title="Go back"
                        >
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Course Quiz</h1>
                            <p className="text-gray-300 text-sm sm:text-base">{courseTitle}</p>
                        </div>
                    </div>

                    {loading && (
                        <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-8 text-center text-gray-300">
                            Loading quiz...
                        </div>
                    )}

                    {!loading && questions.length === 0 && !quizResult && (
                        <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-8 text-center space-y-3">
                            <p className="text-gray-300">
                                No quiz is available for this course yet. Ask your teacher to generate one.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-md"
                            >
                                Go back
                            </button>
                        </div>
                    )}

                    {!loading && quizResult && (
                        <div className="space-y-6">
                            <div
                                className={`rounded-xl p-6 text-center border ${
                                    quizResult.passed
                                        ? "bg-green-900/40 border-green-600"
                                        : "bg-red-900/30 border-red-600"
                                }`}
                            >
                                <div className="text-5xl mb-3 flex justify-center">
                                    {quizResult.passed ? (
                                        <FaTrophy className="text-yellow-400" />
                                    ) : (
                                        <BsXCircleFill className="text-red-400" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold">
                                    {quizResult.passed ? "Quiz Passed!" : "Quiz Not Passed"}
                                </h2>
                                <p className="text-4xl font-extrabold mt-2">{quizResult.score}%</p>
                                <p className="text-sm text-gray-200 mt-1">
                                    {quizResult.correct} / {quizResult.total} correct • passing score {quizResult.passingScore}%
                                </p>
                                {quizResult.passed ? (
                                    <p className="text-sm text-green-300 mt-2">
                                        You can now unlock your certificate after completing all lectures.
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-200 mt-2">
                                        Review the explanations below and try again.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, index) => {
                                    const review = quizResult.review?.[index];
                                    return (
                                        <div key={index} className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 space-y-2">
                                            <p className="font-semibold">
                                                {index + 1}. {question.question}
                                            </p>
                                            <ul className="space-y-1 text-sm">
                                                {question.options.map((option, optionIndex) => {
                                                    const isCorrect = review?.correctOption === optionIndex;
                                                    const isSelected = review?.selected === optionIndex;
                                                    return (
                                                        <li
                                                            key={optionIndex}
                                                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${
                                                                isCorrect
                                                                    ? "bg-green-900/50 text-green-300"
                                                                    : isSelected
                                                                        ? "bg-red-900/40 text-red-300"
                                                                        : "text-gray-300"
                                                            }`}
                                                        >
                                                            {isCorrect ? (
                                                                <BsCheckCircleFill />
                                                            ) : isSelected ? (
                                                                <BsXCircleFill />
                                                            ) : (
                                                                <span className="w-4" />
                                                            )}
                                                            {String.fromCharCode(65 + optionIndex)}. {option}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {review?.explanation && (
                                                <p className="text-xs text-gray-400 italic">{review.explanation}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={retryQuiz}
                                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-md"
                                >
                                    <FaRedo /> Try again
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md font-semibold"
                                >
                                    Back to course
                                </button>
                                {quizResult.passed && (
                                    <button
                                        onClick={goToCertificate}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-semibold"
                                    >
                                        <FaGraduationCap /> Get certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!loading && !quizResult && questions.length > 0 && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex items-center justify-between text-sm text-gray-300">
                                <span>{questions.length} questions</span>
                                <span>
                                    Answered {answeredCount}/{questions.length}
                                </span>
                            </div>

                            {questions.map((question, index) => (
                                <div key={index} className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 space-y-3">
                                    <p className="font-semibold">
                                        {index + 1}. {question.question}
                                    </p>
                                    <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => (
                                            <label
                                                key={optionIndex}
                                                className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer border transition-all ${
                                                    answers[index] === optionIndex
                                                        ? "border-yellow-500 bg-yellow-500/10"
                                                        : "border-gray-700 hover:border-gray-500"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    checked={answers[index] === optionIndex}
                                                    onChange={() => setAnswers({ ...answers, [index]: optionIndex })}
                                                    className="accent-yellow-500"
                                                />
                                                <span>
                                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={submitting || !allAnswered}
                                className={`w-full py-3 rounded-md font-semibold text-lg transition-all ${
                                    submitting || !allAnswered
                                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                        : "bg-yellow-500 hover:bg-yellow-400 text-black"
                                }`}
                            >
                                {submitting ? "Submitting..." : "Submit quiz"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default Quiz;
