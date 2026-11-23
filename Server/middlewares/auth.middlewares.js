import jwt from "jsonwebtoken";

import User from '../models/usermodel.js'
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next)=>{
    const {token}= req.cookies;
    if(!token){
        return next(new AppError('Unauthenticated, please login again', 401));
    }
    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        // Check if the account has been blocked by an administrator
        const dbUser = await User.findById(userDetails.id).select('isBlocked role');
        if (!dbUser) {
            return next(new AppError('User no longer exists', 401));
        }
        if (dbUser.isBlocked) {
            return next(new AppError('Your account has been blocked. Please contact an administrator.', 403));
        }
        // Keep the role fresh in case an admin changed it
        req.user = { ...userDetails, role: dbUser.role, isBlocked: dbUser.isBlocked };
        next();
    } catch (e) {
        return next(new AppError('Invalid or expired token, please login again', 401));
    }
};

const authorizedRoles = (...roles) => async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to access this route', 403));
    }
    next();
};

const authorizedSubscriber = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(new AppError('User not found', 404));
        const subscription = user.subscription?.status;
        const currentUserRole = user.role;
        if (currentUserRole !== 'ADMIN' && subscription !== 'active') {
            return next(new AppError('Please subscribe to access this', 403));
        }
        next();
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber,
};