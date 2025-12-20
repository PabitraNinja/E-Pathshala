/* eslint-disable */

const express = require('express');
const path = require('path');
const cors = require('cors');
const portfinder = require('portfinder');

const db = require('./config/database');

const user = require('./routes/user');
const assignment = require('./routes/Assignment');
const article = require('./routes/article');
const course = require('./routes/course');
const courseModule = require('./routes/courseModule');
const courseModuleItem = require('./routes/courseModuleItem');
const discussionsRouter = require('./routes/Discussions');
const cheatingDetection = require('./routes/cheatingDetection');
const notification = require('./routes/notification');
const lectureRouter = require('./routes/lecture');
const AnnouncementsRouter = require('./routes/announcement');
const assessmentRouter = require('./routes/assessment');
const SubmissionRouter = require('./routes/submissions');
const gradeBookRouter = require('./routes/gradeBook');
const enrollmentRouter = require('./routes/enrollment');
const deadlineRouter = require('./routes/deadlines');
const achievementsRouter = require('./routes/achievementsRouter');

const fileUpload = require('express-fileupload');

const app = express();

/* =======================
   1️⃣ CONNECT DB
======================= */
db();

/* =======================
   2️⃣ CORS (VERY IMPORTANT)
======================= */
app.use(
  cors({
    origin: "https://e-pathshala-six.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Explicit preflight support
app.options('*', cors());

/* =======================
   3️⃣ MIDDLEWARES
======================= */
app.use(express.json());

app.use(
  fileUpload({
    debug: false,
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: 4
  })
);

/* =======================
   4️⃣ STATIC FILES
======================= */
const publicDirectoryPath = path.join(__dirname, './view');
app.use(express.static(publicDirectoryPath));
app.use('/course-file', express.static('course-file'));

/* =======================
   5️⃣ ROUTES
======================= */
app.use('/users', user);
app.use('/discussions', discussionsRouter);
app.use('/announcements', AnnouncementsRouter);
app.use('/courses', course);
app.use('/assignment', assignment);
app.use('/cheatingDetection', cheatingDetection);
app.use('/article', article);
app.use('/notification', notification);
app.use('/deadlines', deadlineRouter);
app.use('/:courseId/', gradeBookRouter);
app.use('/:courseId/assessments', assessmentRouter);
app.use('/:courseId/enrollments', enrollmentRouter);
app.use('/:courseId/assessments/:assessmentId/submissions', SubmissionRouter);
app.use('/courses/:courseId/modules', courseModule);
app.use('/courses/:courseId/modules/:moduleId/module-item', courseModuleItem);
app.use('/courses/:courseId/lectures', lectureRouter);
app.use('/achievements', achievementsRouter);

/* =======================
   6️⃣ START SERVER
======================= */
const port = process.env.PORT || 4000;

portfinder.getPort({ port }, (err, newPort) => {
  if (err) throw err;
  app.listen(newPort, () => {
    console.log('app is on Port ' + newPort);
  });
});
