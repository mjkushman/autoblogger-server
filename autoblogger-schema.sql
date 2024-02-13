CREATE TABLE users (
  user_id uuid DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  author_bio TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

CREATE TABLE posts (
  post_id SERIAL PRIMARY KEY ,
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title_plaintext TEXT,
  body_plaintext TEXT,
  body_html TEXT
);

CREATE TABLE tags (
  tag VARCHAR(25) PRIMARY KEY CHECK (tag = lower(tag) AND position('#' IN tag) = 1)
);

CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  user_id uuid 
    REFERENCES users(user_id) ON DELETE CASCADE,
  post_id INTEGER 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  body TEXT
);

---------------  unions ---------------

CREATE TABLE posts_comments (
  post_id INTEGER 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  comment_id INTEGER 
    REFERENCES comments(comment_id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, comment_id)
);

CREATE TABLE posts_tags (
  post_id INTEGER 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  tag TEXT 
    REFERENCES tags(tag) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag)
);
