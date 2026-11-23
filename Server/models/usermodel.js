import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Schema,model } from "mongoose";

import bcrypt from'bcryptjs';
/**
 * @userSchema - Mongoose schema for storing user details, including personal information, password, subscription, and role.
 * The schema also includes methods for password encryption, JWT token generation, and password reset functionality.
 */
const userSchema= new Schema({
    fullName: {
        type:'String',
        required:[true, 'Name is required'],
        minLength:[5, 'Name must be at least 5 characters'],
        maxLength:[50, 'Name should be less than 50 characters'],
        lowercase:true,
        trim:true,
    },
    email:{
        type: 'String',
        required:[true, 'Email is required'],
        lowercase:true,
        trim:true,
        unique:true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
          ],
    },
    password:{
        type: 'String',
        required:[true, 'Password is required'],
        minLength:[8, 'Password must be at least 8 characters'],
        select:false
    },
    subscription: {
        id: String,
        status: String,
     },
    avatar:{
        public_id:{
            type:'String',
        },
        secure_url:{
            type:'String'
        }
    },
    role:{
        type:'String',
        enum:['USER','TEACHER','ADMIN'],
        default:'USER'
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    completedCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    passedQuizzes: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    enrolledCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course',
    }],
    totalScore: {
        type: Number,
        default: 0,
    },
    forgotPasswordToken:String ,
    forgotPasswordExpiry: Date
},{
    timestamps:true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    try {
        this.password= await bcrypt.hash(this.password,10);
        next();
    } catch (err) {
        next(err);
    }
})

userSchema.methods = {
  
    comparePassword: async function (plainPassword) {
      return await bcrypt.compare(plainPassword, this.password);
    },
  
    // Will generate a JWT token with user id as payload
    generateJWTToken: async function () {
      return await jwt.sign(
        { id: this._id, role: this.role, subscription: this.subscription },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY,
        }
      );
    },

    generatePasswordResetToken: async function(){
        const resetToken =crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken=crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
        ;
        this.forgotPasswordExpiry=Date.now() +15*60*1000;//15min

        return resetToken;
    }
}

const User =model('User', userSchema);

export default User;