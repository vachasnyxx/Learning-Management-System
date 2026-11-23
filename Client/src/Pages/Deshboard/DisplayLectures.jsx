import { useEffect, useMemo, useState } from "react";
import { BsCheckCircleFill, BsCircle, BsFileEarmarkPdf } from "react-icons/bs";
import { MdAutoDelete } from "react-icons/md";
import { FaGraduationCap, FaMagic } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import CourseThumbnail from "../../Compontents/CourseThumbnail";
import HomeLayout from "../../Layouts/HomeLayout";
import { deleteCourseLecture, getCourseLectures } from "../../Redux/Slices/LectureSlice";

function Displaylectures(){
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { lectures, modules, quiz, course } = useSelector((state) => state.lecture);
    const { role, data } = useSelector((state) => state.auth);

    const [currentVideo, setCurrentVideo] = useState(0);
    const [completed, setCompleted] = useState(new Set());

    const courseId = state?._id || course?._id;
    const courseInfo = state || course;

    // Load completed lectures from localStorage
    useEffect(() => {
        if (!courseId) return;
        try {
            const stored = JSON.parse(localStorage.getItem(`completed_${courseId}`) || "[]");
            setCompleted(new Set(stored));
        } catch (e) {
            setCompleted(new Set());
        }
    }, [courseId]);

    useEffect(() => {
        if (!state) navigate("/courses");
        else dispatch(getCourseLectures(state._id));
    }, []);

    async function onLectureDelete(courseId, lectureId) {
        if (window.confirm("Are you sure you want to delete the Lecture?")) {
            await dispatch(deleteCourseLecture({ courseId, lectureId }));
            await dispatch(getCourseLectures(courseId));
        }
    }

    function toggleComplete(lectureId) {
        setCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(lectureId)) next.delete(lectureId);
            else next.add(lectureId);
            try {
                localStorage.setItem(`completed_${courseId}`, JSON.stringify([...next]));
            } catch (e) {}
            return next;
        });
    }

    const total = lectures?.length || 0;
    const done = completed.size;
    const allDone = total > 0 && done === total;

    const hasQuiz = Boolean(quiz && (quiz.total > 0 || quiz.questions?.length > 0));
    const quizPassed = (() => {
        try {
            return localStorage.getItem(`quiz_passed_${courseId}`) === "true";
        } catch (e) {
            return false;
        }
    })();

    const canGetCertificate = allDone && (!hasQuiz || quizPassed);

    const groupedLectures = useMemo(() => {
        const indexed = (lectures || []).map((lecture, index) => ({ lecture, index }));
        const moduleIds = new Set((modules || []).map((module) => module._id));

        const groups = (modules || []).map((module) => ({
            module,
            items: indexed.filter(({ lecture }) => lecture.moduleId === module._id),
        }));

        const ungrouped = indexed.filter(
            ({ lecture }) => !lecture.moduleId || !moduleIds.has(lecture.moduleId)
        );

        return { groups, ungrouped };
    }, [lectures, modules]);

    function handleGetCertificate() {
        try {
            const completedCourses = JSON.parse(localStorage.getItem("completedCourses") || "[]");
            if (!completedCourses.find((c) => c._id === courseInfo?._id)) {
                completedCourses.push({
                    _id: courseInfo?._id,
                    title: courseInfo?.title,
                    createdBy: courseInfo?.createdBy,
                    thumbnail: courseInfo?.thumbnail,
                });
                localStorage.setItem("completedCourses", JSON.stringify(completedCourses));
            }
        } catch (e) {}
        navigate("/certificate", { state: { course: courseInfo, user: data } });
    }

    function goToQuiz() {
        navigate(`/course/quiz?id=${courseId}`, { state: { ...courseInfo, _id: courseId } });
    }

    if (!state) return null;

    function renderLectureItem({ lecture, index }) {
        const isDone = completed.has(lecture._id);
        return (
            <li
                key={lecture._id}
                className={`flex items-center justify-between gap-2 p-2 rounded-md transition-all ${currentVideo === index ? "bg-gray-700" : "hover:bg-gray-700/50"}`}
            >
                <div
                    className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    onClick={() => setCurrentVideo(index)}
                >
                    <span className="text-yellow-500 font-bold shrink-0">
                        {index + 1}.
                    </span>
                    <span className="truncate">{lecture?.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => toggleComplete(lecture._id)}
                        title={isDone ? "Mark as incomplete" : "Mark as complete"}
                        className="text-xl"
                    >
                        {isDone ? (
                            <BsCheckCircleFill className="text-green-500" />
                        ) : (
                            <BsCircle className="text-gray-400 hover:text-green-400" />
                        )}
                    </button>
                    {(role === "ADMIN" || role === "TEACHER") && (
                        <button
                            onClick={() => onLectureDelete(courseId, lecture._id)}
                            className="text-red-400 hover:text-red-300 text-xl"
                            title="Delete lecture"
                        >
                            <MdAutoDelete />
                        </button>
                    )}
                </div>
            </li>
        );
    }

    return (
        <HomeLayout>
            <div className="flex flex-col gap-6 items-center justify-center min-h-[90vh] py-8 text-white mx-[5%]">
                {/* Course header */}
                <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 items-center md:items-start bg-gray-800/60 rounded-xl p-6 shadow-[0_0_10px_black]">
                    <CourseThumbnail
                        course={courseInfo}
                        alt="thumbnail"
                        className="w-full md:w-64 h-40 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
                            {courseInfo?.title}
                        </h1>
                        <p className="text-gray-300 text-sm md:text-base line-clamp-3">
                            {courseInfo?.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <span><span className="text-yellow-500 font-semibold">Instructor:</span> {courseInfo?.createdBy}</span>
                            <span><span className="text-yellow-500 font-semibold">Total lectures:</span> {total || courseInfo?.numberOfLectures || 0}</span>
                            <span><span className="text-yellow-500 font-semibold">Modules:</span> {modules?.length || 0}</span>
                        </div>
                        {total > 0 && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span className="text-yellow-500 font-semibold">{done}/{total}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {hasQuiz && (
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${quizPassed ? "bg-green-600/30 text-green-300" : "bg-purple-600/30 text-purple-200"}`}>
                                    {quizPassed ? "✓ Quiz passed" : "Quiz available"}
                                </span>
                            )}
                            {(role === "ADMIN" || role === "TEACHER") && (
                                <button
                                    onClick={() => navigate("/course/modules", { state: { ...courseInfo, _id: courseId } })}
                                    className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full font-semibold"
                                >
                                    <FiSettings /> Manage modules & quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lectures */}
                {total > 0 ? (
                    <div className="flex flex-col md:flex-row justify-center gap-6 w-full max-w-5xl">
                        {/* Video player */}
                        <div className="space-y-4 md:w-1/2 p-4 rounded-lg shadow-[0_0_10px_black] bg-gray-800/40">
                            <video
                                key={lectures?.[currentVideo]?.lecture?.secure_url}
                                src={lectures && lectures[currentVideo]?.lecture?.secure_url}
                                className="object-fill rounded-lg w-full max-h-80 bg-black"
                                controls
                                disablePictureInPicture
                                controlsList="nodownload"
                            ></video>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    <span className="text-yellow-500">Title: </span>
                                    {lectures && lectures[currentVideo]?.title}
                                </h2>
                                <p className="text-sm text-gray-300 mt-1">
                                    <span className="text-yellow-500">Description: </span>
                                    {lectures && lectures[currentVideo]?.description}
                                </p>
                            </div>
                        </div>

                        {/* Lecture list */}
                        <div className="md:w-1/2 p-4 rounded-lg shadow-[0_0_10px_black] bg-gray-800/40 space-y-3">
                            <div className="font-semibold text-xl text-yellow-500 flex items-center justify-between gap-2">
                                <p>Course content</p>
                                {(role === "ADMIN" || role === "TEACHER") && (
                                    <button
                                        onClick={() => navigate("/course/addlecture", { state: { ...courseInfo, _id: courseId } })}
                                        className="btn btn-primary px-2 py-1 rounded-md font-semibold text-sm"
                                    >
                                        Add new lecture
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto pr-1 space-y-4">
                                {groupedLectures.groups.map(({ module, items }) => (
                                    <div key={module._id} className="space-y-2">
                                        <div className="bg-gray-900/60 rounded-md px-3 py-2">
                                            <p className="font-semibold text-yellow-400 text-sm">{module.title}</p>
                                            {module.description && (
                                                <p className="text-xs text-gray-400">{module.description}</p>
                                            )}
                                            {(module.files || []).length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {module.files.map((item) => (
                                                        <a
                                                            key={item._id}
                                                            href={item.file.secure_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 bg-blue-900/30 px-2 py-1 rounded"
                                                        >
                                                            <BsFileEarmarkPdf /> {item.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <ul className="space-y-2">
                                            {items.map(renderLectureItem)}
                                        </ul>
                                    </div>
                                ))}

                                {groupedLectures.ungrouped.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="font-semibold text-gray-300 text-sm px-1">Other lectures</p>
                                        <ul className="space-y-2">
                                            {groupedLectures.ungrouped.map(renderLectureItem)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Quiz + certificate CTA */}
                            <div className="pt-3 border-t border-gray-700 space-y-2">
                                {hasQuiz && (
                                    <button
                                        onClick={goToQuiz}
                                        className={`w-full py-2.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
                                            quizPassed
                                                ? "bg-purple-800/60 hover:bg-purple-700/60 text-purple-100"
                                                : "bg-purple-600 hover:bg-purple-500 text-white"
                                        }`}
                                    >
                                        <FaMagic /> {quizPassed ? "Quiz passed — retake quiz" : "Take the course quiz"}
                                    </button>
                                )}

                                {role !== "ADMIN" && role !== "TEACHER" && (
                                    <button
                                        onClick={handleGetCertificate}
                                        disabled={!canGetCertificate}
                                        className={`w-full py-3 rounded-md font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                                            canGetCertificate
                                                ? "bg-green-600 hover:bg-green-500 text-white"
                                                : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                                        }`}
                                    >
                                        <FaGraduationCap />
                                        {canGetCertificate
                                            ? "Get Your Certificate"
                                            : !allDone
                                                ? `Complete all lectures to unlock (${done}/${total})`
                                                : "Pass the quiz to unlock your certificate"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-10">
                        <p className="text-gray-400 text-lg">
                            {role === "ADMIN" || role === "TEACHER"
                                ? "No lectures added yet."
                                : "No lectures available yet. Check back soon!"}
                        </p>
                        {(role === "ADMIN" || role === "TEACHER") && (
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button
                                    onClick={() => navigate("/course/modules", { state: { ...courseInfo, _id: courseId } })}
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md font-semibold"
                                >
                                    Manage modules
                                </button>
                                <button
                                    onClick={() => navigate("/course/addlecture", { state: { ...courseInfo, _id: courseId } })}
                                    className="btn btn-active btn-primary px-4 py-2 rounded-md font-semibold text-lg"
                                >
                                    Add new lecture
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md font-semibold"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}

export default Displaylectures;
