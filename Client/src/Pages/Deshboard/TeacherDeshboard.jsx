import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useEffect } from 'react';
import { Bar } from "react-chartjs-2";
import { BsCollectionPlayFill, BsFolderPlus, BsTrash } from 'react-icons/bs';
import { TiEdit } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import HomeLayout from "../../Layouts/HomeLayout";
import { deleteCourse, getAllCourse } from '../../Redux/Slices/CourseSlice';
import { getPaymentRecord } from '../../Redux/Slices/RazorpaySlice';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TeacherDeshboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const role = useSelector((state) => state?.auth?.role);
    const userData = useSelector((state) => state?.auth?.data);

    const myCourses = useSelector((state) => state?.course?.courseData);

    const teacherName = (userData?.fullName || "").trim().toLowerCase();

    const ownCourses = (myCourses || []).filter((course) => {
        if (!teacherName) return true;
        return (course?.createdBy || "").trim().toLowerCase() === teacherName;
    });

    const coursesToShow = ownCourses.length > 0 ? ownCourses : (myCourses || []);

    const totalLectures = coursesToShow.reduce((sum, course) => sum + (course?.numberOfLectures || 0), 0);
    const quizzesCreated = coursesToShow.filter((course) => course?.quiz?.hasQuiz).length;
    const totalFiles = coursesToShow.reduce(
        (sum, course) => sum + (course?.modules || []).reduce((fileSum, module) => fileSum + (module?.files?.length || 0), 0),
        0
    );

    const chartData = {
        labels: coursesToShow.map((course) => course?.title?.slice(0, 18) || "Course"),
        datasets: [
            {
                label: "Lectures per course",
                data: coursesToShow.map((course) => course?.numberOfLectures || 0),
                backgroundColor: ["#facc15"],
            },
        ],
    };

    async function onCourseDelete(id) {
        if (window.confirm("Are you sure you want to delete this course?")) {
            const res = await dispatch(deleteCourse(id));
            if (res?.payload?.success) {
                await dispatch(getAllCourse());
            }
        }
    }

    useEffect(() => {
        (async () => {
            await dispatch(getAllCourse());
            await dispatch(getPaymentRecord()).catch(() => {});
        })();
    }, []);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] pt-5 flex flex-col flex-wrap gap-10 text-white">
                <h1 className="text-center text-3xl sm:text-5xl font-semibold text-yellow-500">
                    Teacher Dashboard
                </h1>
                <p className="text-center text-gray-300 -mt-6">
                    Welcome back, {userData?.fullName || "Teacher"}! Manage your courses, modules and quizzes here.
                </p>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mx-4 md:mx-10">
                    <div className="flex items-center justify-between p-5 rounded-md shadow-md bg-gray-800/60">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold">My Courses</p>
                            <h3 className="text-4xl font-bold">{coursesToShow.length}</h3>
                        </div>
                        <BsCollectionPlayFill className="text-yellow-500 text-5xl" />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-md shadow-md bg-gray-800/60">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold">Total Lectures</p>
                            <h3 className="text-4xl font-bold">{totalLectures}</h3>
                        </div>
                        <BsCollectionPlayFill className="text-green-500 text-5xl" />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-md shadow-md bg-gray-800/60">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold">Quizzes Created</p>
                            <h3 className="text-4xl font-bold">{quizzesCreated}</h3>
                        </div>
                        <BsFolderPlus className="text-purple-400 text-5xl" />
                    </div>
                    <div className="flex items-center justify-between p-5 rounded-md shadow-md bg-gray-800/60">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold">Study Materials</p>
                            <h3 className="text-4xl font-bold">{totalFiles}</h3>
                        </div>
                        <BsFolderPlus className="text-blue-400 text-5xl" />
                    </div>
                </div>

                {/* Chart */}
                {coursesToShow.length > 0 && (
                    <div className="mx-4 md:mx-10 bg-gray-800/60 rounded-md p-5 shadow-md">
                        <h2 className="text-xl font-semibold mb-3 text-yellow-500">Lectures per course</h2>
                        <div className="h-64">
                            <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                )}

                {/* Courses table */}
                <div className="lg:mx-[10%] w-[80%] self-center flex flex-col items-center justify-center gap-10 mb-10">
                    <div className="flex w-full items-center justify-between">
                        <h1 className="text-center text-2xl sm:text-3xl font-semibold">
                            My Courses
                        </h1>
                        <button
                            onClick={() => navigate("/course/create")}
                            className="w-fit bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 rounded py-2 px-2 sm:px-4 font-semibold sm:text-lg cursor-pointer"
                        >
                            Create new course
                        </button>
                    </div>

                    {coursesToShow.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            You have not created any courses yet. Click "Create new course" to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>S No</th>
                                        <th>Course Title</th>
                                        <th>Category</th>
                                        <th>Lectures</th>
                                        <th>Modules</th>
                                        <th>Quiz</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coursesToShow.map((course, idx) => (
                                        <tr key={course._id}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <textarea
                                                    readOnly
                                                    value={course?.title}
                                                    className="w-full lg:w-40 h-auto bg-transparent resize-none"
                                                />
                                            </td>
                                            <td>{course?.category}</td>
                                            <td>{course?.numberOfLectures}</td>
                                            <td>{course?.modules?.length || 0}</td>
                                            <td>
                                                {course?.quiz?.hasQuiz ? (
                                                    <span className="text-green-400 font-semibold text-sm">
                                                        {course.quiz.total} Qs
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">None</span>
                                                )}
                                            </td>
                                            <td className="flex items-center gap-3 flex-wrap">
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 transition-all ease-in-out duration-300 text-xl py-2 px-3 rounded-md font-bold"
                                                    title="View course"
                                                    onClick={() =>
                                                        navigate("/course/displaylecture", { state: { ...course } })
                                                    }
                                                >
                                                    <BsCollectionPlayFill />
                                                </button>
                                                <button
                                                    className="bg-purple-500 hover:bg-purple-600 transition-all ease-in-out duration-300 text-xl py-2 px-3 rounded-md font-bold"
                                                    title="Manage modules and quiz"
                                                    onClick={() =>
                                                        navigate("/course/modules", { state: { ...course } })
                                                    }
                                                >
                                                    <BsFolderPlus />
                                                </button>
                                                <button
                                                    className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 text-xl py-2 px-3 rounded-md font-bold"
                                                    title="Edit course"
                                                    onClick={() =>
                                                        navigate("/course/edit", { state: { ...course } })
                                                    }
                                                >
                                                    <TiEdit />
                                                </button>
                                                <button
                                                    className="bg-red-500 hover:bg-red-600 transition-all ease-in-out duration-300 text-xl py-2 px-3 rounded-md font-bold"
                                                    title="Delete course"
                                                    onClick={() => onCourseDelete(course?._id)}
                                                >
                                                    <BsTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default TeacherDeshboard;
