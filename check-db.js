const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to the users database.');
    
    // Query all users
    db.all('SELECT id, fullname, email, username FROM users', [], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return;
        }
        
        // Display all users (excluding passwords for security)
        console.log('\nRegistered Users:');
        console.log('----------------');
        rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Name: ${row.fullname}`);
            console.log(`Email: ${row.email}`);
            console.log(`Username: ${row.username}`);
            console.log('----------------');
        });
        
        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
                return;
            }
            console.log('Database connection closed.');
        });
    });
}); 