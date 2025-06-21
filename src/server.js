import express from 'express';
import cors    from 'cors';
import 'dotenv/config.js';
import quizRouter from './routes/quiz.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api', quizRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
