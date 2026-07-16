/* ==========================================
   Green Autos Fleet Management System
   Reports Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadReportCards();
    generateReport();
    loadFinancialSummary();

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.VEHICLES, StorageKeys.DRIVERS, StorageKeys.VENDORS, StorageKeys.EXPENSES, StorageKeys.MAINTENANCE, StorageKeys.ASSIGNMENTS, StorageKeys.CASH_COLLECTIONS].includes(e.key)) {
            loadReportCards();
            generateReport();
            loadFinancialSummary();
        }
    });
});

function loadReportCards() {
    const vehicles = getVehicles();
    const drivers = getDrivers();
    const expenses = getExpenses();
    const maintenance = getMaintenance();
    const vendors = getVendors();

    const vehicleCount = document.getElementById("reportVehicles");
    const driverCount = document.getElementById("reportDrivers");
    const expenseAmount = document.getElementById("reportExpenses");
    const maintenanceAmount = document.getElementById("reportMaintenance");
    const vendorCount = document.getElementById("reportVendors");

    if (vehicleCount) vehicleCount.innerText = vehicles.length;
    if (driverCount) driverCount.innerText = drivers.length;
    if (expenseAmount) expenseAmount.innerText = `Rs ${expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)}`;
    if (maintenanceAmount) maintenanceAmount.innerText = `Rs ${maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0)}`;
    if (vendorCount) vendorCount.innerText = vendors.length;
}

function getDateRangeFilter() {
    const fromDate = document.getElementById("fromDate")?.value || "";
    const toDate = document.getElementById("toDate")?.value || "";
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return { from, to };
}

function matchesDateRange(itemDate, range) {
    if (!itemDate) return true;
    const targetDate = new Date(itemDate);
    if (Number.isNaN(targetDate.getTime())) return true;
    if (range.from && targetDate < range.from) return false;
    if (range.to) {
        const endOfDay = new Date(range.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (targetDate > endOfDay) return false;
    }
    return true;
}

function generateReport() {
    const reportType = document.getElementById("reportType")?.value || "all";
    const table = document.getElementById("reportTableBody");
    if (!table) return;
    table.innerHTML = "";
    const range = getDateRangeFilter();

    if (reportType === "vehicle" || reportType === "all") loadVehicleReport(table, range);
    if (reportType === "driver" || reportType === "all") loadDriverReport(table, range);
    if (reportType === "vendor" || reportType === "all") loadVendorReport(table, range);
    if (reportType === "expense" || reportType === "all") loadExpenseReport(table, range);
    if (reportType === "maintenance" || reportType === "all") loadMaintenanceReport(table, range);
    if (reportType === "assignment" || reportType === "all") loadAssignmentReport(table, range);
    if (reportType === "collection" || reportType === "all") loadCollectionReport(table, range);
}

function loadVehicleReport(table, range) {
    getVehicles().filter((vehicle) => matchesDateRange(vehicle.createdAt || vehicle.updatedAt, range)).forEach((vehicle, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Vehicle</td><td>${vehicle.name || "Vehicle"}</td><td>${vehicle.number || "-"}</td><td>${vehicle.status || "-"}</td></tr>`);
    });
}

function loadDriverReport(table, range) {
    getDrivers().filter((driver) => matchesDateRange(driver.createdAt || driver.updatedAt, range)).forEach((driver, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Driver</td><td>${driver.name || "Driver"}</td><td>${driver.phone || "-"}</td><td>${driver.status || "-"}</td></tr>`);
    });
}

function loadVendorReport(table, range) {
    getVendors().filter((vendor) => matchesDateRange(vendor.createdAt || vendor.updatedAt, range)).forEach((vendor, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Vendor</td><td>${vendor.name || "Vendor"}</td><td>${vendor.phone || "-"}</td><td>${vendor.status || "-"}</td></tr>`);
    });
}

function loadExpenseReport(table, range) {
    getExpenses().filter((expense) => matchesDateRange(expense.date, range)).forEach((expense, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Expense</td><td>${expense.description || "Expense"}</td><td>${expense.date || "-"}</td><td>Rs ${Number(expense.amount || 0)}</td></tr>`);
    });
}

function loadMaintenanceReport(table, range) {
    getMaintenance().filter((item) => matchesDateRange(item.date, range)).forEach((item, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Maintenance</td><td>${item.type || "Service"}</td><td>${item.date || "-"}</td><td>Rs ${Number(item.cost || 0)}</td></tr>`);
    });
}

function loadAssignmentReport(table, range) {
    getAssignments().filter((assignment) => matchesDateRange(assignment.assignmentDate, range)).forEach((assignment, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Assignment</td><td>${assignment.driverName || "-"} / ${assignment.vehicleName || "-"}</td><td>${assignment.assignmentDate || "-"}</td><td>${assignment.status || "-"}</td></tr>`);
    });
}

function loadCollectionReport(table, range) {
    getCashCollections().filter((collection) => matchesDateRange(collection.date, range)).forEach((collection, index) => {
        table.insertAdjacentHTML("beforeend", `<tr><td>${index + 1}</td><td>Collection</td><td>${collection.driver || "-"}</td><td>${collection.date || "-"}</td><td>Rs ${Number(collection.amount || 0)}</td></tr>`);
    });
}

function loadFinancialSummary() {
    const box = document.getElementById("financialSummary");
    if (!box) return;
    const expenses = getExpenses();
    const maintenance = getMaintenance();
    box.innerHTML = `
        <li class="list-group-item">Total Expenses: Rs ${expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)}</li>
        <li class="list-group-item">Total Maintenance: Rs ${maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0)}</li>
    `;
}

const generateBtn = document.getElementById("generateReport");
if (generateBtn) {
    generateBtn.addEventListener("click", generateReport);
}

const searchReports = document.getElementById("searchReports");
if (searchReports) {
    searchReports.addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        document.querySelectorAll("#reportTableBody tr").forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(value) ? "" : "none";
        });
    });
}

const exportReportBtn = document.getElementById("exportReport");
if (exportReportBtn) {
    exportReportBtn.addEventListener("click", () => {
        const rows = document.querySelectorAll("#reportTableBody tr");
        if (!rows.length) { alert("No report data to export"); return; }
        let csv = "No,Type,Name,Date,Amount\n";
        rows.forEach((row) => {
            const cols = row.querySelectorAll("td");
            const rowData = Array.from(cols).map((col) => `"${String(col.textContent).replace(/"/g, '""')}"`);
            csv += rowData.join(",") + "\n";
        });
        const link = document.createElement("a");
        link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
        link.download = "report_" + new Date().getTime() + ".csv";
        link.click();
    });
}
