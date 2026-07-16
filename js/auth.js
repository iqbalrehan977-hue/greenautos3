/* Auth helpers using centralized storage.js */

function loginUser(username, password, role) {
    // Validate inputs
    if (!username || !password || !role) return { success: false, message: 'Missing credentials.' };

    const users = getSystemUsers();
    const found = users.find(u => String(u.username) === String(username) && String(u.password) === String(password) && String(u.role) === String(role) && (u.status === 'Active' || !u.status));

    if (!found) {
        return { success: false, message: 'Invalid credentials or inactive user.' };
    }

    // Save session
    const sessionUser = Object.assign({}, found, { lastLogin: new Date().toISOString() });
    saveCurrentUser(sessionUser);
    setStorageData(StorageKeys.ROLE, sessionUser.role);
    addActivityLog('Login', `${sessionUser.name || sessionUser.username} logged in as ${sessionUser.role}`);
    return { success: true, user: sessionUser };
}

function requireRole(allowedRoles) {
    const current = getCurrentUser();
    if (!current) return false;
    return allowedRoles.includes(current.role);
}

// Expose
window.loginUser = loginUser;
window.requireRole = requireRole;