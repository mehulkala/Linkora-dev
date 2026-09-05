CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    click_count BIGINT DEFAULT 0,
    user_id INTEGER,
    expires_at TIMESTAMPTZ,

    CONSTRAINT urls_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);