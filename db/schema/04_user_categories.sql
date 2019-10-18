DROP TABLE IF EXISTS user_categories CASCADE;

CREATE TABLE user_categories (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
)
