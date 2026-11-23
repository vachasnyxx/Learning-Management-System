import { useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Footer from "../Compontents/Footer.jsx";
import { logout } from "../Redux/Slices/AuthSlice.js";

function HomeLayout({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // for checking if user is logged in
    const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);

    // for displaying the options according to role
    const role = useSelector((state) => state?.auth?.role);

    const [drawerOpen, setDrawerOpen] = useState(false);

    // Always close the sidebar after navigating to a new page
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    function closeDrawer() {
        setDrawerOpen(false);
    }

    async function handleLogout(e) {
        e.preventDefault();
        closeDrawer();
        await dispatch(logout());
        navigate("/login");
    }

    return (
        <div className="min-h-[90vh]">
            <div className="drawer absolute left-0 z-50 w-fit">
                <input
                    className="drawer-toggle"
                    id="my-drawer"
                    type="checkbox"
                    checked={drawerOpen}
                    onChange={(e) => setDrawerOpen(e.target.checked)}
                />
                <div className="drawer-content">
                    <label htmlFor="my-drawer" className="cursor-pointer relative inline-block" aria-label="Open menu">
                        <FiMenu size={"32px"} className="font-bold text-white m-4" />
                    </label>
                </div>
                <div className="drawer-side" style={{ width: drawerOpen ? "auto" : 0 }}>
                    <label htmlFor="my-drawer" className="drawer-overlay" onClick={closeDrawer}></label>
                    <ul className="menu p-4 w-48 h-full sm:w-80 bg-base-200 text-base-content relative">
                        <li className="w-fit absolute right-2 z-50">
                            <button onClick={closeDrawer} aria-label="Close menu">
                                <AiFillCloseCircle size={24} />
                            </button>
                        </li>
                        <li>
                            <Link to="/" onClick={closeDrawer}>Home</Link>
                        </li>

                        {isLoggedIn && role === "ADMIN" && (
                            <li>
                                <Link to="/admin/deshboard" onClick={closeDrawer}>Admin Dashboard</Link>
                            </li>
                        )}
                        {isLoggedIn && role === "ADMIN" && (
                            <li>
                                <Link to="/admin/users" onClick={closeDrawer}>Manage Users</Link>
                            </li>
                        )}
                        {isLoggedIn && role === "TEACHER" && (
                            <li>
                                <Link to="/teacher/deshboard" onClick={closeDrawer}>Teacher Dashboard</Link>
                            </li>
                        )}
                        {isLoggedIn && (role === "ADMIN" || role === "TEACHER") && (
                            <li>
                                <Link to="/course/create" onClick={closeDrawer}>Create new course</Link>
                            </li>
                        )}
                        <li>
                            <Link to="/courses" onClick={closeDrawer}>All Courses</Link>
                        </li>
                        <li>
                            <Link to="/resources" onClick={closeDrawer}>Resources</Link>
                        </li>
                        <li>
                            <Link to="/leaderboard" onClick={closeDrawer}>Leaderboard</Link>
                        </li>
                        <li>
                            <Link to="/contact" onClick={closeDrawer}>Contact Us</Link>
                        </li>
                        <li>
                            <Link to="/about" onClick={closeDrawer}>About Us</Link>
                        </li>

                        {isLoggedIn && (
                            <li>
                                <Link to="/user/profile" onClick={closeDrawer}>My Profile</Link>
                            </li>
                        )}

                        {!isLoggedIn && (
                            <li className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                                <div className="w-full flex flex-col items-center justify-center gap-2">
                                    <Link
                                        to="/login"
                                        onClick={closeDrawer}
                                        className="bg-blue-500 hover:bg-blue-400 transition-all text-white text-center text-[1rem] px-3 py-2 font-semibold rounded-md w-full"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={closeDrawer}
                                        className="bg-pink-600 hover:bg-pink-500 transition-all text-white text-center text-[1rem] px-3 py-2 font-semibold rounded-md w-full"
                                    >
                                        Signup
                                    </Link>
                                </div>
                            </li>
                        )}

                        {isLoggedIn && (
                            <li className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%]">
                                <div className="w-full flex flex-col items-center justify-center gap-2">
                                    <Link
                                        to="/user/profile"
                                        onClick={closeDrawer}
                                        className="bg-blue-500 hover:bg-blue-400 transition-all text-white text-center text-[1rem] px-3 py-2 font-semibold rounded-md w-full"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-pink-600 hover:bg-pink-500 transition-all text-white text-[1rem] px-3 py-2 font-semibold rounded-md w-full"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {children}

            <Footer />
        </div>
    );
}

export default HomeLayout;
