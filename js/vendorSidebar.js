/* ==========================================
   Green Autos
   Vendor Sidebar
========================================== */


function loadVendorSidebar(){

    let sidebar = `

<div class="sidebar">

    <div class="sidebar-brand">

        <h3>
            <i class="bi bi-car-front"></i>
            Green Autos
        </h3>

        <p>Vendor Panel</p>

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
                My Vehicles
            </a>
        </li>

        <li>
            <a href="maintenance.html">
                <i class="bi bi-tools"></i>
                Maintenance Requests
            </a>
        </li>

        <li>
            <a href="serviceHistory.html">
                <i class="bi bi-clock-history"></i>
                Service History
            </a>
        </li>

        <li>
            <a href="payments.html">
                <i class="bi bi-cash-stack"></i>
                Payments
            </a>
        </li>

        <li>
            <a href="profile.html">
                <i class="bi bi-person-circle"></i>
                Profile
            </a>
        </li>

        <li>
            <a href="admin/index.html" onclick="logoutUser(event); return false;">
                <i class="bi bi-box-arrow-right"></i>
                Logout
            </a>
        </li>

    </ul>

</div>

`;

    document.getElementById("sidebar").innerHTML = sidebar;

}


document.addEventListener("DOMContentLoaded", loadVendorSidebar);

// Logout uses centralized logoutUser() from storage.js
