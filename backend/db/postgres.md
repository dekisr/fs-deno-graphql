## 1. Create uuid extension

CREATE EXTENSION "uuid-ossp";

## 2. Create table and schema

CREATE TABLE IF NOT EXISTS users (
id uuid DEFAULT uuid_generate_v4 (),
username TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
token_version INT NOT NULL CHECK (token_version >= 0) DEFAULT 0,
reset_password_token TEXT,
reset_password_token_expiry BIGINT CHECK (reset_password_token_expiry >= 0),
facebook_id TEXT,
google_id TEXT,
roles TEXT [] NOT NULL DEFAULT ARRAY ['CLIENT'],
created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
