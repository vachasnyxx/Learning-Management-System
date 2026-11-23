
import toast from "react-hot-toast";
import {useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getuserData } from "../../Redux/Slices/AuthSlice";
import { cancelCourseBundle } from "../../Redux/Slices/RazorpaySlice";

function Profile(){

    const userData = useSelector((state)=>state?.auth?.data);
    const isLoggedIn = useSelector((state)=>state?.auth?.isLoggedIn);
    const dispatch = useDispatch();
    const navigate=useNavigate();
    const [completedCourses, setCompletedCourses] = useState([]);
    useEffect(() => {
        try {
            setCompletedCourses(JSON.parse(localStorage.getItem("completedCourses") || "[]"));
        } catch (e) {
            setCompletedCourses([]);
        }
    }, []);

    // Always refresh the profile details when the page opens
    useEffect(() => {
        if (isLoggedIn) dispatch(getuserData());
    }, [dispatch, isLoggedIn]);

    const roleLabel = userData?.role === "TEACHER"
        ? "Teacher"
        : userData?.role === "ADMIN"
            ? "Admin"
            : "Student";


     async function handleCancelation() {
        if(window.confirm("Are you Sure Want  Cancel Subscription ?")){
            toast("Initiating cancellation..")
            await dispatch(cancelCourseBundle());
            await dispatch(getuserData());
            toast.success("Cancellation completed!");
            navigate("/")
        }  
     }
    return (
        <HomeLayout>
                <div className="min-h-[90vh] flex items-center justify-center">
                    <div className="my-10 flex flex-col gap-4 rounded-lg p-4 text-white w-[80vw] sm:w-96 shadow-[0_0_10px_black]">
                        {userData?.avatar?.secure_url ? (
                            <img
                                className="w-40 h-40 m-auto rounded-full border border-black object-cover"
                                src={userData?.avatar?.secure_url}
                                alt="avatar"
                            />
                        ) : (
                            <div className="w-40 h-40 m-auto rounded-full border border-black bg-gray-700 flex items-center justify-center text-5xl font-bold text-yellow-500">
                                {(userData?.fullName || "U").charAt(0).toUpperCase()}
                            </div>
                        )}
                
                        <h3 className="text-xl font-semibold  text-center capitalize">
                            {userData?.fullName || "Student"}
                        </h3>
                        <div className="grid  grid-cols-2 ">
                            <p>Email: </p><p>{userData?.email}</p>
                            <p>Role: </p><p>{roleLabel}</p>
                            <p>Subscription: </p><p>{userData?.subscription?.status ==="active"?"Active":"Inactive"}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2 ">
                            <Link
                                to='/change-password'
                                className="w-1/2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out  text-center duration-300  rounded-md  font-semibold py-2 cursor-pointer" >
                                        <button>Change password</button>
                            </Link>

                            <Link
                                to='/user/editprofile'
                                className="w-1/2 bg-yellow-600 hover:bg-yellow-500 transition-all ease-in-out duration-300  text-center rounded-md   font-semibold py-2 cursor-pointer" >
                                        <button>Edit Profile</button>
                            </Link>
                        </div>
                        {userData?.subscription?.status ==='active' && (
                            <button onClick={handleCancelation} className="w-full bg-red-600  hover:bg-red-500 transition-all ease-in-out duration-300 rounded-sm  font-semibold py-2 cursor-pointer">
                                Cancel Subscription
                            </button>
                        )}

                        <div className="mt-4 border-t border-gray-600 pt-4">
                            <h3 className="text-lg font-semibold text-yellow-500 mb-2">My Certificates</h3>
                            {completedCourses.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No certificates yet. Complete a course to earn one!
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {completedCourses.map((course) => (
                                        <li key={course._id} className="flex items-center justify-between bg-gray-700 rounded-md px-3 py-2">
                                            <span className="text-sm truncate">{course.title}</span>
                                            <Link
                                                to="/certificate"
                                                state={{ course, user: userData }}
                                                className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                                            >
                                                View
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
        </HomeLayout>
        
        );
}
export default Profile;