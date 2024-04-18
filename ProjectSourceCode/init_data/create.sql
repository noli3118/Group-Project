-- DROP TABLE IF EXISTS group_members;
-- DROP TABLE IF EXISTS group_messages;
-- DROP TABLE IF EXISTS project_likes;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS user_category;
-- DROP TABLE IF EXISTS user_majors;
-- DROP TABLE IF EXISTS user_projects;
-- DROP TABLE IF EXISTS projects;
-- DROP TABLE IF EXISTS majors;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS categories;

CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    password VARCHAR(60) NOT NULL
);

CREATE TABLE majors (
    major_name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE projects (
    project_name VARCHAR(255) UNIQUE PRIMARY KEY,
    project_description TEXT NOT NULL,
    project_image TEXT
);

CREATE TABLE user_projects (
    project_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL REFERENCES projects(project_name) ON DELETE CASCADE,
    project_image TEXT
);

CREATE TABLE user_majors (
    major_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    major_name VARCHAR(255) NOT NULL REFERENCES majors(major_name) ON DELETE CASCADE
);

CREATE TABLE categories (
    category_name VARCHAR(255) PRIMARY KEY
);

CREATE TABLE user_category (
    category_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    category_name VARCHAR(255) NOT NULL REFERENCES categories(category_name) ON DELETE CASCADE
);

CREATE TABLE messages (
    messages_id SERIAL PRIMARY KEY,
    sender_username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
    receiver_username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_likes (
    likes_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) REFERENCES projects(project_name) ON DELETE CASCADE,
    username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
    UNIQUE (project_name, username)
);

CREATE TABLE group_messages (
    group_message_id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) REFERENCES categories(category_name) ON DELETE CASCADE,
    sender_username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
    message_text TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    username VARCHAR(255) REFERENCES users(username) ON DELETE CASCADE,
    group_name VARCHAR(255) REFERENCES categories(category_name) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, group_name)
);