INSERT INTO users
    (username, passcode, fullname, age, major)
    VALUES
        (
            'connor',
            '$2b$10$kzETpYPdOE88tSy5XdRAaOwuIILLfp5W1hkbugR.jC/hR2EOmlcki',
            'connor smith',
            '21',
            'computer science'--this translates to 'password'
        );

INSERT INTO projects
    (title, description, authorid, date)
    VALUES  
        (
            'LUUM PoE Distribution Upgrade',
            'Our sponsor LUUM provides a high-power Power over Ethernet system called X-PoE. This system provides up to 120 W through CAT5 Ethernet wires. This is then connected to USB-C power outlets. Our project is to upgrade this system to permit connecting outlets in series, rather than in parallel. This results in greatly reduced material costs and optimal power distribution within a building.',
            '2',
            getdate()
        );

INSERT INTO comments
    (authorid, body, timestamp, projectid)
    VALUES 
        (
            'connor',
            'LUUM PoE Distribution Upgrade',
            current_timestamp,
            '12'
        );
