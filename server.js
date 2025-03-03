const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// First, create a connection without database selected
const initialConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mayank'
});

// Create database if it doesn't exist
initialConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    
    initialConnection.query('CREATE DATABASE IF NOT EXISTS job_portal', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database created or already exists');
        
        // Close the initial connection
        initialConnection.end();
        
        // Create the main connection with the database selected
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mayank',
            database: 'job_portal'
        });

        // Connect to MySQL with database selected
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }
            console.log('Connected to MySQL database');

            // Create users table if it doesn't exist
            const createUsersTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    fullname VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            connection.query(createUsersTableQuery, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }
                console.log('Users table created or already exists');
            });

            // Create applications table if it doesn't exist
            const createApplicationsTableQuery = `
                CREATE TABLE IF NOT EXISTS applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    college_name VARCHAR(100) NOT NULL,
                    phone_number VARCHAR(15) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    age INT NOT NULL,
                    technical_skills TEXT NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            connection.query(createApplicationsTableQuery, (err) => {
                if (err) {
                    console.error('Error creating applications table:', err);
                    return;
                }
                console.log('Applications table created or already exists');
            });
        });

        // Handle user login
        app.post('/login', async (req, res) => {
            try {
                const { username, password } = req.body;

                // Validate required fields
                if (!username || !password) {
                    return res.status(400).json({ error: 'Username and password are required' });
                }

                // Find user by username
                connection.query(
                    'SELECT * FROM users WHERE username = ?',
                    [username],
                    async (err, results) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Error checking user credentials' });
                        }

                        if (results.length === 0) {
                            return res.status(401).json({ error: 'Invalid username or password' });
                        }

                        const user = results[0];

                        // Compare password
                        const validPassword = await bcrypt.compare(password, user.password);
                        if (!validPassword) {
                            return res.status(401).json({ error: 'Invalid username or password' });
                        }

                        // Create user object without password
                        const userResponse = {
                            id: user.id,
                            fullname: user.fullname,
                            email: user.email,
                            username: user.username
                        };

                        res.json({
                            message: 'Login successful',
                            user: userResponse
                        });
                    }
                );
            } catch (error) {
                console.error('Server error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Handle user registration
        app.post('/register', async (req, res) => {
            try {
                const { fullname, email, username, password } = req.body;

                // Validate required fields
                if (!fullname || !email || !username || !password) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Check if user already exists
                connection.query(
                    'SELECT * FROM users WHERE email = ? OR username = ?',
                    [email, username],
                    (err, results) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Error checking user existence' });
                        }

                        if (results.length > 0) {
                            return res.status(400).json({ error: 'Email or username already exists' });
                        }

                        // Insert new user
                        const query = `
                            INSERT INTO users (fullname, email, username, password)
                            VALUES (?, ?, ?, ?)
                        `;

                        connection.query(
                            query,
                            [fullname, email, username, hashedPassword],
                            (err, results) => {
                                if (err) {
                                    console.error('Error creating user:', err);
                                    return res.status(500).json({ error: 'Failed to create user' });
                                }
                                res.json({ message: 'User registered successfully', id: results.insertId });
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Server error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Handle job application submissions
        app.post('/api/apply', (req, res) => {
            try {
                const {
                    applicantName,
                    collegeName,
                    phoneNumber,
                    position,
                    age,
                    technicalSkills,
                    email
                } = req.body;

                // Validate required fields
                if (!applicantName || !collegeName || !phoneNumber || !position || !age || !technicalSkills || !email) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                const query = `
                    INSERT INTO applications 
                    (full_name, college_name, phone_number, position, age, technical_skills, email)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(
                    query,
                    [applicantName, collegeName, phoneNumber, position, age, technicalSkills, email],
                    (err, results) => {
                        if (err) {
                            console.error('Error saving application:', err);
                            return res.status(500).json({ error: 'Failed to save application' });
                        }
                        res.json({ message: 'Application submitted successfully', id: results.insertId });
                    }
                );
            } catch (error) {
                console.error('Server error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 