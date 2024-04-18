

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(60) PRIMARY KEY,
    password VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS majors;
CREATE TABLE  majors(
    major_name VARCHAR(50) PRIMARY KEY
    -- major_description CHAR(60)
);

DROP TABLE IF EXISTS projects;
CREATE TABLE projects (
    project_name VARCHAR(50) PRIMARY KEY,
    project_description CHAR(500) NOT NULL,
    project_image TEXT 
);

DROP TABLE IF EXISTS user_projects;
CREATE TABLE user_projects (
    username VARCHAR(50) NOT NULL REFERENCES users(username),
    project_name VARCHAR(50) NOT NULL REFERENCES projects(project_name),
    project_image TEXT
);

DROP TABLE IF EXISTS user_majors;
CREATE TABLE user_majors(
  username VARCHAR(50) NOT NULL REFERENCES users(username),
  major_name VARCHAR(50) NOT NULL REFERENCES majors(major_name)
);

CREATE TABLE IF NOT EXISTS categories (
 category_name VARCHAR(60) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS user_category (
	username VARCHAR(60) NOT NULL REFERENCES users(username),
  category_name VARCHAR(60) NOT NULL REFERENCES categories(category_name)
);

DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_username VARCHAR(255) REFERENCES users(username),
    receiver_username VARCHAR(255) REFERENCES users(username),
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS project_likes;
CREATE TABLE project_likes (
    project_name VARCHAR(50) REFERENCES projects(project_name),
    username VARCHAR(255) REFERENCES users(username),
    UNIQUE (project_name, username)
);

DROP TABLE IF EXISTS group_messages;
CREATE TABLE group_messages (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255),
    sender_username VARCHAR(255),
    message_text TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS group_members;
CREATE TABLE group_members (
    username VARCHAR(255),
    group_name VARCHAR(255),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, group_name)
);


