// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('http://localhost:3000/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // Display user information
        displayUserInfo(data.user);
        
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
    }
}

// Display user information
function displayUserInfo(user) {
    // Update navigation bar
    document.getElementById('userDisplay').textContent = `Welcome, ${user.fullname}`;
    
    // Update profile section
    document.getElementById('profileName').textContent = user.fullname;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileUsername').textContent = user.username;
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async function() {
    try {
        const response = await fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Check auth when page loads
checkAuth(); 