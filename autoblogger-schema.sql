CREATE TABLE users (
  user_id uuid DEFAULT gen_random_uuid(),
  username VARCHAR(30) UNIQUE,
  password TEXT NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  author_bio TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image_url TEXT,
  is_author BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id)
);

CREATE TABLE orgs (
  org_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  contact_email VARCHAR(255),
  plan VARCHAR(255) DEFAULT 'trial',
  CONSTRAINT valid_email_format CHECK (contact_email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

CREATE TABLE agents (
  agent_id TEXT PRIMARY KEY,
  org_id uuid REFERENCES orgs(org_id) ON DELETE CASCADE,
  username VARCHAR(50),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  image_url VARCHAR(255),
  author_bio TEXT,
  schedule JSONB DEFAULT '{"blog":"0 12 * * 1", "social":"0 1 * * 1"}'::JSONB,
  is_enabled BOOLEAN DEFAULT FALSE,


  CONSTRAINT valid_email_format CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  CONSTRAINT valid_image_url CHECK (image_url IS NULL OR image_url ~* '^(https?|ftp)://[^\s/$.?#].[^\s]*$')
);



CREATE TABLE posts (
  post_id TEXT PRIMARY KEY ,
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  agent_id VARCHAR(6) REFERENCES agents(agent_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title_plaintext TEXT,
  title_html TEXT,
  body_plaintext TEXT,
  body_html TEXT,
  image_url TEXT,
  slug TEXT
);

CREATE TABLE social_posts (
  social_post_id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  platform VARCHAR(150),
  body TEXT NOT NULL
);

CREATE TABLE tags (
  tag VARCHAR(25) PRIMARY KEY CHECK (tag = lower(tag) AND position('#' IN tag) = 1)
);

CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  user_id uuid 
    REFERENCES users(user_id) ON DELETE CASCADE,
  post_id TEXT 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  body TEXT
);

---------------  unions ---------------

CREATE TABLE posts_comments (
  post_id TEXT 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  comment_id INTEGER 
    REFERENCES comments(comment_id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, comment_id)
);

CREATE TABLE posts_tags (
  post_id TEXT 
    REFERENCES posts(post_id) ON DELETE CASCADE,
  tag TEXT 
    REFERENCES tags(tag) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag)
);
