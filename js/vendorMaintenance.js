/* ==========================================
   Green Autos
   Vendor Maintenance JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");
    const vehicleSelect = document.getElementById("vehicleSelect");
    const maintenanceTable = document.getElementById("maintenanceTable");
    const maintenanceForm = document.getElementById("maintenanceForm");

    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    // Get vendor vehicles
    let allVehicles = getVehicles();
    const vendorVehicles = allVehicles.filter(vehicle => String(vehicle.vendorId) === String(vendorId));
    const vendorVehicleIds = vendorVehicles.map(v => v.id);

    if (vehicleSelect) {
        vehicleSelect.innerHTML = `<option value="">Select Vehicle</option>`;
        vendorVehicles.forEach(vehicle => {
            vehicleSelect.innerHTML += `
                <option value="${vehicle.id}">${vehicle.name || vehicle.model || "Vehicle"}</option>
            `;
        });
    }

    function renderMaintenance() {
        maintenanceTable.innerHTML = "";

        // Get maintenance records from admin maintenance key
        let allMaintenance = getMaintenance();
        
        // Filter by vendor vehicles
        let vendorMaintenance = allMaintenance.filter(m => 
            vendorVehicleIds.includes(m.vehicleId) ||
            (m.vendorId && String(m.vendorId) === String(vendorId))
        );

        if (vendorMaintenance.length === 0) {
            maintenanceTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center vendor-empty">No maintenance requests yet.</td>
                </tr>
            `;
            return;
        }

        vendorMaintenance.forEach((request, index) => {
            let statusBadge = "secondary";
            if (request.status === "Completed") statusBadge = "success";
            else if (request.status === "In Progress") statusBadge = "warning";
            else if (request.status === "Pending") statusBadge = "info";
            
            maintenanceTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${request.vehicleName || "-"}</td>
                    <td>${request.type || request.issue || "-"}</td>
                    <td>${request.date || request.requestDate || "-"}</td>
                    <td>Rs. ${request.cost || request.amount || 0}</td>
                    <td><span class="badge bg-${statusBadge}">${request.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewMaintenance(${request.id})" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    window.viewMaintenance = function (id) {
        let allMaintenance = getMaintenance();
        const request = allMaintenance.find(item => item.id == id);
        if (!request) {
            alert("Maintenance record not found");
            return;
        }
        alert(`Maintenance Details:\n\nVehicle: ${request.vehicleName}\nType: ${request.type || request.issue}\nDate: ${request.date}\nStatus: ${request.status}\nDescription: ${request.description || "N/A"}`);
    };

    if (maintenanceForm) {
        maintenanceForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            let allMaintenance = getMaintenance();
            const requestId = Date.now();
            const vehicleId = Number(document.getElementById("vehicleSelect").value);
            const vehicle = vendorVehicles.find(item => item.id == vehicleId) || {};
            const issue = document.getElementById("issue").value.trim();
            const requestDate = document.getElementById("requestDate").value;
            const cost = Number(document.getElementById("requestCost").value) || 0;
            const status = document.getElementById("requestStatus").value;

            if (!vehicleId || !issue || !requestDate) {
                alert("Please complete all request fields.");
                return;
            }

            const newRequest = {
                id: requestId,
                vehicleId: vehicleId,
                vehicleName: vehicle.name || vehicle.model || "Vehicle",
                type: issue,
                date: requestDate,
                cost: cost,
                status: status,
                description: issue,
                vendorId: vendorId,
                createdBy: currentUser.name
            };

            allMaintenance.push(newRequest);
            saveMaintenance(allMaintenance);

            // Trigger sync
            triggerStorageSync(StorageKeys.MAINTENANCE);
            addActivityLog("Maintenance", `Maintenance request submitted for ${newRequest.vehicleName}`);

            alert("Maintenance request submitted successfully.");
            maintenanceForm.reset();
            renderMaintenance();
        });
    }

    // Initial render
    renderMaintenance();

    // Listen for storage changes
    window.addEventListener('storageSync', function(e) {
        if (e.key === StorageKeys.MAINTENANCE) {
            renderMaintenance();
        }
    });

});
