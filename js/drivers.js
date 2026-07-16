/* ==========================================
   Green Autos Fleet Management System
   Drivers Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const driverForm = document.getElementById("driverForm");
    const driverTable = document.getElementById("driverTable");
    const searchDriver = document.getElementById("searchDriver");
    const vehicleSelect = document.getElementById("assignedVehicle");

    let editMode = false;
    let editId = null;

    const safeText = (val) => val == null ? "" : String(val);

    const refreshData = () => ({ drivers: getDrivers(), vehicles: getVehicles() });

    const loadVehicles = () => {
        if (!vehicleSelect) return;
        const { vehicles } = refreshData();
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
        if (!vehicles.length) {
            vehicleSelect.innerHTML += '<option disabled>No vehicles available</option>';
            vehicleSelect.disabled = true;
            return;
        }
        vehicleSelect.disabled = false;
        vehicles.forEach((v) => {
            vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${v.id}">${safeText(v.number)} - ${safeText(v.name)}</option>`);
        });
    };

    const renderDrivers = (data = null) => {
        if (!driverTable) return;
        const { drivers, vehicles } = refreshData();
        const list = Array.isArray(data) ? data : drivers;
        driverTable.innerHTML = "";
        if (!list.length) {
            driverTable.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No Driver Found</td></tr>';
            return;
        }
        list.forEach((d, idx) => {
            const vehicle = vehicles.find(v => String(v.id) === String(d.vehicleId));
            const vehicleName = vehicle ? `${safeText(vehicle.number)} - ${safeText(vehicle.name)}` : "Unassigned";
            const statusBadge = d.status === "Active" ? "success" : "secondary";
            driverTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeText(d.name)}</td>
                    <td>${safeText(d.phone)}</td>
                    <td>${safeText(d.cnic)}</td>
                    <td>${safeText(d.license)}</td>
                    <td>${vehicleName}</td>
                    <td><span class="badge bg-${statusBadge}">${safeText(d.status)}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="editDriver(${d.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteDriver(${d.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    };

    const assignDriverToVehicle = (driverId, vehicleId) => {
        const allVehicles = getVehicles();
        let changed = false;
        allVehicles.forEach((v) => {
            if (String(v.driverId) === String(driverId) && String(v.id) !== String(vehicleId)) {
                v.driverId = null;
                changed = true;
            }
            if (String(v.id) === String(vehicleId)) {
                v.driverId = driverId;
                changed = true;
            }
        });
        if (changed) saveVehicles(allVehicles);
    };

    if (searchDriver) {
        searchDriver.addEventListener("keyup", () => {
            const q = (searchDriver.value || "").toLowerCase().trim();
            if (!q) {
                renderDrivers();
                return;
            }
            const filtered = getDrivers().filter((d) => (d.name || "").toLowerCase().includes(q) || (d.cnic || "").toLowerCase().includes(q));
            renderDrivers(filtered);
        });
    }

    window.saveDriver = function () {
        if (!driverForm) return;
        const name = document.getElementById("driverName").value.trim();
        const phone = document.getElementById("driverPhone").value.trim();
        const cnic = document.getElementById("driverCNIC").value.trim();
        const license = document.getElementById("driverLicense").value.trim();
        const vehicleId = document.getElementById("assignedVehicle").value || null;
        const status = document.getElementById("driverStatus").value || "Active";

        if (!name) { alert("Driver name is required"); return; }
        if (!phone) { alert("Phone number is required"); return; }
        if (!cnic) { alert("CNIC is required"); return; }
        if (!license) { alert("License is required"); return; }

        const allDrivers = getDrivers();
        const duplicate = allDrivers.find((d) => String(d.cnic) === String(cnic) && (!editMode || String(d.id) !== String(editId)));
        if (duplicate) { alert("A driver with this CNIC already exists"); return; }

        const driverRecord = {
            id: editMode ? editId : Date.now(),
            name,
            phone,
            cnic,
            license,
            vehicleId,
            vendorId: null,
            status,
            createdAt: editMode ? (allDrivers.find(d => String(d.id) === String(editId)) || {}).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (editMode) {
            const updated = allDrivers.map((d) => String(d.id) === String(editId) ? driverRecord : d);
            saveDrivers(updated);
            assignDriverToVehicle(editId, vehicleId);
            addActivityLog("Driver", `Driver updated: ${name}`);
        } else {
            allDrivers.push(driverRecord);
            saveDrivers(allDrivers);
            assignDriverToVehicle(driverRecord.id, vehicleId);
            addActivityLog("Driver", `Driver added: ${name}`);
        }

        editMode = false;
        editId = null;
        driverForm.reset();
        renderDrivers();
        loadVehicles();
        try { const modal = bootstrap.Modal.getInstance(document.getElementById("driverModal")); if (modal) modal.hide(); } catch (err) {}
        triggerStorageSync(StorageKeys.DRIVERS);
    };

    window.editDriver = function (id) {
        const d = getDrivers().find(x => String(x.id) === String(id));
        if (!d) return;
        editMode = true;
        editId = d.id;
        document.getElementById("driverName").value = d.name || "";
        document.getElementById("driverPhone").value = d.phone || "";
        document.getElementById("driverCNIC").value = d.cnic || "";
        document.getElementById("driverLicense").value = d.license || "";
        document.getElementById("assignedVehicle").value = d.vehicleId || "";
        document.getElementById("driverStatus").value = d.status || "Active";
        try { new bootstrap.Modal(document.getElementById("driverModal")).show(); } catch (err) {}
    };

    window.deleteDriver = function (id) {
        if (!confirm("Delete this driver?")) return;
        const remaining = getDrivers().filter(x => String(x.id) !== String(id));
        saveDrivers(remaining);
        const vehiclesList = getVehicles().map((v) => { if (String(v.driverId) === String(id)) v.driverId = null; return v; });
        saveVehicles(vehiclesList);
        addActivityLog("Driver", "Driver deleted");
        renderDrivers();
        triggerStorageSync(StorageKeys.DRIVERS);
    };

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.DRIVERS, StorageKeys.VEHICLES].includes(e.key)) {
            loadVehicles();
            renderDrivers();
        }
    });

    loadVehicles();
    renderDrivers();
});
