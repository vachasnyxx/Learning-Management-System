import {model , Schema} from "mongoose";

/**
 * @courseSchema - Mongoose schema for Course.
 * This schema defines the structure and validation rules for course data, including title, description, category, thumbnail, lectures, and metadata.
 */

const moduleFileSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    file: {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
        resource_type: { type: String, default: "raw" },
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: true });

const moduleSchema = new Schema({
    title: {
        type: String,
        required: [true, "Module title is required"],
        trim: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    files: [moduleFileSchema],
}, { _id: true });

const quizQuestionSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        validate: {
            validator: (value) => Array.isArray(value) && value.length === 4,
            message: "Each quiz question must have exactly 4 options",
        },
    },
    correctOption: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },
    explanation: {
        type: String,
        default: "",
    },
}, { _id: false });

const quizSchema = new Schema({
    questions: [quizQuestionSchema],
    passingScore: {
        type: Number,
        default: 60,
        min: 1,
        max: 100,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    source: {
        type: String,
        default: "offline",
    },
}, { _id: false });

const courseSchema = new Schema({
    title:{
        type:String,
        required:[true, "Title is required" ],
        minLength:[8, "Title must be at least 8 characters"],
        maxLength:[60,"Title should be less than 60 characters"],
        trim:true
    },
    description:{
        type: String,
        required:[true, "Description is required" ],
        minLength:[8, "Description must be at least 8 characters"],
        maxLength:[200,"Description should be less than 200 characters"],
        trim:true
    },
    category:{
        type:String,
        required:[true, "Category is required" ],
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    },
    modules: [moduleSchema],
    lectures:[
        {
            title:String,
            description:String,
            moduleId:{
                type: Schema.Types.ObjectId,
                default: null,
            },
            lecture:{
                public_id:{
                    type:String,
                    required:true,
                },
                secure_url:{
                    type:String,
                    required:true,
                }
            }
        }
    ],
    quiz: {
        type: quizSchema,
        default: null,
    },
    numberOfLectures:{
        type:Number,
        default:0,
    },
    createdBy:{
        type:String,
        required:true,
    }

},{
    timestamps:true
})

const Course = model('Course', courseSchema);

export default Course;
