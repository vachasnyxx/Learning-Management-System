import { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import CourseCard from "../../Compontents/CourseCard";
import HomeLayout from "../../Layouts/HomeLayout";
import { getMyCourses } from "../../Redux/Slices/AuthSlice";

function MyCourses() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await dispatch(getMyCourses());
            setCourses(res?.payload?.courses || []);
            setLoading(false);
        })();
    }, [dispatch]);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => navigate(-1)} className="text-2xl text-yellow-500 hover:text-yellow-400">
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">My Courses</h1>
                            <p className="text-gray-300 text-sm">Courses you have enrolled in.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-300 py-10">Loading your courses...</div>
                    ) : courses.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 space-y-4">
                            <p>You haven't enrolled in any courses yet.</p>
                            <button
                                onClick={() => navigate("/courses")}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-md"
                            >
                                Browse courses
                            </button>
                        </div>
                    ) : (
                        <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-8">
                            {courses.map((course) => (
                                <CourseCard key={course._id} data={course} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default MyCourses;
