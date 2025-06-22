import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import quizRouter from './routes/quiz.js';

// ✅ Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Project root (go one level up from /src)
const projectRoot = path.join(__dirname, '..');

const app = express();

// ✅ View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views')); // points to /views

// ✅ Serve static assets from /public
app.use(express.static(path.join(projectRoot, 'public')));

app.use(cors());
app.use(express.json());

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
