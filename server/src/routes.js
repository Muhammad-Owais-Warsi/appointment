import { Router } from 'express';
import db from './db.js';

const router = Router();

const ALL_TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                   '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0) continue;
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

router.get('/slots', async (req, res) => {
  const { date } = req.query;
  const days = getNext7Days();
  const dates = date ? [date] : days;

  const { rows: booked } = await db.execute("SELECT date, time FROM appointments WHERE status = 'booked'");
  const bookedMap = {};
  for (const b of booked) {
    if (!bookedMap[b.date]) bookedMap[b.date] = new Set();
    bookedMap[b.date].add(b.time);
  }

  const result = {};
  for (const d of dates) {
    const taken = bookedMap[d] || new Set();
    const available = ALL_TIMES.filter(t => !taken.has(t));
    result[d] = {
      available,
      total: ALL_TIMES.length,
      remaining: available.length,
    };
  }
  res.json(result);
});

router.post('/book', async (req, res) => {
  const { date, time, name, email } = req.body;
  if (!date || !time || !name || !email) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const { rows: existing } = await db.execute({
    sql: "SELECT id FROM appointments WHERE date = ?1 AND time = ?2 AND status = 'booked'",
    args: [date, time],
  });
  if (existing.length > 0) return res.status(409).json({ error: 'This slot was just taken by someone else' });

  const result = await db.execute({
    sql: "INSERT INTO appointments (date, time, client_name, client_email) VALUES (?1, ?2, ?3, ?4)",
    args: [date, time, name, email],
  });
  res.json({ id: Number(result.lastInsertRowid), message: 'Booked!' });
});

router.get('/appointments', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const { rows } = await db.execute({
    sql: "SELECT * FROM appointments WHERE client_email = ?1 ORDER BY date DESC, time DESC",
    args: [email],
  });
  res.json(rows);
});

router.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.execute({
    sql: "UPDATE appointments SET status = 'cancelled' WHERE id = ?1 AND status = 'booked'",
    args: [id],
  });
  if (result.rowsAffected === 0) {
    return res.status(404).json({ error: 'Not found or already cancelled' });
  }
  res.json({ message: 'Cancelled' });
});

export default router;
