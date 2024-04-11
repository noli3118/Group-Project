DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
 username VARCHAR(60) PRIMARY KEY,
 password VARCHAR(60) NOT NULL
);

DROP TABLE IF EXISTS projects;
CREATE TABLE  projects(
    project_name VARCHAR(50) PRIMARY KEY,
    project_description CHAR(500) NOT NULL
);

DROP TABLE IF EXISTS user_projects;
CREATE TABLE user_projects (
  username VARCHAR(50) NOT NULL REFERENCES users(username),
  project_name VARCHAR(50) NOT NULL REFERENCES projects(project_name)
);

DROP TABLE IF EXISTS user_majors;
CREATE TABLE user_majors(
  username VARCHAR(50) NOT NULL REFERENCES users(username),
  major_name VARCHAR(50) NOT NULL REFERENCES majors(major_name)
);