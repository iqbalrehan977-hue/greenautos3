/* ==========================================
   Green Autos
   Vendor Dashboard JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");
    const vendorName = document.getElementById("vendorName");

    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    if (vendorName) {
        vendorName.innerText = currentUser.name || "Vendor";
    }

    function renderDashboard() {
        const allVehicles = getVehicles();
        const vendorVehicles = allVehicles.filter(v => String(v.vendorId) === String(vendorId));
        const vendorVehicleIds = vendorVehicles.map(v => v.id);

        const maintenanceRecords = getMaintenance();
        const requests = maintenanceRecords.filter(request => {
            return String(request.vendorId) === String(vendorId) || vendorVehicleIds.includes(request.vehicleId);
        });

        const collections = getCashCollections();
        const payments = collections.filter(p => 
            String(p.vendorId) === String(vendorId) || 
            vendorVehicleIds.find(id => {
                const v = allVehicles.find(v => v.id === id);
                return v && v.number === p.vehicle;
            })
        );

        document.getElementById("vehicleCount").innerText = vendorVehicles.length;
        document.getElementById("maintenanceCount").innerText = requests.length;
        document.getElementById("pendingRequests").innerText = requests.filter(request => ["Pending", "In Progress"].includes(request.status)).length;
        document.getElementById("paymentCount").innerText = payments.length;
        document.getElementById("earningTotal").innerText = `Rs ${payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)}`;
        document.getElementById("completedServices").innerText = requests.filter(request => request.status === "Completed").length;

        const vehicleOverview = document.getElementById("vehicleOverview");
        const recentActivities = document.getElementById("recentActivities");

        if (vehicleOverview) {
            vehicleOverview.innerHTML = "";

            if (vendorVehicles.length === 0) {
                vehicleOverview.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center vendor-empty">No assigned vehicles available.</td>
                    </tr>
                `;
            } else {
                vendorVehicles.slice(0, 5).forEach((vehicle, index) => {
                    vehicleOverview.innerHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${vehicle.name || "-"}</td>
                            <td>${vehicle.model || "-"}</td>
                            <td>${vehicle.driver || "-"}</td>
                            <td><span class="badge bg-${vehicle.status === "Active" ? "success" : "secondary"}">${vehicle.status || "Unknown"}</span></td>
                        </tr>
                    `;
                });
            }
        }

        if (recentActivities) {
            const activityLogs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);
            const vendorActivities = activityLogs.filter(item => item.user === currentUser.name || item.user === currentUser.username).slice(-5).reverse();

            if (vendorActivities.length === 0) {
                recentActivities.innerHTML = `<div class="activity-item text-center vendor-empty">No recent activity yet.</div>`;
            } else {
                recentActivities.innerHTML = "";
                vendorActivities.forEach(activity => {
                    recentActivities.innerHTML += `
                        <div class="activity-item">
                            <div class="d-flex justify-content-between">
                                <div>${activity.message || activity.details || ""}</div>
                                <div class="vendor-activity activity-date">${activity.date}</div>
                            </div>
                        </div>
                    `;
                });
            }
        }
    }

    renderDashboard();

    // Listen for storage changes
    window.addEventListener('storageSync', function(e) {
        if ([StorageKeys.VEHICLES, StorageKeys.MAINTENANCE, StorageKeys.CASH_COLLECTIONS].includes(e.key)) {
            renderDashboard();
        }
    });

});
