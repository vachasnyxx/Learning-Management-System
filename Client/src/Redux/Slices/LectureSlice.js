import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState = {
    lectures: [],
    modules: [],
    quiz: null,
    quizPreview: null,
    quizResult: null,
    course: null,
};

/* ------------------------------ Lectures ------------------------------ */

export const getCourseLectures = createAsyncThunk("/course/lecture/get", async (cid) => {
    try {
        const response = axiosInstance.get(`/course/${cid}`);
        toast.promise(response, {
            loading: "Fetching course content",
            success: "Course content fetched successfully",
            error: "Failed to load the course content",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const addCourseLectures = createAsyncThunk("/course/lecture/add", async (data) => {
    try {
        const formData = new FormData();
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description);
        if (data.moduleId) formData.append("moduleId", data.moduleId);

        const response = axiosInstance.post(`/course/${data.id}`, formData);
        toast.promise(response, {
            loading: "Adding course lecture",
            success: "Lecture added successfully",
            error: "Failed to add the lecture",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourseLecture = createAsyncThunk("/course/lecture/delete", async (data) => {
    try {
        const response = axiosInstance.delete(`/course/${data.courseId}/lectures/${data.lectureId}`);
        toast.promise(response, {
            loading: "Deleting course lecture",
            success: "Lecture deleted successfully",
            error: "Failed to delete the lecture",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

/* ------------------------------- Modules ------------------------------ */

export const createCourseModule = createAsyncThunk("/course/module/create", async (data) => {
    try {
        const response = axiosInstance.post(`/course/${data.courseId}/modules`, {
            title: data.title,
            description: data.description,
        });
        toast.promise(response, {
            loading: "Creating module",
            success: "Module created successfully",
            error: "Failed to create the module",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const updateCourseModule = createAsyncThunk("/course/module/update", async (data) => {
    try {
        const response = axiosInstance.put(`/course/${data.courseId}/modules/${data.moduleId}`, {
            title: data.title,
            description: data.description,
        });
        toast.promise(response, {
            loading: "Updating module",
            success: "Module updated successfully",
            error: "Failed to update the module",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourseModule = createAsyncThunk("/course/module/delete", async (data) => {
    try {
        const response = axiosInstance.delete(`/course/${data.courseId}/modules/${data.moduleId}`);
        toast.promise(response, {
            loading: "Deleting module",
            success: "Module deleted successfully",
            error: "Failed to delete the module",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const uploadModuleFile = createAsyncThunk("/course/module/file/upload", async (data) => {
    try {
        const formData = new FormData();
        formData.append("file", data.file);
        if (data.title) formData.append("title", data.title);

        const response = axiosInstance.post(
            `/course/${data.courseId}/modules/${data.moduleId}/files`,
            formData
        );
        toast.promise(response, {
            loading: "Uploading study material",
            success: "Study material uploaded successfully",
            error: "Failed to upload the study material",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteModuleFile = createAsyncThunk("/course/module/file/delete", async (data) => {
    try {
        const response = axiosInstance.delete(
            `/course/${data.courseId}/modules/${data.moduleId}/files/${data.fileId}`
        );
        toast.promise(response, {
            loading: "Deleting study material",
            success: "Study material deleted successfully",
            error: "Failed to delete the study material",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

/* -------------------------------- Quiz -------------------------------- */

export const generateCourseQuiz = createAsyncThunk("/course/quiz/generate", async (data) => {
    try {
        const response = axiosInstance.post(`/course/${data.courseId}/quiz/generate`, {
            count: data.count,
            passingScore: data.passingScore,
            difficulty: data.difficulty,
        });
        toast.promise(response, {
            loading: "Generating quiz with AI",
            success: (res) => res?.data?.message || "Quiz generated successfully",
            error: "Failed to generate the quiz",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getCourseQuiz = createAsyncThunk("/course/quiz/get", async (courseId) => {
    try {
        const response = axiosInstance.get(`/course/${courseId}/quiz`);
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getCourseQuizFull = createAsyncThunk("/course/quiz/getFull", async (courseId) => {
    try {
        const response = axiosInstance.get(`/course/${courseId}/quiz/full`);
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const submitCourseQuiz = createAsyncThunk("/course/quiz/submit", async (data) => {
    try {
        const response = axiosInstance.post(`/course/${data.courseId}/quiz/submit`, {
            answers: data.answers,
        });
        toast.promise(response, {
            loading: "Checking your answers",
            success: (res) => res?.data?.message || "Quiz submitted",
            error: "Failed to submit the quiz",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

const lectureSlice = createSlice({
    name: "lecture",
    initialState,
    reducers: {
        resetQuizResult: (state) => {
            state.quizResult = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCourseLectures.fulfilled, (state, action) => {
                state.lectures = action?.payload?.lectures || [];
                state.modules = action?.payload?.modules || [];
                state.quiz = action?.payload?.quiz || null;
                state.course = action?.payload?.course || null;
            })
            .addCase(addCourseLectures.fulfilled, (state, action) => {
                if (action?.payload?.course) {
                    state.lectures = action?.payload?.course?.lectures || state.lectures;
                    state.modules = action?.payload?.course?.modules || state.modules;
                }
            })
            .addCase(createCourseModule.fulfilled, (state, action) => {
                if (action?.payload?.modules) state.modules = action.payload.modules;
            })
            .addCase(updateCourseModule.fulfilled, (state, action) => {
                if (action?.payload?.modules) state.modules = action.payload.modules;
            })
            .addCase(deleteCourseModule.fulfilled, (state, action) => {
                if (action?.payload?.modules) state.modules = action.payload.modules;
            })
            .addCase(uploadModuleFile.fulfilled, (state, action) => {
                if (action?.payload?.modules) state.modules = action.payload.modules;
            })
            .addCase(deleteModuleFile.fulfilled, (state, action) => {
                if (action?.payload?.modules) state.modules = action.payload.modules;
            })
            .addCase(generateCourseQuiz.fulfilled, (state, action) => {
                if (action?.payload?.quiz) {
                    state.quiz = action.payload.quiz;
                    state.quizPreview = action.payload.quiz;
                    state.quizResult = null;
                }
            })
            .addCase(getCourseQuiz.fulfilled, (state, action) => {
                if (action?.payload?.quiz) state.quiz = action.payload.quiz;
            })
            .addCase(getCourseQuizFull.fulfilled, (state, action) => {
                if (action?.payload?.quiz) state.quizPreview = action.payload.quiz;
            })
            .addCase(submitCourseQuiz.fulfilled, (state, action) => {
                if (action?.payload?.result) state.quizResult = action.payload.result;
            });
    },
});

export const { resetQuizResult } = lectureSlice.actions;
export default lectureSlice.reducer;
