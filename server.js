
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Konfiguracja puli połączeń do bazy danych z obsługą błędów
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API: Pobieranie wszystkich serwerów
app.get('/api/servers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servers');
    res.json(result.rows || []);
  } catch (err) {
    console.error('Database error (GET /api/servers):', err.message);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// API: Zapisywanie serwera
app.post('/api/servers', async (req, res) => {
  const { id, name, icon, ownerId, roles, categories } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    await pool.query(
      'INSERT INTO servers (id, name, icon, owner_id, roles, categories) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$2, icon=$3, roles=$5, categories=$6',
      [id, name, icon, ownerId, JSON.stringify(roles || []), JSON.stringify(categories || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Database error (POST /api/servers):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Usuwanie serwera
app.delete('/api/servers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM servers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Database error (DELETE /api/servers):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Pobieranie wiadomości dla kanału
app.get('/api/messages/:channelId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages WHERE channel_id = $1 ORDER BY timestamp ASC LIMIT 100', [req.params.channelId]);
    res.json(result.rows || []);
  } catch (err) {
    console.error('Database error (GET /api/messages):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Zapisywanie wiadomości
app.post('/api/messages', async (req, res) => {
  const { id, channel_id, sender_id, content, reply_to_id, attachment } = req.body;
  try {
    await pool.query(
      'INSERT INTO messages (id, channel_id, sender_id, content, reply_to_id, attachment) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, channel_id, sender_id, content, reply_to_id, JSON.stringify(attachment || null)]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Database error (POST /api/messages):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serwowanie plików statycznych frontendu
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
