INSERT INTO users
    (username, password)
    VALUES
        (
            'connor',
            '$2b$10$kzETpYPdOE88tSy5XdRAaOwuIILLfp5W1hkbugR.jC/hR2EOmlcki' --this translates to 'password'
        );

INSERT INTO projects
    (project_name, project_description)
    VALUES  
        (
            'LUUM PoE Distribution Upgrade',
            'Our sponsor LUUM provides a high-power Power over Ethernet system called X-PoE. This system provides up to 120 W through CAT5 Ethernet wires. This is then connected to USB-C power outlets. Our project is to upgrade this system to permit connecting outlets in series, rather than in parallel. This results in greatly reduced material costs and optimal power distribution within a building.'
        );

INSERT INTO user_projects
    (username, project_name)
    VALUES 
        (
            'connor',
            'LUUM PoE Distribution Upgrade'
        );

INSERT INTO majors
    (major_name)
    VALUES
        (
            'Aerospace Engineering Sciences'
        ),
        (
            'Applied Mathematics'
        ),
        (
            'Architectural Engineering'
        ),
        (
            'Biomedical Engineering'
        ),
        (
            'Chemical & Biological Engineering'
        ),
        (
            'Chemical Engineering'
        ),
        (
            'Civil Engineering'
        ),
        (
            'Computer Science'
        ),
        (
            'Creative Technology & Design (ATLAS)'
        ),
        (
            'Electrical & Computer Engineering'
        ),
        (
            'Electrical Engineering'
        ),
        (
            'Engineering Physics'
        ),
        (
            'Environmental Engineering'
        ),
        (
            'Integrated Design Engineering'
        ),
        (
            'Mechanical Engineering'
        );

INSERT INTO user_majors
    (username, major_name)
    VALUES 
        (
            'connor',
            'Electrical & Computer Engineering'
        );

INSERT INTO categories (category_name) VALUES ('Software Development');
INSERT INTO categories (category_name) VALUES ('Cyber Security');
INSERT INTO categories (category_name) VALUES ('Literature and Writing');