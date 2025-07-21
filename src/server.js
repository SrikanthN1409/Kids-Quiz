// ✅ Load environment variables BEFORE anything else
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import quizRouter from './routes/quiz.js';
import pool from './db.js'; // ✅ Correct path to default export


// import pool from './db.js'; // or '../db.js' depending on location
 // ✅ Correct if you're doing `export { pool }`
 // ✅ Default import (matches your current export)
// PostgreSQL connection
import requestIp from 'request-ip';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ✅ 2. Initialize express app
const app = express();

// ✅ 3. Configure environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

// ✅ 4. Set up CSP with helmet
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
  "'self'",
  "https://cdn.jsdelivr.net",
  "https://www.googletagmanager.com",
  "https://unpkg.com",
  "https://static.cloudflareinsights.com",
  "blob:",
  "https://www.kids-adda.fun",
   "https://static.elfsight.com" 
],
scriptSrcElem: [
  "'self'",
  "https://cdn.jsdelivr.net",
  "https://www.googletagmanager.com",
  "https://unpkg.com",
  "https://static.cloudflareinsights.com",
  "https://fonts.googleapis.com",
  "https://www.kids-adda.fun",
  "https://static.elfsight.com",
  "https://apps.elfsight.com" 
],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    workerSrc: ["'self'", "blob:"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'",
      "https://www.google-analytics.com",
      "https://apps.elfsight.com",
    "https://core.service.elfsight.com",
   "https://static.elfsight.com"], 
    frameSrc: [ "'self'",
      "https://apps.elfsight.com"],
    objectSrc: ["'none'"]
  }
}));

// ✅ 5. Add other middleware
app.set('trust proxy', 1);
if (process.env.NODE_ENV === 'production') {
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
// Hit counter (add AFTER defining `app` and `pool`)
app.post('/api/hit', async (req, res) => {
 
  try {
    await pool.query('INSERT INTO site_hits DEFAULT VALUES');
    const result = await pool.query('SELECT COUNT(*) FROM site_hits');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error tracking hit:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/hit-count', async (req, res) => {
  try {
    const result = await pool.query('SELECT count FROM site_hits WHERE id = 1');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error('Error fetching hit count:', err);
    res.status(500).json({ error: 'Internal server error' });
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
