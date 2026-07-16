/* ==========================================
   Green Autos Fleet Management System
   Vehicles Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const vehicleForm = document.getElementById("vehicleForm");
    const vehicleTable = document.getElementById("vehicleTable");
    const searchVehicle = document.getElementById("searchVehicle");
    const driverSelect = document.getElementById("vehicleDriver");
    const vendorSelect = document.getElementById("vehicleVendor");

    let editMode = false;
    let editVehicleId = null;

    const safeText = (val) => val == null ? "" : String(val);

    const refreshData = () => ({ vehicles: getVehicles(), drivers: getDrivers(), vendors: getVendors() });

    const loadDrivers = () => {
        if (!driverSelect) return;
        const { drivers } = refreshData();
        driverSelect.innerHTML = '<option value="">Select Driver</option>';
        if (!drivers.length) {
            driverSelect.innerHTML += '<option disabled>No drivers available</option>';
            driverSelect.disabled = true;
            return;
        }
        driverSelect.disabled = false;
        drivers.forEach((d) => {
            const active = d.status === "Active" || !d.status;
            if (active) {
                driverSelect.insertAdjacentHTML("beforeend", `<option value="${d.id}">${safeText(d.name)}</option>`);
            }
        });
    };

    const loadVendors = () => {
        if (!vendorSelect) return;
        const { vendors } = refreshData();
        vendorSelect.innerHTML = '<option value="">Select Owner</option>';
        if (!vendors.length) {
            vendorSelect.innerHTML += '<option disabled>No owners available</option>';
            vendorSelect.disabled = true;
            return;
        }
        vendorSelect.disabled = false;
        vendors.forEach((v) => {
            vendorSelect.insertAdjacentHTML("beforeend", `<option value="${v.id}">${safeText(v.name)}</option>`);
        });
    };

    const displayVehicles = (data = null) => {
        if (!vehicleTable) return;
        const { vehicles, drivers, vendors } = refreshData();
        const list = Array.isArray(data) ? data : vehicles;
        vehicleTable.innerHTML = "";
        if (!list.length) {
            vehicleTable.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No Vehicle Found</td></tr>';
            return;
        }
        list.forEach((v, idx) => {
            const driverName = v.driverId ? (drivers.find(d => String(d.id) === String(v.driverId)) || {}).name || "-" : "-";
            const vendorName = v.vendorId ? (vendors.find(x => String(x.id) === String(v.vendorId)) || {}).name || "-" : "-";
            const statusBadge = v.status === "Active" ? "success" : "secondary";
            vehicleTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeText(v.name)}</td>
                    <td>${safeText(v.number)}</td>
                    <td>${safeText(v.model)}</td>
                    <td>${safeText(v.year)}</td>
                    <td>${safeText(driverName)}</td>
                    <td>${safeText(vendorName)}</td>
                    <td><span class="badge bg-${statusBadge}">${safeText(v.status)}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="editVehicle(${v.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${v.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    };

    const normalizeVehicle = (v) => ({
        id: v.id,
        name: safeText(v.name),
        number: safeText(v.number),
        model: safeText(v.model),
        year: safeText(v.year),
        driverId: v.driverId || null,
        vendorId: v.vendorId || null,
        status: v.status || "Active",
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const handleSearch = () => {
        if (!searchVehicle) return;
        searchVehicle.addEventListener("keyup", () => {
            const q = (searchVehicle.value || "").toLowerCase().trim();
            if (!q) {
                displayVehicles();
                return;
            }
            const results = getVehicles().filter((v) =>
                (v.name || "").toLowerCase().includes(q) ||
                (v.number || "").toLowerCase().includes(q) ||
                (v.model || "").toLowerCase().includes(q)
            );
            displayVehicles(results);
        });
    };

    window.saveVehicle = function () {
        if (!vehicleForm) return;
        const name = document.getElementById("vehicleName").value.trim();
        const number = document.getElementById("vehicleNumber").value.trim();
        const model = document.getElementById("vehicleModel").value.trim();
        const year = document.getElementById("vehicleYear").value.trim();
        const driverId = document.getElementById("vehicleDriver").value || null;
        const vendorId = document.getElementById("vehicleVendor").value || null;
        const status = document.getElementById("vehicleStatus").value || "Active";

        if (!name) { alert("Vehicle name is required"); return; }
        if (!number) { alert("Vehicle number is required"); return; }
        if (!vendorId) { alert("Please select vehicle owner"); return; }

        const allVehicles = getVehicles();
        const duplicate = allVehicles.find((v) => String(v.number).toLowerCase() === String(number).toLowerCase() && (!editMode || String(v.id) !== String(editVehicleId)));
        if (duplicate) { alert("A vehicle with this number already exists"); return; }

        if (editMode) {
            const updated = allVehicles.map((v) => String(v.id) === String(editVehicleId)
                ? normalizeVehicle({ ...v, name, number, model, year, driverId, vendorId, status, createdAt: v.createdAt })
                : v
            );
            saveVehicles(updated);
            addActivityLog("Vehicle", `Vehicle updated: ${name}`);
            editMode = false;
            editVehicleId = null;
        } else {
            const newVehicle = normalizeVehicle({ id: Date.now(), name, number, model, year, driverId, vendorId, status });
            allVehicles.push(newVehicle);
            saveVehicles(allVehicles);
            addActivityLog("Vehicle", `Vehicle added: ${name}`);
        }

        displayVehicles();
        vehicleForm.reset();
        loadDrivers();
        loadVendors();
        try { const modal = bootstrap.Modal.getInstance(document.getElementById("vehicleModal")); if (modal) modal.hide(); } catch (err) {}
        triggerStorageSync(StorageKeys.VEHICLES);
    };

    window.editVehicle = function (id) {
        const v = getVehicles().find(x => String(x.id) === String(id));
        if (!v) return;
        editMode = true;
        editVehicleId = v.id;
        document.getElementById("vehicleName").value = v.name || "";
        document.getElementById("vehicleNumber").value = v.number || "";
        document.getElementById("vehicleModel").value = v.model || "";
        document.getElementById("vehicleYear").value = v.year || "";
        document.getElementById("vehicleDriver").value = v.driverId || "";
        document.getElementById("vehicleVendor").value = v.vendorId || "";
        document.getElementById("vehicleStatus").value = v.status || "Active";
        try { new bootstrap.Modal(document.getElementById("vehicleModal")).show(); } catch (err) {}
    };

    window.deleteVehicle = function (id) {
        if (!confirm("Delete this vehicle?")) return;
        const remaining = getVehicles().filter(v => String(v.id) !== String(id));
        saveVehicles(remaining);
        addActivityLog("Vehicle", "Vehicle deleted");
        displayVehicles();
        triggerStorageSync(StorageKeys.VEHICLES);
    };

    window.addEventListener("storageSync", function (e) {
        if (e.key === StorageKeys.VEHICLES || e.key === StorageKeys.DRIVERS || e.key === StorageKeys.VENDORS) {
            loadDrivers();
            loadVendors();
            displayVehicles();
        }
    });

    loadDrivers();
    loadVendors();
    displayVehicles();
    handleSearch();
});
