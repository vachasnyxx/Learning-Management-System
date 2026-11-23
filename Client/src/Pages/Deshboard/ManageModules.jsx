import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsFileEarmarkPdf, BsFolderPlus, BsTrash, BsUpload } from "react-icons/bs";
import { FaMagic, FaPlayCircle } from "react-icons/fa";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import {
    createCourseModule,
    deleteCourseModule,
    deleteModuleFile,
    generateCourseQuiz,
    getCourseLectures,
    getCourseQuizFull,
    updateCourseModule,
    uploadModuleFile,
} from "../../Redux/Slices/LectureSlice";

function ManageModules() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();

    const { modules, lectures, quiz, quizPreview, course } = useSelector((state) => state.lecture);

    const courseId = state?._id || course?._id;

    const [newModule, setNewModule] = useState({ title: "", description: "" });
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ title: "", description: "" });
    const [fileInputs, setFileInputs] = useState({});
    const [quizForm, setQuizForm] = useState({ count: 5, passingScore: 60, difficulty: "medium" });
    const [generating, setGenerating] = useState(false);

    const previewQuiz = quizPreview || (quiz?.questions?.length ? quiz : null);

    useEffect(() => {
        if (!courseId) {
            navigate("/admin/deshboard");
            return;
        }
        dispatch(getCourseLectures(courseId));
        dispatch(getCourseQuizFull(courseId));
    }, [courseId]);

    const lectureCountByModule = useMemo(() => {
        const counts = {};
        (lectures || []).forEach((lecture) => {
            if (lecture.moduleId) {
                counts[lecture.moduleId] = (counts[lecture.moduleId] || 0) + 1;
            }
        });
        return counts;
    }, [lectures]);

    async function handleCreateModule(e) {
        e.preventDefault();
        if (!newModule.title.trim()) {
            toast.error("Please enter a module title");
            return;
        }
        const response = await dispatch(createCourseModule({
            courseId,
            title: newModule.title,
            description: newModule.description,
        }));
        if (response?.payload?.success) {
            setNewModule({ title: "", description: "" });
        }
    }

    function startEditing(module) {
        setEditingId(module._id);
        setEditValues({ title: module.title, description: module.description || "" });
    }

    async function saveEdit(moduleId) {
        if (!editValues.title.trim()) {
            toast.error("Module title cannot be empty");
            return;
        }
        const response = await dispatch(updateCourseModule({
            courseId,
            moduleId,
            title: editValues.title,
            description: editValues.description,
        }));
        if (response?.payload?.success) {
            setEditingId(null);
        }
    }

    async function handleDeleteModule(moduleId) {
        if (!window.confirm("Delete this module? Lectures inside it will be kept but unassigned, and its files will be removed.")) {
            return;
        }
        await dispatch(deleteCourseModule({ courseId, moduleId }));
    }

    async function handleFileUpload(moduleId) {
        const entry = fileInputs[moduleId];
        if (!entry?.file) {
            toast.error("Please choose a file to upload");
            return;
        }
        const response = await dispatch(uploadModuleFile({
            courseId,
            moduleId,
            title: entry.title || entry.file.name,
            file: entry.file,
        }));
        if (response?.payload?.success) {
            setFileInputs((prev) => ({ ...prev, [moduleId]: { title: "", file: null } }));
        }
    }

    async function handleGenerateQuiz() {
        if (quiz?.questions?.length && !window.confirm("A quiz already exists. Regenerate it and replace the current questions?")) {
            return;
        }
        setGenerating(true);
        try {
            await dispatch(generateCourseQuiz({ courseId, ...quizForm }));
        } finally {
            setGenerating(false);
        }
    }

    const courseTitle = state?.title || course?.title || "Course";

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                {/* Header */}
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-2xl text-yellow-500 hover:text-yellow-400"
                            title="Go back"
                        >
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">
                                Manage Modules
                            </h1>
                            <p className="text-gray-300 text-sm sm:text-base">{courseTitle}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/course/displaylecture", { state: { ...state, _id: courseId } })}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 transition-all px-4 py-2 rounded-md font-semibold"
                        >
                            <FaPlayCircle /> View course
                        </button>
                        <button
                            onClick={() => navigate("/course/addlecture", { state: { ...state, _id: courseId } })}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black transition-all px-4 py-2 rounded-md font-semibold"
                        >
                            Add lecture
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                    {/* Modules column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create module */}
                        <form
                            onSubmit={handleCreateModule}
                            className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 space-y-3"
                        >
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <BsFolderPlus className="text-yellow-500" /> Create a new module
                            </h2>
                            <input
                                type="text"
                                placeholder="Module title (e.g. Module 1: Introduction)"
                                value={newModule.title}
                                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500"
                            />
                            <textarea
                                placeholder="Short description (optional)"
                                value={newModule.description}
                                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 h-20 resize-none focus:outline-none focus:border-yellow-500"
                            />
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-md transition-all"
                            >
                                Add module
                            </button>
                        </form>

                        {/* Module list */}
                        {modules?.length === 0 && (
                            <div className="bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-8 text-center text-gray-400">
                                No modules yet. Create your first module above.
                            </div>
                        )}

                        {modules?.map((module, index) => (
                            <div
                                key={module._id}
                                className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 space-y-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {editingId === module._id ? (
                                            <div className="space-y-2">
                                                <input
                                                    value={editValues.title}
                                                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:border-yellow-500"
                                                />
                                                <textarea
                                                    value={editValues.description}
                                                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 h-16 resize-none focus:outline-none focus:border-yellow-500"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-lg font-bold text-yellow-400">
                                                    Module {index + 1}: {module.title}
                                                </h3>
                                                <p className="text-sm text-gray-300">
                                                    {module.description || "No description"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {lectureCountByModule[module._id] || 0} lecture(s) • {(module.files || []).length} file(s)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {editingId === module._id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEdit(module._id)}
                                                    className="text-green-400 hover:text-green-300 text-xl"
                                                    title="Save"
                                                >
                                                    <FiSave />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-400 hover:text-gray-300 text-xl"
                                                    title="Cancel"
                                                >
                                                    <FiX />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEditing(module)}
                                                    className="text-yellow-400 hover:text-yellow-300 text-xl"
                                                    title="Edit module"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModule(module._id)}
                                                    className="text-red-400 hover:text-red-300 text-xl"
                                                    title="Delete module"
                                                >
                                                    <BsTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => navigate("/course/addlecture", { state: { ...state, _id: courseId, moduleId: module._id } })}
                                        className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-all"
                                    >
                                        + Add lecture to this module
                                    </button>
                                </div>

                                {/* Study material */}
                                <div className="border-t border-gray-700 pt-3 space-y-2">
                                    <p className="text-sm font-semibold text-gray-200">Study material</p>

                                    {(module.files || []).length === 0 && (
                                        <p className="text-xs text-gray-400">No files uploaded yet.</p>
                                    )}

                                    {(module.files || []).map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between gap-2 bg-gray-900/70 rounded-md px-3 py-2"
                                        >
                                            <a
                                                href={item.file.secure_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 truncate"
                                            >
                                                <BsFileEarmarkPdf /> {item.title}
                                            </a>
                                            <button
                                                onClick={() => dispatch(deleteModuleFile({ courseId, moduleId: module._id, fileId: item._id }))}
                                                className="text-red-400 hover:text-red-300 shrink-0"
                                                title="Delete file"
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            placeholder="File title (optional)"
                                            value={fileInputs[module._id]?.title || ""}
                                            onChange={(e) => setFileInputs((prev) => ({
                                                ...prev,
                                                [module._id]: { ...(prev[module._id] || {}), title: e.target.value },
                                            }))}
                                            className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-500"
                                        />
                                        <input
                                            type="file"
                                            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
                                            onChange={(e) => setFileInputs((prev) => ({
                                                ...prev,
                                                [module._id]: { ...(prev[module._id] || {}), file: e.target.files[0] },
                                            }))}
                                            className="text-sm text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-700 file:text-white"
                                        />
                                        <button
                                            onClick={() => handleFileUpload(module._id)}
                                            className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-sm font-semibold"
                                        >
                                            <BsUpload /> Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quiz column */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-b from-purple-900/60 to-gray-800/70 border border-purple-700/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FaMagic className="text-purple-300" /> AI Quiz Generator
                            </h2>
                            <p className="text-xs text-gray-300">
                                Creates a quiz from this course's modules and lectures. Works offline, and
                                automatically uses Gemini or OpenAI when an API key is configured.
                            </p>

                            <label className="block text-sm">
                                Number of questions
                                <select
                                    value={quizForm.count}
                                    onChange={(e) => setQuizForm({ ...quizForm, count: Number(e.target.value) })}
                                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2"
                                >
                                    <option value={5}>5 questions</option>
                                    <option value={8}>8 questions</option>
                                    <option value={10}>10 questions</option>
                                </select>
                            </label>

                            <label className="block text-sm">
                                Difficulty
                                <select
                                    value={quizForm.difficulty}
                                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </label>

                            <label className="block text-sm">
                                Passing score (%)
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={quizForm.passingScore}
                                    onChange={(e) => setQuizForm({ ...quizForm, passingScore: Number(e.target.value) })}
                                    className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2"
                                />
                            </label>

                            <button
                                onClick={handleGenerateQuiz}
                                disabled={generating}
                                className={`w-full py-2.5 rounded-md font-semibold transition-all ${
                                    generating
                                        ? "bg-gray-600 cursor-wait"
                                        : "bg-purple-600 hover:bg-purple-500"
                                }`}
                            >
                                {generating ? "Generating..." : (quiz?.total > 0 || quiz?.questions?.length) ? "Regenerate quiz" : "Generate quiz"}
                            </button>

                            {quiz?.total > 0 || quiz?.questions?.length > 0 ? (
                                <p className="text-xs text-green-400">
                                    {quiz?.total || quiz?.questions?.length} questions ready • passing score {quiz.passingScore || 60}% • source: {quiz.source || "offline"}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400">No quiz generated yet.</p>
                            )}
                        </div>

                        {previewQuiz?.questions?.length > 0 && (
                            <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-5 space-y-4 max-h-[36rem] overflow-y-auto">
                                <h3 className="text-lg font-semibold text-yellow-400">Quiz preview</h3>
                                {previewQuiz.questions.map((question, index) => (
                                    <div key={index} className="space-y-1 border-b border-gray-700 pb-3 last:border-0">
                                        <p className="font-semibold text-sm">
                                            {index + 1}. {question.question}
                                        </p>
                                        <ul className="text-xs space-y-1">
                                            {question.options.map((option, optionIndex) => (
                                                <li
                                                    key={optionIndex}
                                                    className={
                                                        optionIndex === question.correctOption
                                                            ? "text-green-400 font-semibold"
                                                            : "text-gray-300"
                                                    }
                                                >
                                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                                    {optionIndex === question.correctOption ? " ✓" : ""}
                                                </li>
                                            ))}
                                        </ul>
                                        {question.explanation && (
                                            <p className="text-xs text-gray-400 italic">{question.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default ManageModules;
