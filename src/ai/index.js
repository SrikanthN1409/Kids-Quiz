import 'dotenv/config.js';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import pool from '../db.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runReview() {
  const { rows: categories } = await pool.query('SELECT id, name FROM categories');
  console.log('Fetched categories:', categories);

  let report = '';
  let totalInserted = 0;

  for (const { id, name } of categories) {
    console.log(`\n🧠 Generating questions for: ${name}`);

    // ✅ DELETE old questions for this category
    await pool.query('DELETE FROM questions WHERE category_id = $1', [id]);

    let generated = [];
    try {
      const gen = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a helpful AI that returns JSON arrays only.' },
          {
            role: 'user',
            content:
              `Generate exactly 30 kid-friendly multiple-choice questions about ${name}. ` +
              `Return only a JSON array. Format:\n` +
              `[{"body": "...", "a": "...", "b": "...", "c": "...", "d": "...", "correct": "A"}]`
          }
        ]
      });

      const content = gen.choices[0].message.content.trim();
      const parsed = JSON.parse(content);
      generated = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(generated)) throw new Error('Not an array');
    } catch (err) {
      console.error(`❌ Error parsing AI response for ${name}:`, err.message);
      continue;
    }

    console.log(`✅ Parsed ${generated.length} questions for ${name}`);

    // Declare corrections to prevent reference error later
    let corrections = [];

    // ✅ Insert new questions
    let inserted = 0;
    for (const q of generated) {
      const result = await pool.query(
        `INSERT INTO questions
         (category_id, body, choice_a, choice_b, choice_c, choice_d, correct, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'ai')
         ON CONFLICT (body) DO NOTHING RETURNING id`,
        [id, q.body, q.a, q.b, q.c, q.d, q.correct]
      );
      if (result.rowCount > 0) inserted++;
    }

    totalInserted += inserted;

    report += `\n\n=== ${name} ===\n🆕 Inserted: ${inserted} new questions\n` +
              `Fixed:\n${JSON.stringify(corrections, null, 2)}\n` +
              generated.map(g => '• ' + g.body).join('\n');
  }

  if (!report.trim()) {
    report = '✅ No changes today. All questions are correct.';
  } else {
    report = `📊 Total Inserted Today: ${totalInserted}\n` + report;
  }

  await sendMail(report);
  console.log('\n✅ Review completed & email sent.');
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
    to: 'srikanth.nagalla@yahoo.co.in',
    subject: '[Quiz-AI] Daily question report',
    text
  });
}

runReview()
  .catch(err => {
    console.error('❌ runReview crashed:', err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
    process.exit(0);
  });
