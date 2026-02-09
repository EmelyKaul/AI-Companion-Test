-- Führe diesen SQL Code im Supabase SQL Editor aus, um die Datenbankstruktur zu erstellen.

-- 1. Tabelle für die Teilnehmenden
CREATE TABLE participants (
  study_id TEXT PRIMARY KEY, -- z.B. MH123456
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabelle für tägliche Sessions (Verhindert doppelte Sessions pro Tag pro User)
CREATE TABLE daily_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id TEXT REFERENCES participants(study_id) ON DELETE CASCADE,
  date DATE NOT NULL, -- YYYY-MM-DD
  survey_completed BOOLEAN DEFAULT FALSE,
  has_chatted BOOLEAN DEFAULT FALSE, -- explizites Feld für "wurde gechatted"
  survey_data JSONB, -- Speichert die Umfrageergebnisse flexibel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(study_id, date)
);

-- 3. Tabelle für Nachrichten (Chatverlauf)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES daily_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' oder 'model'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Optional: Row Level Security (RLS) aktivieren
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Erlaube öffentlichen Zugriff (für Demo/Prototyp Zwecke)
CREATE POLICY "Allow public access" ON participants FOR ALL USING (true);
CREATE POLICY "Allow public access" ON daily_sessions FOR ALL USING (true);
CREATE POLICY "Allow public access" ON messages FOR ALL USING (true);