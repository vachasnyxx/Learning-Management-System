# EduNest LMS — Complete Project Guide

> **For the viva / project review.** This guide explains how the project was built, what technology we used, the logic behind every module, and how to answer the examiner's questions. Read the part assigned to you and you will be able to explain the whole project confidently.

**Project:** EduNest LMS (Learning Management System)
**Team:** Vachaspati Tiwari (Frontend) & Prerana Anand (Backend)
**Guide:** Mr. Kamlesh Padaliya
**Course:** 5th Semester BCA (Artificial Intelligence & Data Science)
**Institute:** Graphic Era Hill University, Haldwani
**Date:** November 2026

---

## 📌 How to use this guide

- **Part 1 — Vachaspati Tiwari** owns the **Frontend** (React, Redux, UI, routing, components, certificate & quiz UI).
- **Part 2 — Prerana Anand** owns the **Backend** (Node/Express, MongoDB, auth, payments, Cloudinary, quiz generator).
- **Part 3 — Shared** covers architecture, data flow, AI usage disclosure, and the demo script.
- **Part 4 — Viva Q&A** has the questions examiners ask most, with ready answers.

> Even though the work is split, **both of you should read Part 3 and Part 4** so you can answer cross-questions (e.g., a frontend question asked to the backend owner).

---

# PART 1 — VACHASPATI TIWARI (Frontend)

## 1.1 What the frontend is

The frontend is a **React 18** single-page application built with **Vite**. It talks to the backend over HTTP (REST) using **Axios**, with cookies for authentication. State is managed with **Redux Toolkit**. Styling uses **Tailwind CSS** + **DaisyUI** with a dark navy + yellow theme that matches the project identity.

## 1.2 Folder structure (Client/src)

```
Client/src/
├── App.jsx              # All routes + role-based guards
├── main.jsx             # React root, Redux Provider, BrowserRouter
├── Compontents/
│   ├── Auth/RequireAuth.jsx   # Role-based route guard
│   ├── CourseCard.jsx         # Course tile on the catalog
│   ├── CourseThumbnail.jsx    # Image with fallback
│   ├── Footer.jsx
│   └── ...
├── Layouts/HomeLayout.jsx     # Drawer nav + footer (shared shell)
├── Pages/
│   ├── HomePage.jsx, CourseList.jsx, CourseDescription.jsx
│   ├── Course/CreateCourse.jsx, EditCourse.jsx
│   ├── Deshboard/DisplayLectures.jsx, AddLectures.jsx, ManageModules.jsx, AdminDeshboard.jsx, TeacherDeshboard.jsx
│   ├── Course/Quiz.jsx, Certificate.jsx
│   ├── Payment/Checkout.jsx, CheckoutSuccess.jsx, CheckoutFailure.jsx
│   ├── User/Profile.jsx, EditProfile.jsx
│   └── Password/* (forgot/reset/change)
├── Redux/
│   ├── store.js
│   └── Slices/ (AuthSlice, CourseSlice, LectureSlice, RazorpaySlice, StatSlice)
└── Helpers/ (axiosinstance, regexMatcher, courseThumbnail)
```

## 1.3 Routing (App.jsx)

Routes are declared with React Router v6. Protected routes are wrapped in `<RequireAuth allowedRoles={[...]}/>`:

- `/course/create`, `/course/edit`, `/course/addlecture`, `/course/modules`, `/admin/deshboard` → ADMIN + TEACHER
- `/admin/deshboard` → ADMIN only
- `/teacher/deshboard` → TEACHER only
- `/user/profile`, `/checkout`, `/course/displaylecture`, `/certificate`, `/course/quiz` → ADMIN + TEACHER + USER
- `/course/quiz` is reachable by all logged-in users

**RequireAuth logic:** reads `isLoggedIn` and `role` from Redux. If logged in and role is allowed → render `<Outlet/>`. If logged in but not allowed → redirect to `/denied`. If not logged in → redirect to `/login`.

## 1.4 State management (Redux Toolkit)

- **AuthSlice** — `isLoggedIn`, `role`, `data` (user object). Persisted in `localStorage` so a page refresh keeps the session. Thunks: `login`, `creatAccount`, `logout`, `getuserData`, `updateProfile`, `changePassword`, password reset.
- **CourseSlice** — `courseData` list. Thunks: `getAllCourse`, `createNewCourse`, `updateCourse`, `deleteCourse`.
- **LectureSlice** — `lectures`, `modules`, `quiz`, `quizPreview`, `quizResult`, `course`. Thunks for lectures, modules, files, quiz generate/get/submit.
- **RazorpaySlice** — subscription buy/verify/cancel + payment records.
- **StatSlice** — admin platform stats.

Axios instance (`Helpers/axiosinstance.js`) sets `baseURL = http://localhost:5014/api/v1` and `withCredentials = true` so the JWT cookie is sent.

## 1.5 Key pages and their logic

### HomePage
Hero section, stats bar, feature cards, CTA banner. Uses Tailwind gradients and hover transitions.

### CourseList (All Courses)
Fetches all courses, renders `CourseCard` grid. Has a **live search** filtering by title/category/instructor. Empty state with role-aware message.

### CourseDescription
Shows thumbnail, title, description, instructor, lecture count. Button: "Watch lectures" (if subscribed/admin/teacher) else "Subscribe".

### DisplayLectures (the learning page)
- Header: thumbnail, title, description, instructor, total lectures, progress bar.
- Video player (plays `lectures[currentVideo].lecture.secure_url`).
- Lecture list grouped by **module**, each lecture has a tick button (○/✅) saved to `localStorage` key `completed_<courseId>`.
- **Progress bar** = done/total.
- **Certificate button** unlocks only when `allDone && (!hasQuiz || quizPassed)`.
- **Quiz button** opens the quiz page.
- Teachers see "Manage modules & quiz" and "Add lecture".

### ManageModules (teacher/admin)
- Create / edit / delete modules.
- Upload study material (file) per module with a title.
- List files with download links + delete.
- **AI Quiz Generator panel**: count, difficulty, passing score, generate button, quiz preview with correct answers highlighted.

### Quiz (student)
- Fetches quiz (answers hidden).
- Radio options per question; submit when all answered.
- Shows score, pass/fail, per-question review with explanations.
- On pass, sets `localStorage.quiz_passed_<courseId> = "true"`.
- Passed → "Get certificate" button.

### Certificate
- Printable page: student name, course, instructor, date, signature line.
- Uses `window.print()` (Save as PDF).
- On load, adds the course to `localStorage.completedCourses`.

### Profile
- Shows avatar, name, email, role, subscription status.
- Cancel subscription button (if active).
- **My Certificates** list (from `localStorage.completedCourses`) with "View" link to certificate page.

### HomeLayout (shared shell)
- Drawer sidebar with role-aware links (Admin Dashboard / Teacher Dashboard / Create course / Profile / Logout).
- Logout calls `dispatch(logout())` then `navigate("/login")`.
- The drawer closes automatically on navigation (controlled checkbox + `useEffect` on pathname).

## 1.6 How the frontend handles "no thumbnail"
`Helpers/courseThumbnail.js` → `getCourseThumbnail(course)` returns the Cloudinary URL if valid, else `/default-course-thumbnail.png` (a bundled SVG/PNG). `CourseThumbnail.jsx` wraps `<img>` with `onError` fallback. This prevents broken images for courses seeded with placeholder data.

## 1.7 What I personally did vs. AI
- **I designed** the component structure, routing, and the learning flow (tick → progress → quiz → certificate).
- **I wrote** the Redux slices and the `DisplayLectures` grouping/quiz-gating logic.
- **AI helped** with Tailwind class suggestions, the certificate print CSS, and refactoring the drawer to close on navigation.
- I reviewed and tested every change in the browser (Playwright) before committing.

---

# PART 2 — PRERANA ANAND (Backend)

## 2.1 What the backend is

The backend is a **Node.js + Express.js** REST API. It uses **MongoDB** via **Mongoose**, **JWT** in HTTP-only cookies for auth, **bcryptjs** for password hashing, **Cloudinary** for media, **Razorpay** for subscriptions, and **Nodemailer** for email. It runs on port 5014.

## 2.2 Folder structure (Server)

```
Server/
├── server.js              # Entry: connects DB, configures Cloudinary, starts app
├── app.js                 # Express app, CORS, middleware, route mounting
├── config/dbConnection.js # MongoDB connection
├── controllers/           # user, course, payment, miscellaneous
├── middlewares/           # auth, multer (uploads), asyncHandler, error
├── models/                # usermodel, course.model, payment.model
├── routes/                # user, course, payment, miscellaneous
├── utils/                 # error.util, sendEmail, quizGenerator
└── uploads/               # temp multer storage (deleted after Cloudinary upload)
```

## 2.3 Data models

### User (`models/usermodel.js`)
- `fullName`, `email` (unique), `password` (select:false), `avatar` (Cloudinary), `role` (enum: USER/TEACHER/ADMIN, default USER), `subscription` (id, status), `forgotPasswordToken/Expiry`.
- Pre-save hook hashes password with bcrypt (only if modified).
- Methods: `comparePassword`, `generateJWTToken` (JWT with id/role/subscription), `generatePasswordResetToken`.

### Course (`models/course.model.js`)
- `title`, `description`, `category`, `thumbnail` (Cloudinary public_id + secure_url).
- `modules[]` — each: `title`, `description`, `order`, `files[]` (title + Cloudinary file).
- `lectures[]` — each: `title`, `description`, `moduleId` (ObjectId ref to module), `lecture` (Cloudinary video).
- `quiz` — embedded: `questions[]` (question, options[4], correctOption, explanation), `passingScore`, `generatedAt`, `source`.
- `numberOfLectures`, `createdBy`.

### Payment (`models/payment.model.js`)
- `razorpay_payment_id`, `razorpay_subscription_id`, `razorpay_signature`, `user`, `status`.

## 2.4 Authentication flow

1. **Register** (`POST /user/register`): multer uploads avatar → Cloudinary → creates user with role (USER/TEACHER). Admin is only created directly in DB.
2. **Login** (`POST /user/login`): finds user by email (with password), compares with bcrypt, generates JWT, sets it as an HTTP-only cookie `token`, returns user object.
3. **isLoggedIn middleware**: reads `req.cookies.token`, verifies JWT, sets `req.user = { id, role, subscription }`.
4. **authorizedRoles(...roles)**: checks `req.user.role` is in the allowed list.
5. **Logout**: clears the cookie.

## 2.5 Route protection

| Route group | Guard |
| --- | --- |
| `/course` GET | public |
| `/course` POST, `/:id` PUT/POST | isLoggedIn + ADMIN/TEACHER |
| `/course/:id` DELETE | isLoggedIn + ADMIN |
| `/course/:id/modules*` | isLoggedIn + ADMIN/TEACHER |
| `/course/:id/quiz` GET | isLoggedIn |
| `/course/:id/quiz/generate` | isLoggedIn + ADMIN/TEACHER |
| `/course/:id/quiz/submit` | isLoggedIn |
| `/payments/*` | isLoggedIn (+ ADMIN/TEACHER for list) |
| `/admin/stats/users` | isLoggedIn + ADMIN/TEACHER |

## 2.6 Course & lecture controllers

- `getAllCourse`: returns all courses excluding lectures, strips quiz answers (only metadata: hasQuiz, total, passingScore).
- `getLecturesByCourseId`: returns lectures, modules, quiz metadata, and a course summary.
- `createCourse`: creates course with "Dummy" thumbnail, then uploads thumbnail to Cloudinary if a file is provided.
- `addLectureToCourseById`: uploads video to Cloudinary (resource_type: video), pushes lecture (with optional moduleId), updates `numberOfLectures`.
- `removeLecture`: destroys video from Cloudinary, splices from array.
- `updateCourse` / `removeCourse`: standard CRUD.

## 2.7 Modules controllers

- `createModule`: pushes `{ title, description, order }` to `course.modules`.
- `updateModule`: updates title/description of a subdocument.
- `removeModule`: destroys all its files from Cloudinary, unassigns lectures (`moduleId = null`), pulls the module.
- `uploadModuleFile`: multer accepts the file, uploads to Cloudinary (resource_type: auto), pushes `{ title, file }` to the module's files.
- `removeModuleFile`: destroys file from Cloudinary, pulls from array.

## 2.8 Quiz system

### Generation (`utils/quizGenerator.js`)
- `generateQuiz(course, count, difficulty)`:
  - If `GEMINI_API_KEY` is set → call Gemini API with a prompt asking for JSON questions.
  - Else if `OPENAI_API_KEY` is set → call OpenAI.
  - On failure or no key → `generateOfflineQuiz(course, count)`: builds questions from course title, description, category, instructor, module titles, lecture titles, and study-material file names, with contextual distractors. Always produces 4 options per question.
- Returns `{ questions, source }`. Questions have `question`, `options[4]`, `correctOption`, `explanation`.

### Endpoints
- `POST /course/:id/quiz/generate` (teacher): runs generator, saves to `course.quiz`, returns full quiz (with answers) for preview.
- `GET /course/:id/quiz` (student): returns questions **without** correctOption/explanation.
- `GET /course/:id/quiz/full` (teacher): returns full quiz with answers for preview.
- `POST /course/:id/quiz/submit` (student): grades answers, returns `{ score, passed, correct, total, passingScore, review[] }`.

## 2.9 Payments (Razorpay + demo mode)

- `buySubscription`: creates a Razorpay subscription. If Razorpay fails or is unconfigured, returns `demo_sub_<userId>` so the frontend can proceed without the gateway.
- `verifySubscription`: verifies signature (or accepts demo subs), activates subscription, saves payment.
- `cancelSubscription`: cancels and deactivates.
- `allPayments`: lists all payments (admin/teacher).
- Frontend `Checkout.jsx` detects demo mode and skips the Razorpay popup, directly verifying.

## 2.10 What I personally did vs. AI
- **I designed** the database schema (models), the role-based middleware, and the module/quiz controller logic.
- **I wrote** the quiz grader and the offline question generator.
- **AI helped** with Cloudinary upload boilerplate, the Razorpay integration skeleton, and debugging CORS/cookie issues.
- I tested every endpoint with curl/Playwright and fixed the bugs myself.

---

# PART 3 — SHARED (both of you)

## 3.1 Architecture summary (one-liner)

> "A MERN-stack LMS with three roles. React + Redux on the front, Express + MongoDB on the back, JWT in HTTP-only cookies for auth, Cloudinary for media, Razorpay for payments, and an AI quiz generator that works offline and upgrades to real AI when a key is provided."

## 3.2 Data flow example — "Student completes a course"

1. Student logs in → backend sets JWT cookie → frontend stores role in Redux + localStorage.
2. Student opens a course → frontend calls `GET /course/:id` → backend returns lectures + modules + quiz metadata.
3. Student ticks lectures → frontend saves `completed_<courseId>` in localStorage, updates progress bar.
4. Student clicks "Take quiz" → frontend calls `GET /course/:id/quiz` → backend returns questions without answers.
5. Student submits → frontend calls `POST /course/:id/quiz/submit` → backend grades, returns score + review.
6. If passed → frontend sets `quiz_passed_<courseId>` → certificate button unlocks.
7. Student clicks "Get certificate" → frontend adds course to `completedCourses` in localStorage → navigates to `/certificate` → `window.print()`.

## 3.3 AI usage disclosure (be honest)

When the examiner asks "did you use AI?", answer honestly:

> "Yes. We used AI as an assistant — like a senior developer sitting next to us. It helped us scaffold boilerplate (Express routes, Tailwind classes), debug errors (CORS, cookie handling, Mongoose pre-save hooks), and refactor the UI. But every feature was designed, integrated, and tested by us: the role-based access control, the module system, the quiz grader, the certificate flow, and the progress tracking. We can explain and modify any part of the code."

**Do not claim you wrote everything by hand** — examiners can tell, and honesty scores better. The key is that you **understand** the code and can **change** it on request.

## 3.4 Demo script (what to show, in order)

1. Open http://localhost:5173 → show the new homepage (hero, stats, features, CTA).
2. Go to **All Courses** → search box demo → open "Systems's Thinking".
3. Click **Watch lectures** → show distinct videos per lecture, tick them, progress bar fills.
4. Click **Take the course quiz** → answer questions → submit → show 100% + explanations.
5. Click **Get certificate** → show certificate → **Print / Save as PDF**.
6. **Profile → My Certificates** → revisit.
7. Log in as teacher → **Teacher Dashboard** → show "My Courses", modules, quiz count.
8. Open a course → **Manage modules & quiz** → show modules, study-material upload, AI quiz generator panel with preview.
9. Log in as admin → **Admin Dashboard** → platform stats, all courses, payments.

---

# PART 4 — VIVA Q&A (likely questions & ready answers)

**Q: What is the MERN stack?**
A: MongoDB (database), Express.js (backend framework), React (frontend), Node.js (runtime). We used it so one language (JavaScript) runs the whole app and JSON flows end-to-end.

**Q: How does authentication work?**
A: User logs in → backend verifies password with bcrypt → creates a JWT containing id/role/subscription → stores it in an HTTP-only cookie. Every request sends the cookie; the `isLoggedIn` middleware verifies the JWT and sets `req.user`. Frontend also mirrors `isLoggedIn/role` in Redux + localStorage for UI routing.

**Q: How are roles enforced?**
A: Backend: `authorizedRoles(...roles)` middleware checks `req.user.role`. Frontend: `RequireAuth` component checks Redux role against `allowedRoles`. Both must agree — the frontend hides links, the backend rejects unauthorized calls.

**Q: How does the quiz grader work?**
A: `submitCourseQuiz` loads the course, maps each submitted answer to the stored `correctOption`, counts correct, computes `score = round(correct/total * 100)`, and compares to `passingScore` (default 60). Returns score, passed flag, and a per-question review with explanations. Answers are never sent to the client before submission.

**Q: How does the AI quiz generator work?**
A: It checks for `GEMINI_API_KEY` / `OPENAI_API_KEY`. If present, it calls that API with a prompt requesting JSON questions. If absent or the call fails, it uses a smart offline generator that builds questions from the course's modules, lectures and study material, with contextual distractors. Either way it always produces valid 4-option MCQs.

**Q: How is progress tracked?**
A: Each lecture has a tick button. Ticks are stored in `localStorage` under `completed_<courseId>`. The progress bar is `done/total`. The certificate unlocks only when all lectures are done AND the quiz is passed.

**Q: How is the certificate generated?**
A: A printable HTML page at `/certificate` renders the student name, course, instructor and date, using `window.print()` (Save as PDF). Completed courses are stored in `localStorage.completedCourses` and shown in "My Certificates" on the profile.

**Q: Why store progress in localStorage instead of the database?**
A: For this academic project it keeps the backend simpler and avoids schema migrations. In production we would persist `lessonsDone` and `quizPassed` on the Enrollment model (the report's schema already has these fields).

**Q: How do modules work?**
A: A course has an embedded `modules[]` array. Each module has title, description, order, and `files[]` (Cloudinary uploads). Lectures reference a `moduleId`. The UI groups lectures under their module and shows download links for files. Deleting a module unassigns its lectures and removes its files from Cloudinary.

**Q: How is media handled?**
A: Multer stores uploads in `uploads/` temporarily, then the controller uploads to Cloudinary (images/videos/raw) and deletes the temp file. The DB stores only `public_id` + `secure_url`. Thumbnails use `resource_type: image`, videos `video`, study material `auto`.

**Q: How do payments work?**
A: Razorpay subscription checkout with server-side signature verification. If Razorpay is unconfigured or fails, a **demo mode** activates the subscription automatically so the project can be evaluated offline.

**Q: What did you do vs. the AI?**
A: (Use the honest disclosure in Part 3.3.) We designed the schema, roles, module system, quiz grader, and certificate flow; AI assisted with boilerplate and debugging; we tested everything ourselves.

**Q: What would you improve next?**
A: Persist certificates and progress in the DB, add quizzes with timers, course ratings/reviews, live classes, mobile app, and deployment with CI/CD.

---

## 📎 Quick reference

- Frontend: http://localhost:5173
- Backend: http://localhost:5014
- Demo accounts: Admin `testuser123@example.com` / `Test@1234`; Teacher `teacher@example.com` / `Teacher@1234`; Student `testuser999@example.com` / `Test@1234`
- Repo: `D:\college projects\new lms\Learning-Management-System`
- Report: `D:\LMS_MERN_Project_Report_Completed.docx`
- Presentation: `D:\EduNest_LMS_Final_Presentation.pptx`

> Good luck with the viva! 🎓
