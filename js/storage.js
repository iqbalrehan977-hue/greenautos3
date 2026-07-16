/* ==========================================
   Green Autos Fleet Management System
   Centralized Storage Manager
   - Single source of truth for all data access
   - Provides safe getters/setters
   - Emits storageSync events for real-time UI updates
========================================== */

const StorageKeys = {
    CURRENT_USER: "currentUser",
    SYSTEM_USERS: "systemUsers",
    ACTIVITY_LOGS: "activityLogs",
    VEHICLES: "vehicles",
    DRIVERS: "drivers",
    VENDORS: "vendors",
    MAINTENANCE: "maintenance",
    EXPENSES: "expenses",
    CASH_COLLECTIONS: "cashCollections",
    ASSIGNMENTS: "assignments",
    REPORTS: "reports",
    ROLE: "role",
    EDIT_MAINTENANCE_ID: "editMaintenanceId"
};

function _safeParse(data, fallback) {
    try {
        return data ? JSON.parse(data) : fallback;
    } catch (err) {
        console.error("storage parse error:", err);
        return fallback;
    }
}

function getStorageData(key, defaultValue = []) {
    try {
        const raw = localStorage.getItem(key);
        return _safeParse(raw, defaultValue);
    } catch (err) {
        console.error(`getStorageData(${key}) error`, err);
        return defaultValue;
    }
}

function setStorageData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        triggerStorageSync(key);
        return true;
    } catch (err) {
        console.error(`setStorageData(${key}) error`, err);
        return false;
    }
}

function triggerStorageSync(key) {
    try {
        const event = new CustomEvent("storageSync", { detail: { key } });
        event.key = key;
        window.dispatchEvent(event);
    } catch (err) {
        console.error("triggerStorageSync error", err);
    }
}

function addActivityLog(type, message) {
    try {
        const logs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);
        const currentUser = getCurrentUser();
        logs.push({
            id: Date.now(),
            type,
            user: currentUser ? (currentUser.name || currentUser.username || "System") : "System",
            message,
            date: new Date().toLocaleString()
        });
        setStorageData(StorageKeys.ACTIVITY_LOGS, logs.slice(-50));
    } catch (err) {
        console.error("addActivityLog error", err);
    }
}

function getCurrentUser() {
    return getStorageData(StorageKeys.CURRENT_USER, null);
}

function saveCurrentUser(user) {
    return setStorageData(StorageKeys.CURRENT_USER, user);
}

function logoutUser(event) {
    if (event && event.preventDefault) event.preventDefault();
    try {
        const ok = confirm("Are you sure you want to logout?");
        if (!ok) return;
        addActivityLog("Logout", "User logged out");
        localStorage.removeItem(StorageKeys.CURRENT_USER);
        localStorage.removeItem(StorageKeys.ROLE);
        triggerStorageSync(StorageKeys.CURRENT_USER);
        window.location.href = "../index.html";
    } catch (err) {
        console.error("logoutUser error", err);
        window.location.href = "../index.html";
    }
}

function getSystemUsers() {
    return getStorageData(StorageKeys.SYSTEM_USERS, []);
}

function saveSystemUsers(users) {
    return setStorageData(StorageKeys.SYSTEM_USERS, users);
}

function normalizeVendor(v, index = 0) {
    const now = new Date().toISOString();
    return {
        id: v.id || Date.now() + index,
        name: v.name || "",
        company: v.company || "",
        phone: v.phone || "",
        email: v.email || "",
        address: v.address || "",
        status: v.status || "Active",
        date: v.date || now.split("T")[0],
        createdAt: v.createdAt || now,
        updatedAt: v.updatedAt || now
    };
}

function normalizeVehicle(v, index = 0) {
    const now = new Date().toISOString();
    return {
        id: v.id || Date.now() + index,
        name: v.name || "",
        number: v.number || v.plate || v.plateNumber || v.registration || v.vehicleNo || "",
        model: v.model || "",
        year: v.year || "",
        driverId: v.driverId || v.driver || null,
        vendorId: v.vendorId || v.ownerId || null,
        status: v.status || "Active",
        createdAt: v.createdAt || now,
        updatedAt: v.updatedAt || now
    };
}

function normalizeDriver(d, index = 0) {
    const now = new Date().toISOString();
    return {
        id: d.id || Date.now() + index,
        name: d.name || "",
        phone: d.phone || "",
        cnic: d.cnic || d.nic || "",
        license: d.license || "",
        vehicleId: d.vehicleId || d.assignedVehicleId || null,
        vendorId: d.vendorId || null,
        status: d.status || "Active",
        createdAt: d.createdAt || now,
        updatedAt: d.updatedAt || now
    };
}

function normalizeExpense(e, index = 0) {
    const now = new Date().toISOString();
    return {
        id: e.id || Date.now() + index,
        vehicleId: e.vehicleId || null,
        vendorId: e.vendorId || null,
        description: e.description || "",
        category: e.category || "Other",
        amount: Number(e.amount || e.cost || 0),
        notes: e.notes || "",
        date: e.date || now.split("T")[0],
        createdAt: e.createdAt || now,
        updatedAt: e.updatedAt || now
    };
}

function normalizeMaintenance(m, index = 0) {
    const now = new Date().toISOString();
    return {
        id: m.id || Date.now() + index,
        vehicleId: m.vehicleId || null,
        vehicleName: m.vehicleName || "",
        type: m.type || m.issue || "Other",
        date: m.date || now.split("T")[0],
        cost: Number(m.cost || m.amount || 0),
        status: m.status || "Pending",
        description: m.description || "",
        vendorId: m.vendorId || null,
        createdAt: m.createdAt || now,
        updatedAt: m.updatedAt || now
    };
}

function normalizeAssignment(a, index = 0) {
    const now = new Date().toISOString();
    return {
        id: a.id || Date.now() + index,
        driverId: a.driverId || null,
        driverName: a.driverName || "",
        vehicleId: a.vehicleId || null,
        vehicleName: a.vehicleName || "",
        number: a.number || "",
        assignmentDate: a.assignmentDate || now.split("T")[0],
        returnDate: a.returnDate || "",
        status: a.status || "Active",
        remarks: a.remarks || "",
        vendorId: a.vendorId || null,
        createdAt: a.createdAt || now,
        updatedAt: a.updatedAt || now
    };
}

function normalizeCollection(c, index = 0) {
    const now = new Date().toISOString();
    const reference = c.reference || c.referenceNumber || c.ref || "";
    const collectedBy = c.collectedBy || c.collected_by || c.driver || "";
    const notes = c.notes || c.remarks || "";
    return {
        id: c.id || Date.now() + index,
        date: c.date || now.split("T")[0],
        reference,
        collectedBy,
        vehicle: c.vehicle || reference,
        driver: c.driver || collectedBy,
        amount: Number(c.amount || c.cost || 0),
        notes,
        remarks: notes,
        vendorId: c.vendorId || null,
        createdAt: c.createdAt || now,
        updatedAt: c.updatedAt || now
    };
}

function getVehicles() {
    const vehicles = getStorageData(StorageKeys.VEHICLES, []);
    return Array.isArray(vehicles) ? vehicles.map((v, index) => normalizeVehicle(v, index)) : [];
}

function saveVehicles(vehicles) {
    const normalized = Array.isArray(vehicles) ? vehicles.map((v, index) => normalizeVehicle(v, index)) : [];
    return setStorageData(StorageKeys.VEHICLES, normalized);
}

function getDrivers() {
    const drivers = getStorageData(StorageKeys.DRIVERS, []);
    return Array.isArray(drivers) ? drivers.map((d, index) => normalizeDriver(d, index)) : [];
}

function saveDrivers(drivers) {
    const normalized = Array.isArray(drivers) ? drivers.map((d, index) => normalizeDriver(d, index)) : [];
    return setStorageData(StorageKeys.DRIVERS, normalized);
}

function getVendors() {
    const vendors = getStorageData(StorageKeys.VENDORS, []);
    return Array.isArray(vendors) ? vendors.map((v, index) => normalizeVendor(v, index)) : [];
}

function saveVendors(vendors) {
    const normalized = Array.isArray(vendors) ? vendors.map((v, index) => normalizeVendor(v, index)) : [];
    return setStorageData(StorageKeys.VENDORS, normalized);
}

function getMaintenance() {
    const maintenance = getStorageData(StorageKeys.MAINTENANCE, []);
    return Array.isArray(maintenance) ? maintenance.map((m, index) => normalizeMaintenance(m, index)) : [];
}

function saveMaintenance(records) {
    const normalized = Array.isArray(records) ? records.map((m, index) => normalizeMaintenance(m, index)) : [];
    return setStorageData(StorageKeys.MAINTENANCE, normalized);
}

function getExpenses() {
    const expenses = getStorageData(StorageKeys.EXPENSES, []);
    return Array.isArray(expenses) ? expenses.map((e, index) => normalizeExpense(e, index)) : [];
}

function saveExpenses(expenses) {
    const normalized = Array.isArray(expenses) ? expenses.map((e, index) => normalizeExpense(e, index)) : [];
    return setStorageData(StorageKeys.EXPENSES, normalized);
}

function getCashCollections() {
    const collections = getStorageData(StorageKeys.CASH_COLLECTIONS, []);
    return Array.isArray(collections) ? collections.map((c, index) => normalizeCollection(c, index)) : [];
}

function saveCashCollections(collections) {
    const normalized = Array.isArray(collections) ? collections.map((c, index) => normalizeCollection(c, index)) : [];
    return setStorageData(StorageKeys.CASH_COLLECTIONS, normalized);
}

function getAssignments() {
    const assignments = getStorageData(StorageKeys.ASSIGNMENTS, []);
    return Array.isArray(assignments) ? assignments.map((a, index) => normalizeAssignment(a, index)) : [];
}

function saveAssignments(assignments) {
    const normalized = Array.isArray(assignments) ? assignments.map((a, index) => normalizeAssignment(a, index)) : [];
    return setStorageData(StorageKeys.ASSIGNMENTS, normalized);
}

function getReports() {
    return getStorageData(StorageKeys.REPORTS, []);
}

function saveReports(reports) {
    return setStorageData(StorageKeys.REPORTS, reports);
}

function getVendorById(vendorId) {
    const vendors = getVendors();
    return vendors.find(v => String(v.id) === String(vendorId)) || null;
}

function getCurrentVendorId() {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    if (currentUser.vendorId) return currentUser.vendorId;
    if (currentUser.role === "vendor") {
        const vendor = getVendorById(currentUser.id);
        return vendor ? vendor.id : currentUser.id;
    }
    return currentUser.vendorId || null;
}

function getCurrentVendor() {
    const vendorId = getCurrentVendorId();
    return vendorId ? getVendorById(vendorId) : null;
}

function getVendorVehicles(vendorId) {
    const vehicles = getVehicles();
    return vehicles.filter(v => String(v.vendorId) === String(vendorId));
}

function getVendorDrivers(vendorId) {
    const drivers = getDrivers();
    return drivers.filter(d => String(d.vendorId) === String(vendorId));
}

function getVendorMaintenance(vendorId) {
    const maintenance = getMaintenance();
    return maintenance.filter(m => String(m.vendorId) === String(vendorId));
}

function getVendorExpenses(vendorId) {
    const expenses = getExpenses();
    return expenses.filter(e => String(e.vendorId) === String(vendorId));
}

function getVendorCashCollections(vendorId) {
    const collections = getCashCollections();
    return collections.filter(c => String(c.vendorId) === String(vendorId));
}

function syncVendorProfile(userId) {
    const users = getSystemUsers();
    const vendors = getVendors();
    const user = users.find(u => String(u.id) === String(userId));
    if (user && user.role === "vendor") {
        const vendorIndex = vendors.findIndex(v => String(v.id) === String(user.vendorId) || String(v.id) === String(userId));
        if (vendorIndex !== -1) {
            vendors[vendorIndex] = Object.assign({}, vendors[vendorIndex], {
                name: user.name,
                email: user.email,
                phone: user.phone,
                company: user.company
            });
            saveVendors(vendors);
        }
    }
}

function linkVendorToUser(userId, vendorId) {
    const users = getSystemUsers();
    const idx = users.findIndex(u => String(u.id) === String(userId));
    if (idx !== -1) {
        users[idx].vendorId = vendorId;
        saveSystemUsers(users);
    }
}

function initializeSeedData() {
    const users = getSystemUsers();
    let changed = false;

    if (!users.some(u => u.username === "admin")) {
        users.push({
            id: 1,
            name: "Administrator",
            username: "admin",
            password: "admin123",
            email: "admin@greenautos.com",
            phone: "03001234567",
            role: "admin",
            status: "Active"
        });
        changed = true;
    }

    if (!users.some(u => u.username === "user")) {
        users.push({
            id: 2,
            name: "Office User",
            username: "user",
            password: "user123",
            email: "user@greenautos.com",
            phone: "03009876543",
            role: "user",
            status: "Active"
        });
        changed = true;
    }

    if (!users.some(u => u.username === "vendor")) {
        users.push({
            id: 3,
            name: "Vendor User",
            username: "vendor",
            password: "vendor123",
            email: "vendor@greenautos.com",
            phone: "03001122334",
            role: "vendor",
            vendorId: 101,
            status: "Active"
        });
        changed = true;
    }

    if (changed) {
        saveSystemUsers(users);
    }

    const vendors = getVendors();
    if (vendors.length === 0) {
        saveVendors([{ id: 101, name: "Green Fleet Supplies", company: "Green Fleet Supplies", phone: "03001122334", email: "vendor@greenautos.com", address: "Lahore", status: "Active", date: "2024-01-01" }]);
    }

    const vehicles = getVehicles();
    if (vehicles.length === 0) {
        saveVehicles([{ id: 201, name: "Toyota Corolla", number: "ABC-123", model: "Corolla", year: "2022", driverId: 301, vendorId: 101, status: "Active" }]);
    }

    const drivers = getDrivers();
    if (drivers.length === 0) {
        saveDrivers([{ id: 301, name: "Ali Khan", phone: "03005551234", cnic: "35201-1234567-1", license: "L-1001", vehicleId: 201, vendorId: 101, status: "Active" }]);
    }

    const expenses = getExpenses();
    if (expenses.length === 0) {
        saveExpenses([{ id: 401, vehicleId: 201, vendorId: 101, description: "Fuel", category: "Fuel", amount: 1500, notes: "Tank refill", date: new Date().toISOString().split("T")[0] }]);
    }

    const maintenance = getMaintenance();
    if (maintenance.length === 0) {
        saveMaintenance([{ id: 501, vehicleId: 201, vehicleName: "Toyota Corolla", type: "Oil Change", date: new Date().toISOString().split("T")[0], cost: 3200, status: "Completed", description: "Routine service", vendorId: 101 }]);
    }

    const assignments = getAssignments();
    if (assignments.length === 0) {
        saveAssignments([{ id: 601, driverId: 301, driverName: "Ali Khan", vehicleId: 201, vehicleName: "Toyota Corolla", number: "ABC-123", assignmentDate: new Date().toISOString().split("T")[0], returnDate: "", status: "Active", remarks: "Assigned for daily fleet", vendorId: 101 }]);
    }

    const collections = getCashCollections();
    if (collections.length === 0) {
        saveCashCollections([{ id: 701, date: new Date().toISOString().split("T")[0], vehicle: 201, driver: "Ali Khan", amount: 5000, remarks: "Daily collection", vendorId: 101 }]);
    }

    const logs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);
    if (logs.length === 0) {
        addActivityLog("System", "Initial data seeded");
    }
}

window.StorageKeys = StorageKeys;
window.getStorageData = getStorageData;
window.setStorageData = setStorageData;
window.triggerStorageSync = triggerStorageSync;
window.addActivityLog = addActivityLog;
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.logoutUser = logoutUser;
window.getSystemUsers = getSystemUsers;
window.saveSystemUsers = saveSystemUsers;
window.getVehicles = getVehicles;
window.saveVehicles = saveVehicles;
window.getDrivers = getDrivers;
window.saveDrivers = saveDrivers;
window.getVendors = getVendors;
window.saveVendors = saveVendors;
window.getMaintenance = getMaintenance;
window.saveMaintenance = saveMaintenance;
window.getExpenses = getExpenses;
window.saveExpenses = saveExpenses;
window.getCashCollections = getCashCollections;
window.saveCashCollections = saveCashCollections;
window.getAssignments = getAssignments;
window.saveAssignments = saveAssignments;
window.getReports = getReports;
window.saveReports = saveReports;
window.getVendorById = getVendorById;
window.getCurrentVendorId = getCurrentVendorId;
window.getCurrentVendor = getCurrentVendor;
window.getVendorVehicles = getVendorVehicles;
window.getVendorDrivers = getVendorDrivers;
window.getVendorMaintenance = getVendorMaintenance;
window.getVendorExpenses = getVendorExpenses;
window.getVendorCashCollections = getVendorCashCollections;
window.syncVendorProfile = syncVendorProfile;
window.linkVendorToUser = linkVendorToUser;

initializeSeedData();
console.log("Centralized storage loaded.");
