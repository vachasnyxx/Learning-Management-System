import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getAllCourse } from "../../Redux/Slices/CourseSlice";

function Resources() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const courses = useSelector((state) => state?.course?.courseData);
    const role = useSelector((state) => state?.auth?.role);
    const data = useSelector((state) => state?.auth?.data);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await dispatch(getAllCourse());
            setLoading(false);
        })();
    }, [dispatch]);

    const isSubscribed = role === "ADMIN" || role === "TEACHER" || data?.subscription?.status === "active";

    // Flatten course -> module -> file
    const groups = (courses || [])
        .map((course) => {
            const files = (course.modules || []).flatMap((module) =>
                (module.files || []).map((file) => ({
                    ...file,
                    moduleTitle: module.title,
                }))
            );
            return { course, files };
        })
        .filter((g) => g.files.length > 0);

    const totalFiles = groups.reduce((sum, g) => sum + g.files.length, 0);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => navigate(-1)} className="text-2xl text-yellow-500 hover:text-yellow-400">
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Resources</h1>
                            <p className="text-gray-300 text-sm">
                                Downloadable study material (notes, slides, worksheets) from all courses.
                            </p>
                        </div>
                    </div>

                    {!isSubscribed && role === "USER" && (
                        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 mb-6 text-sm text-yellow-200">
                            Subscribe to unlock and download study material from premium courses.
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-gray-300 py-10">Loading resources...</div>
                    ) : totalFiles === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            No study material has been uploaded yet. Check back soon!
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groups.map(({ course, files }) => (
                                <div key={course._id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-5">
                                    <h2 className="text-lg font-bold text-yellow-400 mb-3">{course.title}</h2>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {files.map((file) => (
                                            <a
                                                key={file._id}
                                                href={isSubscribed ? file.file.secure_url : "#"}
                                                target={isSubscribed ? "_blank" : undefined}
                                                rel="noreferrer"
                                                onClick={(e) => {
                                                    if (!isSubscribed) {
                                                        e.preventDefault();
                                                        navigate("/checkout");
                                                    }
                                                }}
                                                className={`flex items-center gap-3 bg-gray-900/70 rounded-md px-3 py-2 transition-all ${
                                                    isSubscribed
                                                        ? "hover:bg-gray-700/70 cursor-pointer"
                                                        : "opacity-60 cursor-not-allowed"
                                                }`}
                                            >
                                                <BsFileEarmarkPdf className="text-2xl text-blue-300 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate">{file.title}</p>
                                                    <p className="text-xs text-gray-400 truncate">{file.moduleTitle}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default Resources;
