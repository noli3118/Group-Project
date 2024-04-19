
INSERT INTO majors (major_name) VALUES
('Computer Science'),
('Aerospace Engineering Sciences'),
('Applied Mathematics'),
('Architectural Engineering'),
('Biomedical Engineering'),
('Chemical and Biological Engineering'),
('Chemical Engineering'),
('Civil Engineering'),
('Creative Technology & Design (ATLAS)'),
('Electrical Engineering'),
('Electrical and Computer Engineering'),
('Engineering Physics'),
('Environmental Engineering'),
('Integrated Design Engineering'),
('Mechanical Engineering');

INSERT INTO projects (project_name, project_description, project_image) VALUES
('LUUM PoE Distribution Upgrade', 'Our sponsor LUUM provides a high-power Power over Ethernet system called X-PoE. This system provides up to 120 W through CAT5 Ethernet wires. This is then connected to USB-C power outlets. Our project is to upgrade this system to permit connecting outlets in series, rather than in parallel. This results in greatly reduced material costs and optimal power distribution within a building.', NULL),
('Test Project 1', '4/16 4:22 Neena creating a test project', NULL),
('Test Project 2', 'Test Project 2 - 4/16 6:16', NULL),
('Test 3 Image', 'Test 3 w Image 4/16 6:38', NULL),
('Test 4 IMAGE', 'Test 4 with an IMAGE 4/16 6:45', '743b00813fc12bc525883337821208e8'),
('Test Project During Meeting', '4/17 5:02 Test w/ Image', 'facbb0f5ebfb21c6f819f17905cc3630');

INSERT INTO users (username, password) VALUES
('connor', '$2b$10$kzETpYPdOE88tSy5XdRAaOwuIILLfp5W1hkbugR.jC/hR2EOmlcki'),
('johndoe', '$2b$10$QDtY3f9/pPRhYKL.EYv63OxV2XG0Qrwp0ELQyx1RXsGi83iJmpS5u'),
('neena', '$2b$10$PglqFSWMjEUrrX6TduyTOe8hujJOsnlxMC0z.m4QgWBmKC9HVlZhq'),
('TEST', '$2b$10$2QVwpqhqDk0ekfOI4IYQSO6S/hGpb2zBz1RYwQJY2Yx3qafdUyIRW'),
('neenatestuser', '$2b$10$8hfg8SveYhj.Mbn60lsZ0etokTaPfn2.NkTTX7u1f7ZKzKOrOnhH6');

INSERT INTO messages (sender_username, receiver_username, message_text, sent_at) VALUES
('neenatestuser', 'TEST', 'hi!', '2024-04-17 06:08:21.429176'),
('TEST', 'neena', 'howdy!', '2024-04-17 06:21:02.698427'),
('TEST', 'neena', 'How are you?', '2024-04-17 21:52:08.960972'),
('neenatestuser', 'TEST', 'How are you!', '2024-04-17 21:52:57.641208'),
('neenatestuser', 'TEST', 'I am good!', '2024-04-17 22:01:54.1078'),
('neenatestuser', 'TEST', 'I am working on a new project!', '2024-04-17 22:02:09.697118'),
('TEST', 'neenatestuser', 'That''s so cool! what kind of project?', '2024-04-17 22:12:04.70412'),
('TEST', 'neenatestuser', 'When did you start?', '2024-04-17 22:15:11.870504'),
('TEST', 'neenatestuser', 'I am working on a new project too!', '2024-04-17 22:28:41.908964'),
('TEST', 'neenatestuser', 'Test Message during Meeting 5:03', '2024-04-17 23:03:32.408801');

INSERT INTO user_majors (username, major_name) VALUES
('connor', 'Electrical and Computer Engineering'),
('johndoe', 'Mechanical Engineering'),
('neena', 'Computer Science'),
('TEST', 'Computer Science'),
('neenatestuser', 'Computer Science');


INSERT INTO user_projects (username, project_name, project_image) VALUES
('connor', 'LUUM PoE Distribution Upgrade', NULL),
('TEST', 'Test Project 1', NULL),
('TEST', 'Test Project 2', NULL),
('TEST', 'Test 3 Image', NULL),
('TEST', 'Test 4 IMAGE', NULL),
('TEST', 'Test Project During Meeting', NULL);

INSERT INTO project_likes (project_name, username) VALUES
('LUUM PoE Distribution Upgrade', 'TEST'),
('Test 3 Image', 'TEST'),
('Test 4 IMAGE', 'TEST'),
('Test Project 1', 'TEST'),
('Test Project 2', 'TEST'),
('LUUM PoE Distribution Upgrade', 'neenatestuser'),
('Test 3 Image', 'neenatestuser'),
('Test 4 IMAGE', 'neenatestuser'),
('Test Project 1', 'neenatestuser'),
('Test Project During Meeting', 'TEST');



INSERT INTO categories (category_name) VALUES ('Software Development');
INSERT INTO categories (category_name) VALUES ('Cyber Security');
INSERT INTO categories (category_name) VALUES ('Literature and Writing');