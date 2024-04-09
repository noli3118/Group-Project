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