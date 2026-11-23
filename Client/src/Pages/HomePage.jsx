import { Link } from "react-router-dom";

import homeimg from '../Assets/Images/homePageMainImage.png'
import HomeLayout from "../Layouts/HomeLayout";
import { BsBookHalf, BsPeopleFill, BsTrophyFill, BsAwardFill } from "react-icons/bs";

const features = [
    { icon: <BsBookHalf />, title: "Rich Course Library", desc: "Access a growing catalog of courses taught by industry experts." },
    { icon: <BsPeopleFill />, title: "Expert Instructors", desc: "Learn from highly skilled and qualified faculties." },
    { icon: <BsTrophyFill />, title: "Earn Certificates", desc: "Complete courses and download your certificate of completion." },
    { icon: <BsAwardFill />, title: "Affordable Pricing", desc: "One subscription unlocks every course for a full year." },
];

const stats = [
    { value: "100+", label: "Courses" },
    { value: "50+", label: "Instructors" },
    { value: "10k+", label: "Students" },
    { value: "99%", label: "Satisfaction" },
];

function HomePage() {
    return (
        <HomeLayout>
            {/* Hero */}
            <div className="pt-10 text-white flex flex-col md:flex-row items-center justify-center mx-5 gap-10 lg:mx-16 h-[50rem] sm:h-[90vh]">
                <div className="mt-16 sm:mt-0 flex flex-col justify-center md:w-1/2 space-y-6">
                    <span className="inline-block w-fit bg-yellow-500/20 text-yellow-400 text-sm font-semibold px-4 py-1 rounded-full">
                        🎓 Learn. Grow. Get Certified.
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                        Find the best{" "}
                        <span className="text-yellow-500 font-bold">Online Courses</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200">
                        We have a large library of courses taught by highly skilled and qualified faculties at a very affordable rate.
                    </p>
                    <div className="space-x-4 flex flex-wrap gap-y-3">
                        <Link to="/courses">
                            <button className="bg-yellow-500 px-6 py-3 rounded-md font-semibold text-lg cursor-pointer hover:bg-yellow-600 transition-all ease-in-out duration-300 shadow-lg">
                                Explore courses
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="border border-yellow-500 px-6 py-3 rounded-md font-semibold text-lg cursor-pointer hover:bg-yellow-600 transition-all ease-in-out duration-300">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="lg:w-1/2 flex items-center justify-center">
                    <img src={homeimg} alt="homepage image" className="max-h-[28rem] drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-900/60 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
                    {stats.map((s) => (
                        <div key={s.label} className="space-y-1">
                            <p className="text-3xl md:text-4xl font-bold text-yellow-500">{s.value}</p>
                            <p className="text-gray-300 text-sm md:text-base">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-10">
                    Why choose <span className="text-yellow-500">our LMS</span>?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f) => (
                        <div key={f.title} className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-700 text-center">
                            <div className="text-4xl text-yellow-500 mb-3 flex justify-center">{f.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="py-16 px-6">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl p-10 text-center text-black shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to start learning?</h2>
                    <p className="text-lg mb-6 opacity-90">Join thousands of students already learning on our platform.</p>
                    <div className="space-x-4 flex flex-wrap justify-center gap-y-3">
                        <Link to="/signup">
                            <button className="bg-black text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-gray-800 transition-all">
                                Create free account
                            </button>
                        </Link>
                        <Link to="/courses">
                            <button className="bg-white text-black px-6 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition-all">
                                Browse courses
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default HomePage;