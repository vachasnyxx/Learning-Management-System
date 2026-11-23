import cloudinary from 'cloudinary'
import fs from 'fs/promises'

import asyncHandler from '../middlewares/asyncHAndler.middleware.js';
import Course from "../models/course.model.js"
import User from "../models/usermodel.js"
import AppError from "../utils/error.util.js";
import { generateQuiz } from '../utils/quizGenerator.js';

/**
 * @GET_ALL_COURSES
 * Fetches all courses excluding lectures. Quiz answers are never exposed publicly.
 */
export const getAllCourse = asyncHandler(async (req, res, next)=>{
    try {
        const courses = await Course.find({}).select('-lectures').lean();

        const safeCourses = courses.map((course) => {
            if (course.quiz) {
                course.quiz = {
                    hasQuiz: (course.quiz.questions || []).length > 0,
                    total: (course.quiz.questions || []).length,
                    passingScore: course.quiz.passingScore,
                    generatedAt: course.quiz.generatedAt,
                    source: course.quiz.source,
                };
            } else {
                course.quiz = { hasQuiz: false, total: 0, passingScore: 60 };
            }
            return course;
        });

        res.status(200).json({
            success:true,
            message:'All courses',
            courses: safeCourses,
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
/**
 * @GET_LECTURES_BY_COURSE_ID
 * Fetches lectures, modules and quiz metadata for a specific course.
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next)=>{
    try {
        const {id} = req.params;
        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course not found', 404));
        }

        const hasQuiz = (course.quiz?.questions || []).length > 0;

        res.status(200).json({
            success:true,
            message:'Course lectures fetched successfully',
            lectures: course.lectures,
            modules: course.modules,
            quiz: hasQuiz
                ? {
                    total: course.quiz.questions.length,
                    passingScore: course.quiz.passingScore,
                    generatedAt: course.quiz.generatedAt,
                    source: course.quiz.source,
                }
                : null,
            course: {
                _id: course._id,
                title: course.title,
                description: course.description,
                category: course.category,
                createdBy: course.createdBy,
                thumbnail: course.thumbnail,
                numberOfLectures: course.numberOfLectures,
            },
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
/**
 * @CREATE_COURSE
 * Creates a new course and optionally uploads a thumbnail image.
 */
export const createCourse = asyncHandler(async (req, res, next)=>{
    const {title, description , category, createdBy}= req.body;
    if(!title || !description || !category || !createdBy){
        return next(new AppError('All fields are required', 400));
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'Dummy',
            secure_url: 'Dummy',
        },
    });

    if(!course){
        return next(new AppError('Course could not be created, please try again', 500));
    }

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
            });
            if(result){
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
        } catch (error) {
            return next(new AppError(error.message || 'File not uploaded, please try again', 500));
        }
        await course.save();
    }

    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course,
    });
});
/**
 * @UPDATE_COURSE_BY_ID
 * Updates an existing course by ID.
 */
export const updateCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id}= req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if(!course){
            return next(new AppError('Course with given id does not exist', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
/**
 * @DELETE_COURSE_BY_ID
 * Deletes a course by its ID.
 */
export const removeCourse = asyncHandler(async (req, res, next)=>{
    try {
        const {id }= req.params;
        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('Course with given id does not exist', 404));
        }
        await Course.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Course removed successfully',
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
/**
 * @ADD_LECTURE
 * Adds a lecture (optionally inside a module) and uploads the video to Cloudinary.
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next)=>{
    const { title, description, moduleId } = req.body;
    const {id } = req.params;
    if(!title || !description){
        return next(new AppError('All fields are required', 400));
    }

    const course = await Course.findById(id);
    if(!course){
        return next(new AppError('Course does not exist', 404));
    }

    if (moduleId) {
        const module = course.modules.id(moduleId);
        if (!module) {
            return next(new AppError('The selected module does not exist in this course', 404));
        }
    }

    const lectureData = {
        title,
        description,
        moduleId: moduleId || null,
        lecture: {},
    };

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                chunk_size: 50000000,
                resource_type: 'video',
            });
            if(result){
                lectureData.lecture.public_id = result.public_id;
                lectureData.lecture.secure_url = result.secure_url;
            }
            await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
    } else {
        return next(new AppError('Lecture video is required', 400));
    }

    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lecture added successfully',
        course,
    });
});
/**
 * @REMOVE_LECTURE
 * Removes a lecture from a course by its ID and deletes the video from Cloudinary.
 */
export const removeLecture = asyncHandler(async (req, res, next)=>{
    try {
        const courseId = req.params.courseId;
        const lectureId = req.params.lectureId;
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId
        );
        if (lectureIndex === -1) {
            return next(new AppError('Lecture not found', 404));
        }
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            { resource_type: 'video' }
        ).catch(() => {});
        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures = course.lectures.length;
        await course.save();
        res.status(200).json({
            success: true,
            message: 'Lecture removed successfully',
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/* ------------------------------------------------------------------ */
/*                            MODULES                                  */
/* ------------------------------------------------------------------ */

/**
 * @CREATE_MODULE
 * Creates a new module (chapter) inside a course.
 */
export const createModule = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return next(new AppError('Module title is required', 400));
        }

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        course.modules.push({
            title: title.trim(),
            description: description?.trim() || '',
            order: course.modules.length,
        });

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            modules: course.modules,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPDATE_MODULE
 * Updates a module's title or description.
 */
export const updateModule = asyncHandler(async (req, res, next) => {
    try {
        const { id, moduleId } = req.params;
        const { title, description } = req.body;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return next(new AppError('Module not found', 404));
        }

        if (typeof title === 'string' && title.trim()) module.title = title.trim();
        if (typeof description === 'string') module.description = description.trim();

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Module updated successfully',
            modules: course.modules,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @REMOVE_MODULE
 * Deletes a module, unassigns its lectures and removes its uploaded files.
 */
export const removeModule = asyncHandler(async (req, res, next) => {
    try {
        const { id, moduleId } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return next(new AppError('Module not found', 404));
        }

        // Delete every file that belongs to the module from Cloudinary
        for (const item of module.files || []) {
            await cloudinary.v2.uploader.destroy(
                item.file.public_id,
                { resource_type: item.file.resource_type || 'raw' }
            ).catch(() => {});
        }

        // Lectures stay in the course but are no longer part of a module
        for (const lecture of course.lectures) {
            if (lecture.moduleId && lecture.moduleId.toString() === moduleId.toString()) {
                lecture.moduleId = null;
            }
        }

        course.modules.pull(moduleId);
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Module removed successfully',
            modules: course.modules,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @UPLOAD_MODULE_FILE
 * Uploads a study material file (PDF, PPT, notes, image) to a module.
 */
export const uploadModuleFile = asyncHandler(async (req, res, next) => {
    const { id, moduleId } = req.params;
    const { title } = req.body;

    if (!req.file) {
        return next(new AppError('A file is required', 400));
    }

    const course = await Course.findById(id);
    if (!course) {
        await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
        return next(new AppError('Course not found', 404));
    }

    const module = course.modules.id(moduleId);
    if (!module) {
        await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
        return next(new AppError('Module not found', 404));
    }

    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms/modules',
            resource_type: 'auto',
        });

        module.files.push({
            title: title?.trim() || req.file.originalname,
            file: {
                public_id: result.public_id,
                secure_url: result.secure_url,
                resource_type: result.resource_type || 'raw',
            },
        });

        await course.save();
        await fs.rm(`uploads/${req.file.filename}`).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'Study material uploaded successfully',
            modules: course.modules,
        });
    } catch (error) {
        await fs.rm(`uploads/${req.file.filename}`).catch(() => {});
        return next(new AppError(error.message || 'File upload failed', 500));
    }
});

/**
 * @REMOVE_MODULE_FILE
 * Deletes a study material file from a module.
 */
export const removeModuleFile = asyncHandler(async (req, res, next) => {
    try {
        const { id, moduleId, fileId } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return next(new AppError('Module not found', 404));
        }

        const file = module.files.id(fileId);
        if (!file) {
            return next(new AppError('File not found', 404));
        }

        await cloudinary.v2.uploader.destroy(
            file.file.public_id,
            { resource_type: file.file.resource_type || 'raw' }
        ).catch(() => {});

        module.files.pull(fileId);
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Study material removed successfully',
            modules: course.modules,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ_FULL
 * Teacher/Admin only: returns the quiz WITH correct answers for preview/editing.
 */
export const getCourseQuizFull = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const quiz = course.quiz;
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return next(new AppError('No quiz has been created for this course yet', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Quiz fetched successfully',
            quiz,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GENERATE_QUIZ
 * Generates (or regenerates) a quiz for a course using AI when configured,
 * otherwise using the smart offline generator.
 */
export const generateCourseQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { count, passingScore, difficulty } = req.body;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const { questions, source } = await generateQuiz(course, count, difficulty);

        if (!questions || questions.length === 0) {
            return next(new AppError('Could not generate quiz questions. Please try again.', 500));
        }

        course.quiz = {
            questions,
            passingScore: Math.min(Math.max(Number(passingScore) || 60, 1), 100),
            generatedAt: new Date(),
            source,
        };

        await course.save();

        res.status(200).json({
            success: true,
            message: `Quiz generated successfully using ${source === 'offline' ? 'the smart offline generator' : source}`,
            quiz: course.quiz,
            source,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @GET_QUIZ
 * Returns quiz questions WITHOUT the correct answers so students cannot cheat.
 */
export const getCourseQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const quiz = course.quiz;
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return next(new AppError('No quiz has been created for this course yet', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Quiz fetched successfully',
            quiz: {
                questions: quiz.questions.map((question) => ({
                    question: question.question,
                    options: question.options,
                })),
                total: quiz.questions.length,
                passingScore: quiz.passingScore,
                source: quiz.source,
                generatedAt: quiz.generatedAt,
            },
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});

/**
 * @SUBMIT_QUIZ
 * Grades the submitted answers and returns the score plus explanations.
 */
export const submitCourseQuiz = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return next(new AppError('Answers must be an array of selected options', 400));
        }

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        const quiz = course.quiz;
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return next(new AppError('No quiz has been created for this course yet', 404));
        }

        let correct = 0;

        const review = quiz.questions.map((question, index) => {
            const selected = Number(answers[index]);
            const isCorrect = selected === question.correctOption;
            if (isCorrect) correct += 1;

            return {
                selected: Number.isInteger(selected) ? selected : -1,
                correctOption: question.correctOption,
                isCorrect,
                explanation: question.explanation,
            };
        });

        const total = quiz.questions.length;
        const score = Math.round((correct / total) * 100);
        const passingScore = quiz.passingScore || 60;
        const passed = score >= passingScore;

        // Update the student's leaderboard stats when they pass (only once per course)
        if (passed && req.user?.id) {
            try {
                const student = await User.findById(req.user.id);
                if (student) {
                    const alreadyPassed = (student.passedQuizzes || []).some(
                        (pid) => pid.toString() === req.params.id
                    );
                    if (!alreadyPassed) {
                        student.passedQuizzes.push(req.params.id);
                        student.totalScore = (student.totalScore || 0) + score;
                        await student.save();
                    }
                }
            } catch (e) {
                // leaderboard update is best-effort; never fail the quiz submission
            }
        }

        res.status(200).json({
            success: true,
            message: passed ? 'Congratulations, you passed the quiz!' : 'Quiz submitted. You did not reach the passing score.',
            result: {
                score,
                passed,
                correct,
                total,
                passingScore,
                review,
            },
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
});
