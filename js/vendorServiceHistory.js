/* ==========================================
   Green Autos
   Vendor Service History JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");
    const historyTable = document.getElementById("historyTable");

    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    function renderServiceHistory() {
        const allMaintenance = getMaintenance();
        const allVehicles = getVehicles();
        const vendorVehicleIds = allVehicles
            .filter(v => String(v.vendorId) === String(vendorId))
            .map(v => v.id);

        // Filter completed maintenance for this vendor
        const completed = allMaintenance.filter(request => 
            request.status === "Completed" && (
                vendorVehicleIds.includes(request.vehicleId) ||
                (request.vendorId && String(request.vendorId) === String(vendorId))
            )
        );

        if (!historyTable) {
            return;
        }

        historyTable.innerHTML = "";

        if (completed.length === 0) {
            historyTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center vendor-empty">No completed service records found.</td>
                </tr>
            `;
            return;
        }

        completed.forEach((item, index) => {
            let vehicleDisplay = item.vehicleName || "-";
            if (item.vehicleId) {
                const vehicle = allVehicles.find(v => v.id === item.vehicleId);
                if (vehicle) {
                    vehicleDisplay = vehicle.name || vehicle.number || "-";
                }
            }
            
            historyTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${vehicleDisplay}</td>
                    <td>${item.description || item.type || item.issue || "-"}</td>
                    <td>${item.date || item.requestDate || "-"}</td>
                    <td>Rs ${item.cost || 0}</td>
                    <td><span class="badge bg-success">${item.status}</span></td>
                </tr>
            `;
        });
    }

    renderServiceHistory();

    // Listen for storage changes
    window.addEventListener('storageSync', function(e) {
        if (e.key === StorageKeys.MAINTENANCE) {
            renderServiceHistory();
        }
    });
});
