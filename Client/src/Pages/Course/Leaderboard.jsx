import { useEffect, useState } from "react";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getLeaderboard } from "../../Redux/Slices/AuthSlice";

const RANK_STYLES = {
    1: { color: "#facc15", label: "🥇" },
    2: { color: "#cbd5e1", label: "🥈" },
    3: { color: "#cd7f32", label: "🥉" },
};

function Leaderboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await dispatch(getLeaderboard());
            setRows(res?.payload?.leaderboard || []);
            setLoading(false);
        })();
    }, [dispatch]);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => navigate(-1)} className="text-2xl text-yellow-500 hover:text-yellow-400">
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500 flex items-center gap-2">
                                <FaTrophy /> Leaderboard
                            </h1>
                            <p className="text-gray-300 text-sm">Top students by completed courses and quiz scores.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-300 py-10">Loading leaderboard...</div>
                    ) : rows.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">
                            No students have completed a course yet. Be the first!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rows.map((u) => {
                                const style = RANK_STYLES[u.rank];
                                return (
                                    <div
                                        key={u._id}
                                        className="flex items-center gap-4 bg-gray-800/70 border border-gray-700 rounded-xl p-4"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                                            style={{ backgroundColor: style ? style.color : "#334155", color: "#0b1220" }}
                                        >
                                            {style ? style.label : u.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{u.fullName}</p>
                                            <p className="text-xs text-gray-400">
                                                {u.completedCount} course{u.completedCount === 1 ? "" : "s"} completed
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-yellow-400">{u.totalScore}</p>
                                            <p className="text-xs text-gray-400">quiz points</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Complete courses and pass their quizzes to climb the leaderboard.
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default Leaderboard;
