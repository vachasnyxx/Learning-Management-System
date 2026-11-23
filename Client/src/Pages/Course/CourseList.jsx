import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BiSearch } from "react-icons/bi";

import CourseCard from "../../Compontents/CourseCard";
import HomeLayout from "../../Layouts/HomeLayout";
import { getAllCourse } from "../../Redux/Slices/CourseSlice";

function CourseList() {
    const dispatch = useDispatch();
    const { courseData } = useSelector((state) => state.course);
    const role = useSelector((state) => state.auth?.role);
    const [query, setQuery] = useState("");

    async function loadCourses() {
        await dispatch(getAllCourse());
    }
    useEffect(() => {
        loadCourses();
    }, []);

    const filtered = (courseData || []).filter((c) =>
        c?.title?.toLowerCase().includes(query.toLowerCase()) ||
        c?.category?.toLowerCase().includes(query.toLowerCase()) ||
        c?.createdBy?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <HomeLayout>
            <div className="min-h-[90vh] pt-12 flex flex-col gap-8 text-white px-4">
                <h1 className="text-center text-3xl md:text-4xl font-semibold">
                    Explore courses made by{" "}
                    <span className="font-bold text-yellow-500">Industry experts</span>
                </h1>

                {/* Search */}
                <div className="max-w-xl mx-auto w-full relative">
                    <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, category or instructor..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500 transition-all"
                    />
                </div>

                <div className="grid xl:grid-cols-3 md:grid-cols-2 mx-auto gap-8 grid-cols-1 mb-10">
                    {filtered.map((element) => (
                        <CourseCard key={element._id} data={element} />
                    ))}
                </div>

                {(!courseData || courseData.length === 0) && (
                    <p className="text-center text-gray-400 text-lg">
                        No courses available yet.{" "}
                        {role === "ADMIN" || role === "TEACHER"
                            ? "Create one from the dashboard!"
                            : "Check back soon!"}
                    </p>
                )}
                {courseData && courseData.length > 0 && filtered.length === 0 && (
                    <p className="text-center text-gray-400 text-lg">
                        No courses match "{query}".
                    </p>
                )}
            </div>
        </HomeLayout>
    );
}

export default CourseList;