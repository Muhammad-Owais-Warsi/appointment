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

router.get('/slots', (req, res) => {
  const { date } = req.query;
  const days = getNext7Days();
  const dates = date ? [date] : days;

  const booked = db.query("SELECT date, time FROM appointments WHERE status = 'booked'").all();
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

router.post('/book', (req, res) => {
  const { date, time, name, email } = req.body;
  if (!date || !time || !name || !email) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const existing = db.query("SELECT id FROM appointments WHERE date = ? AND time = ? AND status = 'booked'").get(date, time);
  if (existing) return res.status(409).json({ error: 'This slot was just taken by someone else' });

  const result = db.query("INSERT INTO appointments (date, time, client_name, client_email) VALUES (?, ?, ?, ?)").run(date, time, name, email);
  res.json({ id: result.lastInsertRowid, message: 'Booked!' });
});

router.get('/appointments', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const appointments = db.query("SELECT * FROM appointments WHERE client_email = ? ORDER BY date DESC, time DESC").all(email);
  res.json(appointments);
});

router.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const result = db.query("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status = 'booked'").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Not found or already cancelled' });
  }
  res.json({ message: 'Cancelled' });
});

export default router;
