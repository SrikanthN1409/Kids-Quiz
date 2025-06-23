/**
 * AI reviewer / question-generator
 * --------------------------------
 * • Generates 5 new MCQs per category (kids level)
 * • Fixes any wrong answers already in the DB
 * • Sends a daily e-mail summary
 *
 * Required ENV:
 *   DATABASE_URL   – Postgres connection string
 *   OPENAI_API_KEY – OpenAI project or user key
 *   MAIL_PASS      – Yahoo app password
 */

import 'dotenv/config.js';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import pool from '../db.js';


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runReview() {
  const { rows: categories } = await pool.query(
    'SELECT id, name FROM categories'
  );
  console.log('Fetched categories:', categories);

  let report = '';

  for (const { id, name } of categories) {
    console.log(`Generating questions for: ${name}`);

    /* 1. Generate 5 MCQs (JSON array) */
    const gen = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a quiz generator.' },
        {
          role: 'user',
          content:
            `Return a JSON array of 5 MCQs for kids about ${name}. ` +
            `Each item must have {"body","a","b","c","d","correct"}.`
        }
      ]
    });

    const raw = JSON.parse(gen.choices[0].message.content);
const generated = Array.isArray(raw) ? raw : raw.questions;

if (!Array.isArray(generated)) {
  console.error('❌ Expected an array, skipping', name);
  continue;
}

    /* 2. Check existing questions for wrong answers */
    const { rows: qs } = await pool.query(
      'SELECT id, body, correct FROM questions WHERE category_id=$1',
      [id]
    );

    const fix = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a proof-reader of quiz answers.' },
        {
          role: 'user',
          content:
            `Return JSON array of {id, correct} ONLY for wrong answers:\n` +
            JSON.stringify(qs)
        }
      ]
    });

    let corrections = [];
    try {
      const parsed = JSON.parse(fix.choices[0].message.content);
      corrections = Array.isArray(parsed) ? parsed : [];
    } catch {
      /* keep empty */
    }

    /* 3. Apply DB updates & inserts */
    for (const { id: qid, correct } of corrections) {
      await pool.query('UPDATE questions SET correct=$1 WHERE id=$2', [
        correct,
        qid
      ]);
    }

    for (const q of generated) {
      await pool.query(
        `INSERT INTO questions
         (category_id, body, choice_a, choice_b, choice_c, choice_d, correct)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (body) DO NOTHING`,
        [id, q.body, q.a, q.b, q.c, q.d, q.correct]
      );
    }

    report += `\n\n=== ${name} ===\nAdded:\n${generated
      .map(g => g.body)
      .join('\n')}\nFixed:\n${JSON.stringify(corrections, null, 2)}`;
  }

  await sendMail(report);
  console.log('✅ Review completed & email sent.');
}

async function sendMail(text) {
  const mailer = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
    auth: {
      user: 'srikanth.nagalla@yahoo.co.in',
      pass: process.env.MAIL_PASS
    }
  });

  await mailer.sendMail({
    from: 'Kids Quiz AI <srikanth.nagalla@yahoo.co.in>',
    to:   'srikanth.nagalla@yahoo.co.in',
    subject: '[Quiz-AI] Daily question report',
    text
  });
}

/* Top-level run with graceful shutdown */
runReview()
  .catch(err => {
    console.error('❌ runReview crashed:', err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();           // close DB pool in local runs
    process.exit(0);
  });
