import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import { pool } from '../db.js';
import 'dotenv/config.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runReview() {
  const { rows: categories } = await pool.query('SELECT id, name FROM categories');

  let report = '';

  for (const { id, name } of categories) {
    // ask the model for e.g. 5 extra questions:
    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: `You are a quiz generator.`},
                 { role: 'user', content:`Give 5 MCQs for kids about ${name}.`}]
    });
    const generated = JSON.parse(choices[0].message.content);

    // verify existing Q‑A pairs
    const { rows: qs } = await pool.query(
      `SELECT id, body, correct FROM questions WHERE category_id=$1`, [id]);

    const check = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role:'system', content:'You are a proof‑reader of quiz answers.' },
        { role:'user', content:`Return JSON array of ids with a corrected answer if wrong:\n${JSON.stringify(qs)}` }
      ]
    });
    const corrections = JSON.parse(check.choices[0].message.content);

    // apply DB fixes
    for (const { id: qid, correct } of corrections)
      await pool.query(`UPDATE questions SET correct=$1 WHERE id=$2`, [correct, qid]);

    // insert new questions (simple demo, expand to 100 cap)
    for (const q of generated)
      await pool.query(
        `INSERT INTO questions(category_id, body, choice_a, choice_b, choice_c, choice_d, correct)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, q.body, q.a, q.b, q.c, q.d, q.correct]);

    report += `\n\n=== ${name} ===\nAdded:\n${generated.map(g=>g.body).join('\n')}`
            + `\nFixed:\n${JSON.stringify(corrections, null, 2)}`;
  }

  await sendMail(report);
}

async function sendMail(text) {
  const mailer = nodemailer.createTransport({
    service:'gmail',
    auth:{ user:'srikanth.nagalla@yahoo.co.in', pass:process.env.MAIL_PASS }
  });
  await mailer.sendMail({
    from:'Kids Quiz AI <srikanth.nagalla@yahoo.co.in>',
    to:'srikanth.nagalla@yahoo.co.in',
    subject:'[Quiz‑AI] New & corrected questions',
    text
  });
}
