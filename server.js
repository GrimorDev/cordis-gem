
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

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

// Middleware do poprawnego serwowania plików TSX jako module JS dla przeglądarki
app.use((req, res, next) => {
  if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
    res.type('application/javascript');
  }
  next();
});

// --- API Użytkownicy ---
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { username, avatar, customStatus, settings } = req.body;
  try {
    await pool.query(
      'UPDATE users SET username = $1, avatar = $2, custom_status = $3, settings = $4 WHERE id = $5',
      [username, avatar, customStatus, JSON.stringify(settings || {}), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/settings', async (req, res) => {
  const { settings } = req.body;
  try {
    await pool.query('UPDATE users SET settings = $1 WHERE id = $2', [JSON.stringify(settings), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API Znajomi (DM) ---
app.get('/api/friends/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.* FROM users u 
      JOIN friends f ON (f.friend_id = u.id) 
      WHERE f.user_id = $1
    `, [req.params.userId]);
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API Serwery ---
app.get('/api/servers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servers');
    const servers = result.rows || [];
    
    // Fetch members for each server
    const serversWithMembers = await Promise.all(servers.map(async (server) => {
      // In a real app we'd have a server_members table, but for this mock we'll return some users
      const membersResult = await pool.query('SELECT * FROM users');
      return {
        ...server,
        members: membersResult.rows
      };
    }));

    res.json(serversWithMembers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/servers', async (req, res) => {
  const { id, name, icon, ownerId, roles, categories } = req.body;
  try {
    await pool.query(
      'INSERT INTO servers (id, name, icon, owner_id, roles, categories) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name=$2, icon=$3, roles=$5, categories=$6',
      [id, name, icon, ownerId, JSON.stringify(roles || []), JSON.stringify(categories || [])]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/servers/:id', async (req, res) => {
  try {
    console.log(`Attempting to delete server with ID: ${req.params.id}`);
    const result = await pool.query('DELETE FROM servers WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      console.warn(`Server with ID ${req.params.id} not found for deletion.`);
      return res.status(404).json({ error: "Server not found" });
    }
    console.log(`Server ${req.params.id} deleted successfully.`);
    res.json({ success: true });
  } catch (err) {
    console.error(`Error deleting server ${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// --- API Wiadomości ---
app.get('/api/messages/:channelId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages WHERE channel_id = $1 ORDER BY timestamp ASC', [req.params.channelId]);
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  const { id, channel_id, sender_id, content, reply_to_id, attachment } = req.body;
  try {
    await pool.query(
      'INSERT INTO messages (id, channel_id, sender_id, content, reply_to_id, attachment) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, channel_id, sender_id, content, reply_to_id, JSON.stringify(attachment || null)]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(__dirname));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(port, () => console.log(`Backend running on port ${port}`));
