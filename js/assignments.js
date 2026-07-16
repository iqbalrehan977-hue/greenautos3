/* ==========================================
   Green Autos Fleet Management System
   Assignments Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const assignmentForm = document.getElementById("assignmentForm");
    const assignmentTable = document.getElementById("assignmentTable");
    const searchInput = document.getElementById("searchAssignment");
    const driverSelect = document.getElementById("driverSelect");
    const vehicleSelect = document.getElementById("vehicleSelect");
    const totalAssignments = document.getElementById("totalAssignments");
    const activeAssignments = document.getElementById("activeAssignments");
    const completedAssignments = document.getElementById("completedAssignments");

    if (assignmentForm) {
        assignmentForm.addEventListener("submit", function (event) {
            event.preventDefault();
            window.saveAssignment && window.saveAssignment();
        });
    }

    const safeText = (val) => val == null ? "" : String(val);

    const loadDrivers = () => {
        if (!driverSelect) return;
        const drivers = getDrivers();
        driverSelect.innerHTML = '<option value="">Select Driver</option>';
        drivers.forEach((d) => {
            driverSelect.insertAdjacentHTML("beforeend", `<option value="${d.id}">${safeText(d.name)}</option>`);
        });
    };

    const loadVehicles = () => {
        if (!vehicleSelect) return;
        const vehicles = getVehicles();
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
        if (!vehicles.length) {
            vehicleSelect.innerHTML += '<option disabled>No vehicles available</option>';
            vehicleSelect.disabled = true;
            return;
        }
        vehicleSelect.disabled = false;
        vehicles.forEach((v) => {
            vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${v.id}">${safeText(v.name)} (${safeText(v.number)})</option>`);
        });
    };

    const renderAssignments = () => {
        const assignments = getAssignments();
        const drivers = getDrivers();
        const vehicles = getVehicles();
        if (!assignmentTable) return;
        assignmentTable.innerHTML = "";
        if (!assignments.length) {
            assignmentTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No assignments found</td></tr>';
            if (totalAssignments) totalAssignments.innerText = 0;
            if (activeAssignments) activeAssignments.innerText = 0;
            if (completedAssignments) completedAssignments.innerText = 0;
            return;
        }
        assignments.forEach((a, idx) => {
            const driverName = a.driverName || (drivers.find(d => String(d.id) === String(a.driverId)) || {}).name || "-";
            const vehicle = vehicles.find(v => String(v.id) === String(a.vehicleId));
            const vehicleName = a.vehicleName || (vehicle ? `${safeText(vehicle.name)} (${safeText(vehicle.number)})` : "-");
            assignmentTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeText(driverName)}</td>
                    <td>${safeText(vehicleName)}</td>
                    <td>${safeText(a.assignmentDate)}</td>
                    <td>${safeText(a.returnDate || "-")}</td>
                    <td><span class="badge ${a.status === "Active" ? "bg-success" : "bg-secondary"}">${safeText(a.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editAssignment(${a.id})"><i class="bi bi-pencil-fill"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAssignment(${a.id})"><i class="bi bi-trash-fill"></i></button>
                    </td>
                </tr>
            `);
        });
        if (totalAssignments) totalAssignments.innerText = assignments.length;
        if (activeAssignments) activeAssignments.innerText = assignments.filter(a => a.status === "Active").length;
        if (completedAssignments) completedAssignments.innerText = assignments.filter(a => a.status === "Completed").length;
    };

    if (searchInput) {
        searchInput.addEventListener("keyup", () => {
            const q = (searchInput.value || "").toLowerCase().trim();
            document.querySelectorAll("#assignmentTable tr").forEach((row) => {
                row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
            });
        });
    }

    window.saveAssignment = function () {
        if (!assignmentForm) return;
        const assignmentId = document.getElementById("assignmentId").value || "";
        const driverId = driverSelect.value;
        const vehicleId = vehicleSelect.value;
        const assignmentDate = document.getElementById("assignmentDate").value;
        const returnDate = document.getElementById("returnDate").value;
        const status = document.getElementById("assignmentStatus").value || "Active";
        const remarks = document.getElementById("remarks").value || "";

        if (!driverId) { alert("Please select a driver"); return; }
        if (!vehicleId) { alert("Please select a vehicle"); return; }

        const selectedDriver = getDrivers().find(d => String(d.id) === String(driverId));
        const selectedVehicle = getVehicles().find(v => String(v.id) === String(vehicleId));
        const vendorId = selectedVehicle ? selectedVehicle.vendorId : null;
        const assignments = getAssignments();

        const assignmentObj = {
            id: assignmentId ? Number(assignmentId) : Date.now(),
            driverId: selectedDriver ? selectedDriver.id : null,
            driverName: selectedDriver ? selectedDriver.name : "",
            vehicleId: selectedVehicle ? selectedVehicle.id : vehicleId,
            vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.number})` : "",
            number: selectedVehicle ? selectedVehicle.number : "",
            assignmentDate: assignmentDate || new Date().toISOString().split("T")[0],
            returnDate: returnDate || "",
            status,
            remarks,
            vendorId,
            createdAt: assignmentId ? (assignments.find(a => String(a.id) === String(assignmentId)) || {}).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let updatedAssignments = assignmentId
            ? assignments.map(a => String(a.id) === String(assignmentId) ? Object.assign({}, a, assignmentObj) : a)
            : assignments.concat(assignmentObj);

        saveAssignments(updatedAssignments);
        if (selectedVehicle) {
            const vehiclesList = getVehicles().map(v => String(v.id) === String(selectedVehicle.id) ? Object.assign({}, v, { status: status === "Active" ? "Assigned" : "Active" }) : v);
            saveVehicles(vehiclesList);
        }

        addActivityLog("Assignment", assignmentId ? "Assignment updated" : "Assignment added");
        assignmentForm.reset();
        document.getElementById("assignmentId").value = "";
        renderAssignments();
        try { const modal = bootstrap.Modal.getInstance(document.getElementById("assignmentModal")); if (modal) modal.hide(); } catch (err) {}
        triggerStorageSync(StorageKeys.ASSIGNMENTS);
        triggerStorageSync(StorageKeys.VEHICLES);
    };

    window.editAssignment = function (id) {
        const assignment = getAssignments().find(x => String(x.id) === String(id));
        if (!assignment) return;
        document.getElementById("assignmentId").value = assignment.id;
        driverSelect.value = assignment.driverId || "";
        vehicleSelect.value = assignment.vehicleId || "";
        document.getElementById("assignmentDate").value = assignment.assignmentDate || "";
        document.getElementById("returnDate").value = assignment.returnDate || "";
        document.getElementById("assignmentStatus").value = assignment.status || "Active";
        document.getElementById("remarks").value = assignment.remarks || "";
        try { new bootstrap.Modal(document.getElementById("assignmentModal")).show(); } catch (err) {}
    };

    window.deleteAssignment = function (id) {
        if (!confirm("Delete this assignment?")) return;
        const removed = getAssignments().find(a => String(a.id) === String(id));
        const updatedAssignments = getAssignments().filter(a => String(a.id) !== String(id));
        saveAssignments(updatedAssignments);
        if (removed && removed.vehicleId) {
            const vehiclesList = getVehicles().map(v => String(v.id) === String(removed.vehicleId) ? Object.assign({}, v, { status: "Active" }) : v);
            saveVehicles(vehiclesList);
        }
        addActivityLog("Assignment", "Assignment deleted");
        renderAssignments();
        triggerStorageSync(StorageKeys.ASSIGNMENTS);
        triggerStorageSync(StorageKeys.VEHICLES);
    };

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.DRIVERS, StorageKeys.VEHICLES, StorageKeys.ASSIGNMENTS].includes(e.key)) {
            loadDrivers();
            loadVehicles();
            renderAssignments();
        }
    });

    loadDrivers();
    loadVehicles();
    renderAssignments();
});
