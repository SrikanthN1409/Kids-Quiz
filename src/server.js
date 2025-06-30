// ✅ MUST be the first lines
// ✅ Load environment variables BEFORE anything else
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') }); // 👈 load one level up

console.log("✅ Loaded env in server.js:", process.env.DATABASE_URL);

import express from 'express';
import cors from 'cors';

import { fileURLToPath } from 'url';

import quizRouter from './routes/quiz.js';



// // ✅ Fix __dirname in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// ✅ Project root (go one level up from /src)
const projectRoot = path.join(__dirname, '..');
dotenv.config();
const app = express();

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// ✅ View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views')); // points to /views

// ✅ Serve static assets from /public
app.use(express.static(path.join(projectRoot, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


// ✅ Feedback email route
app.post('/api/feedback', async (req, res) => {
  const { message } = req.body;
  if (!message || message.length < 10) {
    return res.status(400).json({ error: 'Message too short' });
  }
if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.warn("⚠️ Email credentials missing.");
} else {
  console.log("✅ Email system ready.");
}

 
  const transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
     

    },
  });

  try {
    await transporter.sendMail({
      from: `"Kids Quiz" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: '📩 New Feedback Submitted',
      text: message,
    });

    res.json({ success: true, message: 'Feedback sent successfully' });
  } catch (err) {
    console.error('❌ Email send failed:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ✅ Home route that renders index.ejs
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ API router
app.use('/api', quizRouter);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
