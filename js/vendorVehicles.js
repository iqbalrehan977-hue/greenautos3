/* ==========================================
   Green Autos
   Vendor Vehicles JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");

    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    const searchVehicle = document.getElementById("searchVehicle");
    const vehiclesTable = document.getElementById("vehiclesTable");

    function renderVehicles(data) {
        vehiclesTable.innerHTML = "";

        if (data.length === 0) {
            vehiclesTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center vendor-empty">No assigned vehicles found.</td>
                </tr>
            `;
            return;
        }

        data.forEach((vehicle, index) => {
            vehiclesTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${vehicle.name || "-"}</td>
                    <td>${vehicle.number || vehicle.plate || "-"}</td>
                    <td>${vehicle.model || "-"}</td>
                    <td>${vehicle.driver || "-"}</td>
                    <td><span class="badge bg-${vehicle.status === "Active" ? "success" : "secondary"}">${vehicle.status || "Unknown"}</span></td>
                    <td>
                        <button class="btn btn-outline-success btn-sm" type="button" onclick="alert('Vehicle: ${vehicle.name || "-"}');">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    function loadAndRenderVehicles() {
        const vehicles = getVehicles();
        const vendorVehicles = vehicles.filter(vehicle => String(vehicle.vendorId) === String(vendorId));
        renderVehicles(vendorVehicles);

        if (searchVehicle) {
            searchVehicle.addEventListener("keyup", function () {
                const searchTerm = searchVehicle.value.toLowerCase();
                const filtered = vendorVehicles.filter(vehicle =>
                    (vehicle.name || "").toLowerCase().includes(searchTerm) ||
                    (vehicle.number || vehicle.plate || "").toLowerCase().includes(searchTerm) ||
                    (vehicle.model || "").toLowerCase().includes(searchTerm) ||
                    (vehicle.driver || "").toLowerCase().includes(searchTerm)
                );
                renderVehicles(filtered);
            });
        }
    }

    loadAndRenderVehicles();

    // Listen for storage changes
    window.addEventListener('storageSync', function(e) {
        if (e.key === StorageKeys.VEHICLES) {
            loadAndRenderVehicles();
        }
    });
});
