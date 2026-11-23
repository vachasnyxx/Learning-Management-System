import {Router} from 'express'

import { getAllCourse, getLecturesByCourseId, createCourse, updateCourse, removeCourse, addLectureToCourseById, removeLecture, createModule, updateModule, removeModule, uploadModuleFile, removeModuleFile, generateCourseQuiz, getCourseQuiz, getCourseQuizFull, submitCourseQuiz } from "../controllers/course.controllers.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();
/**
 * @route GET /courses
 * @description Get all courses
 * @access Public
 */
router.route('/')
    .get(
        getAllCourse
    )
    .post(
            isLoggedIn,
            authorizedRoles('ADMIN','TEACHER'),
            upload.single('thumbnail'),
           createCourse
        );

/* ------------------------------ Modules ------------------------------ */
/**
 * @route POST /courses/:id/modules
 * @description Create a new module inside a course
 * @access Admin, Teacher
 */
router.route('/:id/modules')
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        createModule
    );

/**
 * @route PUT, DELETE /courses/:id/modules/:moduleId
 * @description Update or remove a module
 * @access Admin, Teacher
 */
router.route('/:id/modules/:moduleId')
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        updateModule
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        removeModule
    );

/**
 * @route POST /courses/:id/modules/:moduleId/files
 * @description Upload study material to a module
 * @access Admin, Teacher
 */
router.route('/:id/modules/:moduleId/files')
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        upload.single('file'),
        uploadModuleFile
    );

/**
 * @route DELETE /courses/:id/modules/:moduleId/files/:fileId
 * @description Remove a study material file from a module
 * @access Admin, Teacher
 */
router.route('/:id/modules/:moduleId/files/:fileId')
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        removeModuleFile
    );

/* -------------------------------- Quiz ------------------------------- */
/**
 * @route GET /courses/:id/quiz/full
 * @description Teacher/Admin only: get quiz with correct answers for preview
 * @access Admin, Teacher
 */
router.route('/:id/quiz/full')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        getCourseQuizFull
    );

/**
 * @route GET /courses/:id/quiz
 * @description Get the course quiz (answers hidden)
 * @access Private, authenticated users
 */
router.route('/:id/quiz')
    .get(
        isLoggedIn,
        getCourseQuiz
    );

/**
 * @route POST /courses/:id/quiz/generate
 * @description Generate / regenerate the course quiz
 * @access Admin, Teacher
 */
router.route('/:id/quiz/generate')
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        generateCourseQuiz
    );

/**
 * @route POST /courses/:id/quiz/submit
 * @description Submit quiz answers and receive the score
 * @access Private, authenticated users
 */
router.route('/:id/quiz/submit')
    .post(
        isLoggedIn,
        submitCourseQuiz
    );

/**
 * @route GET, PUT, DELETE /courses/:id
 * @description Get, update, or remove a course by ID
 * @access Admin only
 */
router.route('/:id')
    .get(
        isLoggedIn,
        getLecturesByCourseId
    )
    .put(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeCourse
    )
    .post(
        isLoggedIn,
        authorizedRoles('ADMIN','TEACHER'),
        upload.single('lecture'), 
        addLectureToCourseById
    );
    /**
 * @route DELETE /courses/:courseId/lectures/:lectureId
 * @description Remove a specific lecture from a course
 * @access Admin only
 */
    router.route('/:courseId/lectures/:lectureId') .delete(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        removeLecture,
    )

export default router;
