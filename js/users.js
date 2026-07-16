/* ==========================================
   Green Autos Fleet Management System
   Users Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    updateUserCards();
});

function loadUsers() {
    const table = document.getElementById("usersTable");
    if (!table) return;
    const users = getSystemUsers();
    table.innerHTML = "";
    if (!users.length) {
        table.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No users found</td></tr>';
        return;
    }
    users.forEach((user, index) => {
        table.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${index + 1}</td>
                <td>${user.name || "-"}</td>
                <td>${user.username || "-"}</td>
                <td>${user.email || "-"}</td>
                <td>${user.phone || "-"}</td>
                <td>${user.vendorId || "-"}</td>
                <td>${user.role || "-"}</td>
                <td>${user.status || "Active"}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-1" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `);
    });
}

function updateUserCards() {
    const users = getSystemUsers();
    const total = document.getElementById("totalUsers");
    const admin = document.getElementById("adminUsers");
    const vendor = document.getElementById("vendorUsers");
    if (total) total.innerText = users.length;
    if (admin) admin.innerText = users.filter(user => user.role === "admin").length;
    if (vendor) vendor.innerText = users.filter(user => user.role === "vendor").length;
}

const userForm = document.getElementById("userForm");
if (userForm) {
    userForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const users = getSystemUsers();
        const role = document.getElementById("userRole").value;
        const username = document.getElementById("userUsername").value.trim();
        const name = document.getElementById("userName").value.trim();
        const password = document.getElementById("userPassword").value;

        if (!name || !username || !password) { alert("Please fill all required user fields"); return; }
        const duplicate = users.find(user => String(user.username).toLowerCase() === String(username).toLowerCase());
        if (duplicate) { alert("Username already exists"); return; }

        const email = document.getElementById("userEmail").value.trim();
        const phone = document.getElementById("userPhone").value.trim();

        // Link to existing vendor if role is vendor and emails match
        let vendorId = null;
        if (role === "vendor" && email) {
            const matchedVendor = getVendors().find(v => String(v.email || "").toLowerCase() === String(email).toLowerCase());
            if (matchedVendor) {
                vendorId = matchedVendor.id;
            }
        }

        const newUser = {
            id: Date.now(),
            name,
            username,
            email,
            phone,
            vendorId: vendorId,
            role,
            status: document.getElementById("userStatus").value,
            password
        };

        users.push(newUser);
        saveSystemUsers(users);

        // Inform if vendor user was not linked
        if (role === "vendor" && !vendorId) {
            alert("Vendor user created but no matching Vendor record found for this email. Create the vendor first or update the vendor email to match.");
        }

        addActivityLog("User", `User added: ${name}`);
        userForm.reset();
        loadUsers();
        updateUserCards();
        alert("User added successfully");
    });
}

function deleteUser(id) {
    if (!confirm("Delete this user?")) return;
    const users = getSystemUsers().filter(user => String(user.id) !== String(id));
    saveSystemUsers(users);
    loadUsers();
    updateUserCards();
    addActivityLog("User", "User deleted");
}

function editUser(id) {
    const user = getSystemUsers().find(u => String(u.id) === String(id));
    if (!user) return;
    document.getElementById("editUserId").value = user.id;
    document.getElementById("editUserName").value = user.name || "";
    document.getElementById("editUserRole").value = user.role || "";
    document.getElementById("editUserStatus").value = user.status || "Active";
    try { new bootstrap.Modal(document.getElementById("editUserModal")).show(); } catch (err) {}
}

const updateBtn = document.getElementById("updateUserBtn");
if (updateBtn) {
    updateBtn.addEventListener("click", function () {
        const id = Number(document.getElementById("editUserId").value);
        const users = getSystemUsers().map(user => {
            if (String(user.id) === String(id)) {
                user.name = document.getElementById("editUserName").value.trim();
                const newRole = document.getElementById("editUserRole").value;
                user.role = newRole;
                user.status = document.getElementById("editUserStatus").value;

                // Maintain or update vendorId based on role and matching vendor email
                if (newRole === "vendor") {
                    const matchedVendor = getVendors().find(v => String(v.email || "").toLowerCase() === String(user.email || "").toLowerCase());
                    if (matchedVendor) {
                        user.vendorId = matchedVendor.id;
                    } else {
                        // keep existing vendorId if present, otherwise null
                        user.vendorId = user.vendorId || null;
                    }
                } else {
                    // clear vendor association when role is not vendor
                    user.vendorId = null;
                }
            }
            return user;
        });
        saveSystemUsers(users);
        loadUsers();
        updateUserCards();
        try { bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide(); } catch (err) {}
        addActivityLog("User", "User updated");
        alert("User updated successfully");
    });
}

const search = document.getElementById("searchUsers");
if (search) {
    search.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        document.querySelectorAll("#usersTable tr").forEach((row) => {
            row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
        });
    });
}
