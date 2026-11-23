import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";
import asyncHandler from "../middlewares/asyncHAndler.middleware.js";
import User from "../models/usermodel.js";
import AppError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
};

/**
 * @REGISTER - Registers a new user
 */
export const register = asyncHandler(async (req, res, next) => {
    const { fullName, email, password } = req.body;
    // Public registration is only for students. Teacher/Admin accounts are
    // created or promoted by an administrator through the admin panel.
    const userRole = 'USER';
    if (!fullName || !email || !password) {
        return next(new AppError("All fields are required", 400));
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError("Email already exists", 409));
    }

    const avatarData = {
        public_id: email,
        secure_url: "https://cloudinary.com",
    };

    if (req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                width: 250,
                height: 250,
                gravity: "faces",
                crop: "fill",
            });
            if (result) {
                avatarData.public_id = result.public_id;
                avatarData.secure_url = result.secure_url;
                await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
            }
        } catch (e) {
            return next(new AppError(e.message || "File not uploaded, please try again", 500));
        }
    }

    const user = await User.create({
        fullName,
        email,
        password,
        role: userRole,
        avatar: avatarData,
    });

    if (!user) {
        return next(new AppError("User registration failed, please try again", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user,
    });
});

/**
 * @LOGIN - Logs in an existing user
 */
export const login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError("Email and Password are required", 400));
        }

        const user = await User.findOne({ email }).select("+password");

        if (!(user && (await user.comparePassword(password)))) {
            return next(new AppError("Email or password does not match", 400));
        }

        if (user.isBlocked) {
            return next(new AppError("Your account has been blocked. Please contact an administrator.", 403));
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
});

/**
 * @LOGOUT - Logs out the user by clearing the token cookie
 */
export const logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", null, {
        secure: false,
        sameSite: "lax",
        maxAge: 0,
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
});

/**
 * @LOGGED_IN_USER_DETAILS - Fetches details of the logged-in user
 */
export const getProfile = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            message: "User details",
            user,
        });
    } catch (e) {
        return next(new AppError("Failed to fetch profile", 500));
    }
});

/**
 * @FORGOT_PASSWORD - Sends a password reset token to the user's email
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError("Email is required", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("Email not registered", 400));
    }
    const resetToken = await user.generatePasswordResetToken();
    await user.save();
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const subject = "Reset Password";
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
        });
    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message, 500));
    }
});

/**
 * @RESET_PASSWORD - Resets the password using a valid token
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;
    const forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError("Token is invalid or expired, please try again", 400));
    }
    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

/**
 * @CHANGE_PASSWORD - Changes the current password for the logged-in user
 */
export const changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) {
        return next(new AppError("All fields are mandatory", 400));
    }
    const user = await User.findById(id).select("+password");
    if (!user) {
        return next(new AppError("User does not exist", 400));
    }
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
        return next(new AppError("Invalid old password", 400));
    }
    user.password = newPassword;
    await user.save();
    user.password = undefined;
    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

/**
 * @UPDATE_USER - Updates the user details (name and avatar)
 */
export const updateUser = asyncHandler(async (req, res, next) => {
    const { fullName } = req.body;
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User does not exist", 400));
    }
    if (fullName) {
        user.fullName = fullName;
    }
    if (req.file) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id).catch(() => {});
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
                width: 250,
                height: 250,
                gravity: "faces",
                crop: "fill",
            });
            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
                await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
            }
        } catch (e) {
            return next(new AppError(e.message || "File not uploaded, please try again", 500));
        }
    }
    await user.save();
    res.status(200).json({
        success: true,
        message: "User details updated successfully",
    });
});

/**
 * @GET_ALL_USERS - Admin only: list all users
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: "All users fetched successfully",
        users,
    });
});

/**
 * @UPDATE_USER_ROLE - Admin only: change a user's role
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["USER", "TEACHER", "ADMIN"].includes(role)) {
        return next(new AppError("Invalid role", 400));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Prevent an admin from demoting themselves
    if (req.user.id === id && role !== "ADMIN") {
        return next(new AppError("You cannot change your own admin role", 400));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user,
    });
});

/**
 * @TOGGLE_BLOCK_USER - Admin only: block or unblock a user
 */
export const toggleBlockUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (req.user.id === id) {
        return next(new AppError("You cannot block your own account", 400));
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
        success: true,
        message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
        user,
    });
});

/**
 * @COMPLETE_COURSE - Student: marks a course as completed (certificate earned)
 */
export const completeCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    if (!courseId) {
        return next(new AppError("Course ID is required", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const already = (user.completedCourses || []).some((id) => id.toString() === courseId.toString());
    if (!already) {
        user.completedCourses.push(courseId);
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: already ? "Course already completed" : "Course marked as completed",
        completedCourses: user.completedCourses,
    });
});

/**
 * @GET_LEADERBOARD - Top students by completed courses and quiz score
 */
export const getLeaderboard = asyncHandler(async (req, res, next) => {
    const users = await User.find({ role: "USER" })
        .select("fullName avatar completedCourses totalScore")
        .sort({ totalScore: -1 })
        .limit(20)
        .lean();

    const ranked = users
        .map((u) => ({
            _id: u._id,
            fullName: u.fullName,
            avatar: u.avatar,
            completedCount: (u.completedCourses || []).length,
            totalScore: u.totalScore || 0,
        }))
        .sort((a, b) => {
            if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
            return b.totalScore - a.totalScore;
        })
        .slice(0, 10)
        .map((u, index) => ({ ...u, rank: index + 1 }));

    res.status(200).json({
        success: true,
        message: "Leaderboard fetched successfully",
        leaderboard: ranked,
    });
});

/**
 * @ENROLL_COURSE - Student: enroll in a course
 */
export const enrollCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.body;
    if (!courseId) {
        return next(new AppError("Course ID is required", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const already = (user.enrolledCourses || []).some((id) => id.toString() === courseId.toString());
    if (!already) {
        user.enrolledCourses.push(courseId);
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: already ? "Already enrolled in this course" : "Enrolled successfully",
        enrolledCourses: user.enrolledCourses,
    });
});

/**
 * @GET_MY_COURSES - Student: list enrolled courses
 */
export const getMyCourses = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Enrolled courses fetched successfully",
        courses: user.enrolledCourses || [],
    });
});
