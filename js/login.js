/* ==========================================
   Green Autos Fleet Management System
   Login System
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorBox = document.getElementById("error");

    const ensureUsers = () => {
        let users = getSystemUsers();
        let changed = false;

        if (!users.some(user => user.username === "admin")) {
            users.push({ id: 1, name: "Administrator", username: "admin", password: "admin123", email: "admin@greenautos.com", phone: "03001234567", role: "admin", status: "Active" });
            changed = true;
        }
        if (!users.some(user => user.username === "user")) {
            users.push({ id: 2, name: "Office User", username: "user", password: "user123", email: "user@greenautos.com", phone: "03009876543", role: "user", status: "Active" });
            changed = true;
        }
        if (!users.some(user => user.username === "vendor")) {
            users.push({ id: 3, name: "Vendor User", username: "vendor", password: "vendor123", email: "vendor@greenautos.com", phone: "03001122334", role: "vendor", vendorId: 101, status: "Active" });
            changed = true;
        }
        if (changed) {
            saveSystemUsers(users);
        }
        return getSystemUsers();
    };

    ensureUsers();

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const role = document.getElementById("role").value;

            if (errorBox) {
                errorBox.innerHTML = "";
            }

            if (!username || !password || !role) {
                if (errorBox) errorBox.innerHTML = "Please fill all fields.";
                return;
            }

            const users = ensureUsers();
            const loggedUser = users.find(user =>
                user.username === username &&
                user.password === password &&
                user.role === role &&
                (user.status === "Active" || !user.status)
            );

            if (!loggedUser) {
                if (errorBox) errorBox.innerHTML = "Invalid username, password, or role.";
                return;
            }

            const sessionUser = Object.assign({}, loggedUser, { lastLogin: new Date().toISOString() });
            saveCurrentUser(sessionUser);
            setStorageData(StorageKeys.ROLE, sessionUser.role);
            addActivityLog("Login", `${sessionUser.name || sessionUser.username} logged in as ${sessionUser.role}`);

            setTimeout(() => {
                if (sessionUser.role === "admin") {
                    window.location.href = "./admin/dashboard.html";
                } else if (sessionUser.role === "user") {
                    window.location.href = "./user/dashboard.html";
                } else if (sessionUser.role === "vendor") {
                    window.location.href = "./vendor/dashboard.html";
                } else {
                    if (errorBox) errorBox.innerHTML = "Invalid user role.";
                }
            }, 100);
        });
    }
});
