/* ==========================================
   Green Autos Fleet Management System
   Maintenance Management
========================================== */

document.addEventListener("DOMContentLoaded", function () {
    loadVehicles();
    loadMaintenance();
    updateCards();

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.MAINTENANCE, StorageKeys.VEHICLES].includes(e.key)) {
            loadVehicles();
            loadMaintenance();
            updateCards();
        }
    });
});

function loadVehicles() {
    const vehicleSelect = document.getElementById("vehicleSelect");
    if (!vehicleSelect) return;
    const vehicles = getVehicles();
    vehicleSelect.innerHTML = '<option value="">Choose Vehicle</option>';
    if (!vehicles.length) {
        vehicleSelect.innerHTML += '<option disabled>No vehicles available</option>';
        vehicleSelect.disabled = true;
        return;
    }
    vehicleSelect.disabled = false;
    vehicles.forEach((vehicle) => {
        vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${vehicle.id}">${vehicle.name || vehicle.number || "Vehicle"}</option>`);
    });
}

function loadMaintenance() {
    const table = document.getElementById("maintenanceTable");
    if (!table) return;
    const records = getMaintenance();
    const vehicles = getVehicles();
    table.innerHTML = "";

    if (!records.length) {
        table.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No maintenance records found</td></tr>';
        return;
    }

    records.forEach((record, index) => {
        const vehicle = vehicles.find(v => String(v.id) === String(record.vehicleId));
        const vehicleName = vehicle ? (vehicle.name || vehicle.number || "Vehicle") : "Unknown";
        table.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${index + 1}</td>
                <td>${vehicleName}</td>
                <td>${record.type || "-"}</td>
                <td>${record.date || "-"}</td>
                <td>Rs ${Number(record.cost || 0)}</td>
                <td>${record.status || "Pending"}</td>
                <td>${record.description || "-"}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-1" onclick="editMaintenance(${record.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMaintenance(${record.id})">Delete</button>
                </td>
            </tr>
        `);
    });
}

function updateCards() {
    const records = getMaintenance();
    const total = document.getElementById("totalMaintenance");
    const pending = document.getElementById("pendingService");
    const cost = document.getElementById("totalCost");
    if (total) total.innerText = records.length;
    if (pending) pending.innerText = records.filter(item => item.status === "Pending").length;
    if (cost) cost.innerText = `Rs ${records.reduce((sum, item) => sum + Number(item.cost || 0), 0)}`;
}

const maintenanceForm = document.getElementById("maintenanceForm");
if (maintenanceForm) {
    maintenanceForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const records = getMaintenance();
        const vehicles = getVehicles();
        const vehicleId = document.getElementById("vehicleSelect").value;
        const selectedVehicle = vehicles.find(v => String(v.id) === String(vehicleId));
        const vendorId = selectedVehicle ? selectedVehicle.vendorId : null;
        const editId = getStorageData(StorageKeys.EDIT_MAINTENANCE_ID, null);

        const newRecord = {
            id: editId || Date.now(),
            vehicleId: selectedVehicle ? selectedVehicle.id : null,
            vehicleName: selectedVehicle ? (selectedVehicle.name || selectedVehicle.number) : "Unknown",
            type: document.getElementById("maintenanceType").value,
            date: document.getElementById("maintenanceDate").value,
            cost: Number(document.getElementById("maintenanceAmount").value || 0),
            status: document.getElementById("maintenanceStatus").value,
            description: document.getElementById("maintenanceDescription").value,
            vendorId
        };

        if (editId) {
            const updated = records.map(record => String(record.id) === String(editId) ? Object.assign({}, record, newRecord) : record);
            saveMaintenance(updated);
            addActivityLog("Maintenance", "Maintenance record updated");
        } else {
            records.push(newRecord);
            saveMaintenance(records);
            addActivityLog("Maintenance", "Maintenance record added");
        }

        setStorageData(StorageKeys.EDIT_MAINTENANCE_ID, null);
        maintenanceForm.reset();
        loadMaintenance();
        updateCards();
        triggerStorageSync(StorageKeys.MAINTENANCE);
        alert("Maintenance record saved successfully");
    });
}

function deleteMaintenance(id) {
    if (!confirm("Delete this maintenance record?")) return;
    const records = getMaintenance().filter(record => String(record.id) !== String(id));
    saveMaintenance(records);
    loadMaintenance();
    updateCards();
    addActivityLog("Maintenance", "Maintenance record deleted");
    triggerStorageSync(StorageKeys.MAINTENANCE);
}

function editMaintenance(id) {
    const records = getMaintenance();
    const record = records.find(item => String(item.id) === String(id));
    if (!record) return;
    const vehicleSelect = document.getElementById("vehicleSelect");
    if (vehicleSelect && record.vehicleId) vehicleSelect.value = record.vehicleId;
    document.getElementById("maintenanceType").value = record.type || "";
    document.getElementById("maintenanceDate").value = record.date || "";
    document.getElementById("maintenanceAmount").value = record.cost || 0;
    document.getElementById("maintenanceStatus").value = record.status || "Pending";
    document.getElementById("maintenanceDescription").value = record.description || "";
    setStorageData(StorageKeys.EDIT_MAINTENANCE_ID, record.id);
    document.querySelector("#maintenanceForm button[type='submit']").innerText = "Update Record";
}

const searchBox = document.getElementById("searchMaintenance");
if (searchBox) {
    searchBox.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        document.querySelectorAll("#maintenanceTable tr").forEach((row) => {
            row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
        });
    });
}
