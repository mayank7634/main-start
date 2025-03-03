// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    displayUserInfo(user);
}

// Display user information
function displayUserInfo(user) {
    // Update the header user display
    document.getElementById('userDisplay').textContent = `Welcome, ${user.fullname}`;

    // Update profile information
    document.getElementById('profileName').textContent = user.fullname;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileUsername').textContent = user.username;
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Check authentication when page loads
checkAuth(); 