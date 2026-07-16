/* ==========================================
   Green Autos
   Admin Sidebar
========================================== */

function loadAdminSidebar() {

let sidebar = `

<div class="sidebar">

    <div class="sidebar-brand">

        <h3>
            <i class="bi bi-car-front-fill"></i>
            Green Autos
        </h3>

        <p>Admin Panel</p>

    </div>

    <ul class="sidebar-menu">

        <li>
            <a href="dashboard.html">
                <i class="bi bi-speedometer2"></i>
                Dashboard
            </a>
        </li>
        
        <li>
            <a href="vehicles.html">
                <i class="bi bi-car-front-fill"></i>
                Vehicles
            </a>
        </li>
        
        <li>
            <a href="assignments.html">
                <i class="bi bi-clipboard-check"></i>
                Assignments
            </a>
        </li>

        <li>
            <a href="drivers.html">
                <i class="bi bi-person-badge"></i>
                Drivers
            </a>
        </li>

        <li>
            <a href="expenses.html">
                <i class="bi bi-cash-stack"></i>
                Expenses
            </a>
        </li>

        <li>
            <a href="cash-collection.html">
                <i class="bi bi-wallet2"></i>
                Cash Collection
            </a>
        </li>

        <li>
            <a href="maintenance.html">
                <i class="bi bi-tools"></i>
                Maintenance
            </a>
        </li>

        <li>
            <a href="reports.html">
                <i class="bi bi-bar-chart-line"></i>
                Reports
            </a>
        </li>

        <li>
            <a href="users.html">
                <i class="bi bi-people"></i>
                Users
            </a>
        </li>

        <li>
            <a href="vendors.html">
                <i class="bi bi-shop"></i>
                Vendors
            </a>
        </li>

        <li>
            <a href="activity.html">
                <i class="bi bi-clock-history"></i>
                Activity Log
            </a>
        </li>

        <li>
            <a href="profile.html">
                <i class="bi bi-person-circle"></i>
                Profile
            </a>
        </li>

        <li>
            <a href="../index.html" onclick="logoutUser(event); return false;">
                <i class="bi bi-box-arrow-right"></i>
                Logout
            </a>
        </li>

    </ul>

</div>

`;

let sidebarBox = document.getElementById("sidebar") || document.getElementById("adminSidebar");

if(sidebarBox){
    sidebarBox.innerHTML = sidebar;
}
}

document.addEventListener("DOMContentLoaded", loadAdminSidebar);

// Use centralized logout function from storage.js
// The sidebar's logout link calls logoutUser(event) which is defined globally in storage.js
