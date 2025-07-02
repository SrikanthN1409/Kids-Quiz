// ✅ Load environment variables BEFORE anything else
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import quizRouter from './routes/quiz.js';
import pool from './db.js'; // PostgreSQL connection
import requestIp from 'request-ip';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ✅ Resolve __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
app.set('trust proxy', 1);
// ✅ Redirect to HTTPS in production
if (process.env.NODE_ENV === 'production') {
   app.use(helmet());
  app.use(rateLimit({ windowMs: 60_000, max: 100 }));
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// ✅ View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));
app.use(express.static(path.join(projectRoot, 'public')));

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Visitor Hit Counter API
 // ✅ install this with: npm install request-ip

// app.use(requestIp.mw()); // ✅ middleware to get IP

// ✅ Hit count API
// ✅ Unified hit counter using POST with unique visitorId
// ✅ server.js (or route file)
// ✅ This route only returns count without increment
app.get('/api/hit-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT count FROM site_hits WHERE id = 1');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error getting hit count:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// ✅ This route increments count only on first visit
app.get('/api/hit', async (req, res) => {
  try {
    await pool.query('UPDATE site_hits SET count = count + 1 WHERE id = 1');
    const result = await pool.query('SELECT count FROM site_hits WHERE id = 1');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error updating hits:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});




// ✅ Feedback Email API
app.post('/api/feedback', async (req, res) => {
  const { message } = req.body;

  if (!message || message.length < 10) {
    return res.status(400).json({ error: 'Message too short' });
  }

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn("⚠️ Email credentials missing.");
    return res.status(500).json({ error: 'Email not configured' });
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

// ✅ Home route
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ Quiz-related API
app.use('/api', quizRouter);

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
