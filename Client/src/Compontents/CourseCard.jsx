import { useNavigate } from "react-router-dom";

import CourseThumbnail from "./CourseThumbnail";

function CourseCard({data}){
    const navigate = useNavigate();

    return(
        <div 
            onClick={()=>navigate("/course/description/", {state:{...data}})}
           className=" text-white w-[20rem] h-[400px] shadow-lg rounded-xl cursor-pointer group overflow-hidden border border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gray-800">
            <div className=" overflow-hidden">
                <CourseThumbnail
                    course={data}
                    className="h-48 w-full rounded-tl-xl rounded-tr-xl group-hover:scale-110 transition-transform duration-500 object-cover"
                />
                <div className=" p-5 space-y-1  text-white">
                    <h2  className=" text-xl font-bold text-yellow-500 line-clamp-2">
                        {data?.title}
                    </h2>
                    <p className=" line-clamp-2">
                        {data?.description}
                    </p>
                    <p className=" font-semibold">
                        <span className=" text-yellow-500  font-bold">Category :</span>
                        {data?.category}
                    </p>
                    <p className=" font-semibold">
                        <span className=" text-yellow-500  font-bold">Instructor :</span>
                        {data?.createdBy}
                    </p>
                </div>
            </div>
        </div>
    );

}
export default CourseCard;
