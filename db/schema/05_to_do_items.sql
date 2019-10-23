-- Drop and recreate Widgets table (Example)

DROP TABLE IF EXISTS to_do_items CASCADE;
CREATE TABLE to_do_items (
  id SERIAL PRIMARY KEY NOT NULL,
  date_created TIMESTAMP DEFAULT NOW,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status_id INTEGER REFERENCES status(id) ON DELETE CASCADE,
  important BOOLEAN DEFAULT false
);
