import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BsPersonCircle, BsShieldLock, BsTrash } from "react-icons/bs";
import { FaUserShield } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import axiosInstance from "../../Helpers/axiosinstance";

function ManageUsers() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const role = useSelector((state) => state?.auth?.role);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/user/admin/users");
            setUsers(res.data?.users || []);
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (role !== "ADMIN") {
            navigate("/denied");
            return;
        }
        fetchUsers();
    }, [role]);

    async function changeRole(userId, newRole) {
        setUpdating(userId);
        try {
            const res = await axiosInstance.put(`/user/admin/users/${userId}/role`, { role: newRole });
            toast.success(res.data?.message || "Role updated");
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to update role");
        } finally {
            setUpdating(null);
        }
    }

    async function toggleBlock(userId) {
        setUpdating(userId);
        try {
            const res = await axiosInstance.put(`/user/admin/users/${userId}/block`);
            toast.success(res.data?.message || "Updated");
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.data?.user?.isBlocked } : u))
            );
        } catch (e) {
            toast.error(e?.response?.data?.message || "Failed to update block status");
        } finally {
            setUpdating(null);
        }
    }

    return (
        <HomeLayout>
            <div className="min-h-[90vh] text-white px-4 sm:px-8 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => navigate(-1)} className="text-2xl text-yellow-500 hover:text-yellow-400">
                            <AiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-yellow-500 flex items-center gap-2">
                                <FaUserShield /> Manage Users
                            </h1>
                            <p className="text-gray-300 text-sm">
                                Promote students to teachers/admins, or block accounts.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6 text-sm text-blue-200">
                        <strong>Note:</strong> New public signups are always created as <strong>Student (USER)</strong>.
                        Only an administrator can promote a user to Teacher or Admin. Blocking a user immediately
                        prevents them from logging in.
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-300 py-10">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">No users found.</div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className={u.isBlocked ? "opacity-50" : ""}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {u.avatar?.secure_url ? (
                                                        <img src={u.avatar.secure_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <BsPersonCircle className="text-2xl" />
                                                    )}
                                                    <span className="font-semibold">{u.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm">{u.email}</td>
                                            <td>
                                                <select
                                                    value={u.role}
                                                    disabled={updating === u._id}
                                                    onChange={(e) => changeRole(u._id, e.target.value)}
                                                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-sm"
                                                >
                                                    <option value="USER">Student</option>
                                                    <option value="TEACHER">Teacher</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                {u.isBlocked ? (
                                                    <span className="text-red-400 text-xs font-semibold">Blocked</span>
                                                ) : (
                                                    <span className="text-green-400 text-xs font-semibold">Active</span>
                                                )}
                                            </td>
                                            <td className="text-xs text-gray-400">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => toggleBlock(u._id)}
                                                    disabled={updating === u._id}
                                                    className={`text-sm px-3 py-1 rounded-md font-semibold transition-all ${
                                                        u.isBlocked
                                                            ? "bg-green-600 hover:bg-green-500"
                                                            : "bg-red-600 hover:bg-red-500"
                                                    }`}
                                                >
                                                    {u.isBlocked ? "Unblock" : "Block"}
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

export default ManageUsers;
