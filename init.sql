
-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar TEXT,
    discriminator TEXT NOT NULL,
    status TEXT DEFAULT 'ONLINE',
    settings JSONB DEFAULT '{}'::jsonb
);

-- Tabela znajomych (relacje DM)
CREATE TABLE IF NOT EXISTS friends (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    friend_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, friend_id)
);

-- Tabela serwerów
CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    owner_id TEXT REFERENCES users(id),
    roles JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb
);

-- Tabela wiadomości
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL,
    sender_id TEXT REFERENCES users(id),
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reply_to_id TEXT,
    attachment JSONB,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE
);

-- Inicjalizacja domyślnych danych (Bot i Deweloper)
INSERT INTO users (id, username, avatar, discriminator, status, settings) 
VALUES 
('u1', 'Developer', 'https://picsum.photos/200', '0001', 'ONLINE', '{"theme": "dark", "language": "pl"}'::jsonb),
('gemini', 'Gemini AI', 'https://picsum.photos/201', '0000', 'ONLINE', '{"theme": "dark", "language": "en"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Dodanie bota do znajomych dla dewelopera
INSERT INTO friends (user_id, friend_id) VALUES ('u1', 'gemini'), ('gemini', 'u1') ON CONFLICT DO NOTHING;
