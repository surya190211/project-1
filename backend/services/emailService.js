import cron from 'node-cron';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Question from '../models/Question.js';
import UserProgress from '../models/UserProgress.js';
import { getRecommendationsForQuestion } from '../routes/recommendations.js';

// Setup Nodemailer transporter with credentials from env
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER || 'dummy_user',
      pass: process.env.SMTP_PASS || 'dummy_pass',
    },
  });
};

// Hooks lists for daily emails
const MOTIVATIONAL_HOOKS = [
  "Consistency is the key to mastering algorithms! Keep going.",
  "Every problem solved is a step closer to your dream tech job.",
  "Don't stop when you are tired. Stop when you are done!",
  "Make today the day you conquer that Dynamic Programming bug.",
  "Small daily steps compound into massive engineering skills.",
  "Code, debug, repeat. Today is a great day to learn something new!",
  "Challenge yourself today. You are stronger than any graph traversal!"
];

// Helper to select a random item
const getRandomHook = () => {
  return MOTIVATIONAL_HOOKS[Math.floor(Math.random() * MOTIVATIONAL_HOOKS.length)];
};

// Generate HTML email template
const generateEmailHtml = (username, hook, activeQuestions, recommendedQuestions) => {
  const activeRows = activeQuestions.length > 0 
    ? activeQuestions.map(q => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 500; color: #1e293b;">${q.title}</td>
          <td style="padding: 12px; color: #475569;">${q.topic}</td>
          <td style="padding: 12px;">
            <span style="display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; 
              background-color: ${q.difficulty === 'Easy' ? '#d1fae5' : q.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2'};
              color: ${q.difficulty === 'Easy' ? '#065f46' : q.difficulty === 'Medium' ? '#92400e' : '#991b1b'};">
              ${q.difficulty}
            </span>
          </td>
          <td style="padding: 12px; text-align: right;">
            <a href="${q.url || '#'}" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: 600;">Solve ↗</a>
          </td>
        </tr>
      `).join('')
    : `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #64748b;">No active questions. Great time to pick a recommendation below!</td></tr>`;

  const recCards = recommendedQuestions.length > 0
    ? recommendedQuestions.map(q => `
        <div style="flex: 1; min-width: 200px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 8px; box-sizing: border-box;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.05em;">Similar Pick</div>
          <h4 style="margin: 8px 0; font-size: 15px; color: #1e293b;">${q.title}</h4>
          <div style="font-size: 12px; color: #475569; margin-bottom: 12px;">Topic: ${q.topic}</div>
          <span style="display: inline-block; padding: 3px 6px; font-size: 10px; font-weight: bold; border-radius: 4px; margin-bottom: 12px;
            background-color: ${q.difficulty === 'Easy' ? '#d1fae5' : q.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2'};
            color: ${q.difficulty === 'Easy' ? '#065f46' : q.difficulty === 'Medium' ? '#92400e' : '#991b1b'};">
            ${q.difficulty}
          </span>
          <div style="margin-top: 8px; text-align: right;">
            <a href="${q.url || '#'}" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600; font-size: 13px;">Try This ↗</a>
          </div>
        </div>
      `).join('')
    : `<div style="width: 100%; text-align: center; padding: 16px; color: #64748b;">No recommendations available right now.</div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Daily DSA Practice Reminder</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color: #4f46e5; padding: 32px; text-align: center;">
            <span style="font-size: 32px;">🔥</span>
            <h1 style="color: #ffffff; margin: 12px 0 0 0; font-size: 24px;">DSA Progress Tracker</h1>
            <p style="color: #c7d2fe; margin: 4px 0 0 0; font-size: 14px;">Your daily morning algorithm workout</p>
          </td>
        </tr>
        
        <!-- Content Body -->
        <tr>
          <td style="padding: 32px;">
            <p style="font-size: 16px; color: #334155; margin-top: 0;">Hi <strong>${username}</strong>,</p>
            
            <!-- Hook -->
            <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 4px; margin-bottom: 24px; color: #3730a3; font-style: italic; font-size: 15px;">
              "${hook}"
            </div>

            <!-- Current Targets -->
            <h2 style="font-size: 18px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 16px;">
              🎯 Active Problems for Today
            </h2>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b;">
                  <th style="padding: 8px 12px; text-align: left;">Problem</th>
                  <th style="padding: 8px 12px; text-align: left;">Topic</th>
                  <th style="padding: 8px 12px; text-align: left;">Difficulty</th>
                  <th style="padding: 8px 12px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${activeRows}
              </tbody>
            </table>

            <!-- Recommendations -->
            <h2 style="font-size: 18px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 16px;">
              💡 Recommended Next Questions
            </h2>
            <div style="display: flex; flex-direction: row; flex-wrap: wrap; margin: -8px;">
              ${recCards}
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 8px 0;">This is an automated practice reminder from your DSA Progress Tracker website.</p>
            <p style="margin: 0;">To stop receiving these emails, adjust your profile preferences in settings.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Main function to run daily triggers
export const sendDailyReminders = async () => {
  console.log('Running daily DSA practice reminder cron job...');
  try {
    // Find all users with email notifications enabled
    const users = await User.find({ notif: true });
    console.log(`Found ${users.length} users with email notification preferences enabled.`);

    const transporter = getTransporter();

    for (const user of users) {
      // 1. Fetch In Progress and Todo questions
      const progressLogs = await UserProgress.find({ userId: user._id });
      
      const inProgressIds = progressLogs.filter(p => p.status === 'In Progress').map(p => p.questionId);
      const todoIds = progressLogs.filter(p => p.status === 'Todo').map(p => p.questionId);

      let activeQuestions = await Question.find({ _id: { $in: [...inProgressIds, ...todoIds] } });

      // Fallback: If no progress logs exist or all logged items are solved, choose questions that have no progress yet
      if (activeQuestions.length === 0) {
        const solvedIds = progressLogs.filter(p => p.status === 'Solved').map(p => p.questionId);
        activeQuestions = await Question.find({ _id: { $nin: solvedIds } }).limit(3);
      }

      // Limit active questions in email to top 3 to keep it readable
      const emailActiveQuestions = activeQuestions.slice(0, 3);

      // 2. Fetch recommendations
      let recs = [];
      if (emailActiveQuestions.length > 0) {
        recs = await getRecommendationsForQuestion(user._id, emailActiveQuestions[0]._id, 3);
      } else {
        // Fallback: Get first 3 questions in database
        recs = await Question.find().limit(3);
      }

      // 3. Format and send email
      const hook = getRandomHook();
      const htmlContent = generateEmailHtml(user.username, hook, emailActiveQuestions, recs);

      const mailOptions = {
        from: process.env.FROM_EMAIL || '"DSA Tracker" <noreply@dsatracker.com>',
        to: user.email,
        subject: '🔥 Daily DSA practice reminder: Keep your streak alive!',
        html: htmlContent
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Successfully sent daily email reminder to ${user.username} (${user.email})`);
      } catch (err) {
        console.warn(`Could not send email to ${user.username} (${user.email}). Standard behavior when SMTP configuration is omitted. Details: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Error running daily reminders service:', error);
  }
};

// Schedule Cron: Every day at 8:00 AM
// Format: minute hour day-of-month month day-of-week
const scheduleJob = () => {
  cron.schedule('0 8 * * *', async () => {
    await sendDailyReminders();
  });
  console.log('Scheduled daily reminder cron job at 8:00 AM.');
};

export default scheduleJob;
