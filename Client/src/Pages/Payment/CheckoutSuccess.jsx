import { useEffect } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { BiBookOpen } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getuserData } from "../../Redux/Slices/AuthSlice";

function CheckoutSuccess(){
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getuserData());
    }, [dispatch])
    return(
        <HomeLayout>
            <div className="min-h-[90vh] flex items-center justify-center text-white px-4">
                    <div className="w-full max-w-md flex flex-col items-center justify-center shadow-[0_0_10px_black] rounded-2xl relative overflow-hidden bg-gray-800">
                        <div className="bg-green-500 w-full text-center py-4 text-2xl font-bold">
                            Payment Successful 🎉
                        </div>

                        <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4 text-center">
                            <AiFillCheckCircle className="text-green-500 text-6xl" />
                            <h2 className="text-xl font-semibold">
                                Welcome to the Pro Bundle
                            </h2>
                            <p className="text-gray-300">
                                You now have access to all courses on the platform for 1 year.
                                Complete any course to earn a certificate.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                                <Link to="/courses" className="flex-1">
                                    <button className="w-full bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 text-black text-lg font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                        <BiBookOpen /> Start Learning
                                    </button>
                                </Link>
                                <Link to="/user/profile" className="flex-1">
                                    <button className="w-full bg-gray-600 hover:bg-gray-500 transition-all ease-in-out duration-300 text-white text-lg font-bold py-3 rounded-lg">
                                        My Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
            </div>
        </HomeLayout>
    )
}
export default CheckoutSuccess;