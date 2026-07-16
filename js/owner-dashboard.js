/* ==========================================
   Green Autos Fleet Management System
   Owner Dashboard
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();
     
    // Listen for storage changes from other pages
    window.addEventListener('storageSync', function(e) {
        loadDashboard();
    });

});

function loadDashboard() {

    const vehicles = getVehicles();
    const drivers = getDrivers();
    const users = getSystemUsers();
    const expenses = getExpenses();
    const collections = getCashCollections();
    const maintenance = getMaintenance();
    const activities = getStorageData(StorageKeys.ACTIVITY_LOGS, []);

    /* Dashboard Cards */

    document.getElementById("totalVehicles").innerText =
        vehicles.length;

    document.getElementById("totalDrivers").innerText =
        drivers.length;

    document.getElementById("totalUsers").innerText =
        users.length;

    /* Expense Summary */

    let totalExpense = 0;
    let fuelExpense = 0;
    let maintenanceExpense = 0;
    let otherExpense = 0;

    expenses.forEach(exp => {

        const amount = Number(exp.amount) || 0;

        totalExpense += amount;

        if (exp.category === "Fuel") {

            fuelExpense += amount;

        } else if (exp.category === "Maintenance") {

            maintenanceExpense += amount;

        } else {

            otherExpense += amount;

        }

    });

    document.getElementById("totalExpenses").innerText =
        "Rs " + totalExpense;

    document.getElementById("expenseTotal").innerText =
        "Rs " + totalExpense;

    document.getElementById("fuelExpense").innerText =
        "Rs " + fuelExpense;

    document.getElementById("maintenanceExpense").innerText =
        "Rs " + maintenanceExpense;

    document.getElementById("otherExpense").innerText =
        "Rs " + otherExpense;

    /* Cash Collection */

    let totalCollection = 0;

    collections.forEach(item => {

        totalCollection += Number(item.amount) || 0;

    });

    document.getElementById("totalCollection").innerText =
        "Rs " + totalCollection;

    document.getElementById("todayCollection").innerText =
        "Rs " + totalCollection;

    document.getElementById("monthCollection").innerText =
        "Rs " + totalCollection;

    document.getElementById("pendingCollection").innerText =
        "Rs 0";

    updateFleetStatus(vehicles);

    updateUserOverview(users);

    loadRecentActivity(activities);

    updateFooter();

}
/* ==========================================
   Fleet Status
========================================== */

function updateFleetStatus(vehicles) {

    const available =
        vehicles.filter(v => v.status === "Available").length;

    const trip =
        vehicles.filter(v => v.status === "On Trip").length;

    const maintenance =
        vehicles.filter(v => v.status === "Maintenance").length;

    const total = vehicles.length || 1;

    document.getElementById("availableVehicles").innerText =
        available;

    document.getElementById("tripVehicles").innerText =
        trip;

    document.getElementById("maintenanceVehicles").innerText =
        maintenance;

    document.getElementById("availableBar").style.width =
        ((available / total) * 100) + "%";

    document.getElementById("tripBar").style.width =
        ((trip / total) * 100) + "%";

    document.getElementById("maintenanceBar").style.width =
        ((maintenance / total) * 100) + "%";

}

/* ==========================================
   User Overview
========================================== */

function updateUserOverview(users) {

    const owners =
        users.filter(u => u.role === "owner").length;

    const admins =
        users.filter(u => u.role === "admin").length;

    const entries =
        users.filter(u => u.role === "entry").length;

    const active =
        users.filter(u => u.status === "Active").length;

    document.getElementById("ownerCount").innerText =
        owners;

    document.getElementById("adminCount").innerText =
        admins;

    document.getElementById("entryCount").innerText =
        entries;

    document.getElementById("activeCount").innerText =
        active;

}

/* ==========================================
   Recent Activity
========================================== */

function loadRecentActivity(logs) {

    const box =
        document.getElementById("recentActivity");

    if (!box) return;

    if (logs.length === 0) {

        box.innerHTML = `

        <div class="text-center text-muted py-5">

            No Recent Activity

        </div>

        `;

        return;

    }

    box.innerHTML = "";

    logs.slice(-5).reverse().forEach(log => {

        box.innerHTML += `

        <div class="border-bottom py-2">

            <strong>

                ${log.user || "System"}

            </strong>

            <br>

            <small class="text-muted">

                ${log.type || log.action || ""}

            </small>

            <br>

            <small>

                ${log.date || ""}

            </small>

        </div>

        `;

    });

}

/* ==========================================
   Footer
========================================== */

function updateFooter() {

    const user = getCurrentUser();

    if (!user) return;

    const footer =
        document.getElementById("footerUser");

    if (footer) {

        footer.innerText = user.name;

    }

}

/* ==========================================
   Auto Refresh Dashboard
========================================== */

setInterval(() => {

    loadDashboard();

}, 5000);