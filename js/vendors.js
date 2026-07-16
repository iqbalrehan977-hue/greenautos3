/* ==========================================
   Green Autos Fleet Management System
   Vendors / Vehicle Owners Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const vendorForm = document.getElementById("vendorForm");
    const vendorsTable = document.getElementById("vendorsTable");
    const searchVendors = document.getElementById("searchVendors");
    const totalVendorsEl = document.getElementById("totalVendors");
    const totalVehiclesEl = document.getElementById("vendorVehicles");
    const activeVendorsEl = document.getElementById("activeVendors");

    const safeText = (val) => val == null ? "" : String(val);

    const renderVendors = () => {
        const vendors = getVendors();
        const vehicles = getVehicles();
        if (!vendorsTable) return;
        vendorsTable.innerHTML = "";
        if (!vendors.length) {
            vendorsTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No vendors found</td></tr>';
            return;
        }
        vendors.forEach((vendor, idx) => {
            const vehicleCount = vehicles.filter((v) => String(v.vendorId) === String(vendor.id)).length;
            vendorsTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${safeText(vendor.name)}</td>
                    <td>${safeText(vendor.company || "-")}</td>
                    <td>${safeText(vendor.phone)}</td>
                    <td><span class="badge bg-primary">${vehicleCount}</span></td>
                    <td>${safeText(vendor.status)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="editVendor(${vendor.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteVendor(${vendor.id})">Delete</button>
                    </td>
                </tr>
            `);
        });
    };

    const updateCards = () => {
        const vendors = getVendors();
        const vehicles = getVehicles();
        if (totalVendorsEl) totalVendorsEl.innerText = vendors.length;
        if (totalVehiclesEl) totalVehiclesEl.innerText = vehicles.length;
        if (activeVendorsEl) activeVendorsEl.innerText = vendors.filter(v => v.status === "Active").length;
    };

    if (searchVendors) {
        searchVendors.addEventListener("keyup", () => {
            const q = (searchVendors.value || "").toLowerCase().trim();
            document.querySelectorAll("#vendorsTable tr").forEach((row) => {
                row.style.display = row.innerText.toLowerCase().includes(q) ? "" : "none";
            });
        });
    }

    window.saveVendor = function () {
        if (!vendorForm) return;
        const name = document.getElementById("vendorName").value.trim();
        const company = document.getElementById("vendorCompany").value.trim();
        const phone = document.getElementById("vendorPhone").value.trim();
        const email = document.getElementById("vendorEmail").value.trim();
        const address = document.getElementById("vendorAddress").value.trim();
        const status = document.getElementById("vendorStatus").value || "Active";

        if (!name) { alert("Owner name is required"); return; }
        if (!phone) { alert("Contact number is required"); return; }

        const vendors = getVendors();
        const duplicatePhone = vendors.find(v => String(v.phone) === String(phone));
        if (duplicatePhone) { alert("Vendor with this phone already exists"); return; }
        const duplicateEmail = vendors.find(v => v.email && String(v.email).toLowerCase() === String(email).toLowerCase());
        if (duplicateEmail) { alert("Vendor with this email already exists"); return; }

        const newVendor = {
            id: Date.now(),
            name,
            company,
            phone,
            email,
            address,
            status,
            date: new Date().toISOString().split("T")[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        vendors.push(newVendor);
        saveVendors(vendors);

        // Link any existing system users (role: 'vendor') with matching email to this new vendor
        const users = getSystemUsers();
        let usersUpdated = false;
        users.forEach(u => {
            if (u.role === "vendor" && u.email && String(u.email).toLowerCase() === String(email).toLowerCase()) {
                u.vendorId = newVendor.id;
                usersUpdated = true;
            }
        });
        if (usersUpdated) {
            saveSystemUsers(users);
            addActivityLog("User", `Linked existing vendor users to vendor: ${name}`);
            triggerStorageSync(StorageKeys.SYSTEM_USERS);
        }

        addActivityLog("Vendor", `Vendor added: ${name}`);
        vendorForm.reset();
        renderVendors();
        updateCards();
        try { const modal = bootstrap.Modal.getInstance(document.getElementById("vendorModal")); if (modal) modal.hide(); } catch (err) {}
        triggerStorageSync(StorageKeys.VENDORS);
    };

    window.editVendor = function (id) {
        const vendor = getVendors().find((x) => String(x.id) === String(id));
        if (!vendor) return;
        document.getElementById("editVendorId").value = vendor.id;
        document.getElementById("editVendorName").value = vendor.name || "";
        document.getElementById("editVendorCompany").value = vendor.company || "";
        document.getElementById("editVendorPhone").value = vendor.phone || "";
        document.getElementById("editVendorEmail").value = vendor.email || "";
        document.getElementById("editVendorAddress").value = vendor.address || "";
        document.getElementById("editVendorStatus").value = vendor.status || "Active";
        try { new bootstrap.Modal(document.getElementById("editVendorModal")).show(); } catch (err) {}
    };

    window.updateVendor = function () {

    const id = document.getElementById("editVendorId").value;
    const name = document.getElementById("editVendorName").value.trim();
    const company = document.getElementById("editVendorCompany").value.trim();
    const phone = document.getElementById("editVendorPhone").value.trim();
    const email = document.getElementById("editVendorEmail").value.trim();
    const address = document.getElementById("editVendorAddress").value.trim();
    const status = document.getElementById("editVendorStatus").value;

    if (!name) {
        alert("Owner Name is required.");
        return;
    }

    if (!phone) {
        alert("Contact Number is required.");
        return;
    }

    let vendors = getVendors();

    const index = vendors.findIndex(v => String(v.id) === String(id));

    if (index === -1) {
        alert("Vendor not found.");
        return;
    }

    vendors[index].name = name;
    vendors[index].company = company;
    vendors[index].phone = phone;
    vendors[index].email = email;
    vendors[index].address = address;
    vendors[index].status = status;
    vendors[index].updatedAt = new Date().toISOString();

    saveVendors(vendors);

    renderVendors();
    updateCards();

    bootstrap.Modal.getInstance(document.getElementById("editVendorModal")).hide();

    alert("Vendor Updated Successfully.");

    triggerStorageSync(StorageKeys.VENDORS);
};
    window.deleteVendor = function (id) {
        if (!confirm("Delete this vendor?")) return;
        const vendors = getVendors().filter(v => String(v.id) !== String(id));
        const vehicles = getVehicles().map(v => String(v.vendorId) === String(id) ? Object.assign({}, v, { vendorId: null }) : v);
        saveVendors(vendors);
        saveVehicles(vehicles);
        addActivityLog("Vendor", "Vendor deleted");
        renderVendors();
        updateCards();
        triggerStorageSync(StorageKeys.VENDORS);
        triggerStorageSync(StorageKeys.VEHICLES);
    };

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.VENDORS, StorageKeys.VEHICLES].includes(e.key)) {
            renderVendors();
            updateCards();
        }
    });

    renderVendors();
    updateCards();
});
