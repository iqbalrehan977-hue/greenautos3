/* ==========================================
   Green Autos Fleet Management System
   Admin Dashboard
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const updateDashboard = () => {
        const vehicles = getVehicles();
        const drivers = getDrivers();
        const maintenance = getMaintenance();
        const expenses = getExpenses();
        const users = getSystemUsers();
        const currentUser = getCurrentUser();

        const vehicleCount = document.getElementById("vehicleCount");
        const driverCount = document.getElementById("driverCount");
        const maintenanceCount = document.getElementById("maintenanceCount");
        const expenseCount = document.getElementById("expenseCount");
        const userCount = document.getElementById("userCount");
        const adminName = document.getElementById("adminName");

        if (vehicleCount) vehicleCount.innerText = vehicles.length;
        if (driverCount) driverCount.innerText = drivers.length;
        if (maintenanceCount) maintenanceCount.innerText = maintenance.length;
        if (expenseCount) expenseCount.innerText = expenses.length;
        if (userCount) userCount.innerText = users.length;
        if (adminName && currentUser) adminName.innerText = currentUser.name || "Admin";

        const activityTable = document.getElementById("activityTable");
        if (activityTable) {
            const activities = getStorageData(StorageKeys.ACTIVITY_LOGS, []).slice(-5).reverse();
            activityTable.innerHTML = "";
            if (!activities.length) {
                activityTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No activity found</td></tr>';
                return;
            }
            activities.forEach((activity, index) => {
                activityTable.insertAdjacentHTML("beforeend", `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${activity.user || "System"}</td>
                        <td>${activity.message || "-"}</td>
                        <td>${activity.date || "-"}</td>
                        <td><span class="badge bg-success">${activity.type || "Log"}</span></td>
                    </tr>
                `);
            });
        }
    };

    updateDashboard();

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.VEHICLES, StorageKeys.DRIVERS, StorageKeys.MAINTENANCE, StorageKeys.EXPENSES, StorageKeys.VENDORS, StorageKeys.ACTIVITY_LOGS, StorageKeys.SYSTEM_USERS].includes(e.key)) {
            updateDashboard();
        }
    });
});
