/* ==========================================
   Green Autos Fleet Management System
   Expenses Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expenseForm");
    const expenseTable = document.getElementById("expenseTable");
    const searchExpense = document.getElementById("searchExpense");
    const vehicleSelect = document.getElementById("vehicleSelect");

    let expenses = getExpenses();
    let vehicles = getVehicles();
    let editMode = false;
    let editId = null;

    const loadVehicles = () => {
        if (!vehicleSelect) return;
        vehicles = getVehicles();
        vehicleSelect.innerHTML = '<option value="">Select Vehicle</option>';
        if (!vehicles.length) {
            vehicleSelect.innerHTML += '<option disabled>No vehicles available</option>';
            vehicleSelect.disabled = true;
            return;
        }
        vehicleSelect.disabled = false;
        vehicles.forEach((vehicle) => {
            vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${vehicle.id}">${vehicle.name} (${vehicle.number})</option>`);
        });
    };

    const renderExpenses = (data = null) => {
        if (!expenseTable) return;
        expenses = getExpenses();
        vehicles = getVehicles();
        const list = Array.isArray(data) ? data : expenses;
        expenseTable.innerHTML = "";

        if (!list.length) {
            expenseTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No Expense Found</td></tr>';
            return;
        }

        list.forEach((expense, index) => {
            const vehicleObj = vehicles.find(v => String(v.id) === String(expense.vehicleId));
            const vehicleName = vehicleObj ? `${vehicleObj.name} (${vehicleObj.number})` : "Unknown";
            expenseTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${index + 1}</td>
                    <td>${expense.date || "-"}</td>
                    <td>${expense.category || "-"}</td>
                    <td>${vehicleName}</td>
                    <td>${expense.description || "-"}</td>
                    <td>Rs. ${Number(expense.amount || 0)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm me-1" onclick="editExpense(${expense.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    };

    if (vehicleSelect) {
        vehicleSelect.addEventListener("change", () => {
            const hiddenVendor = document.getElementById("expenseVendorId");
            if (hiddenVendor) {
                const selectedVehicle = vehicles.find(v => String(v.id) === String(vehicleSelect.value));
                hiddenVendor.value = selectedVehicle ? (selectedVehicle.vendorId || "") : "";
            }
        });
    }

    if (searchExpense) {
        searchExpense.addEventListener("keyup", () => {
            const value = searchExpense.value.toLowerCase().trim();
            const filtered = getExpenses().filter((expense) => {
                const vehicleObj = getVehicles().find(v => String(v.id) === String(expense.vehicleId));
                const vehicleText = vehicleObj ? `${vehicleObj.name} ${vehicleObj.number}`.toLowerCase() : "";
                return (expense.description || "").toLowerCase().includes(value) ||
                    (expense.category || "").toLowerCase().includes(value) ||
                    vehicleText.includes(value) ||
                    (expense.notes || "").toLowerCase().includes(value);
            });
            renderExpenses(filtered);
        });
    }

    window.saveExpense = function () {
        if (!expenseForm) return;
        const date = document.getElementById("expenseDate").value;
        const category = document.getElementById("expenseCategory").value;
        const amount = document.getElementById("expenseAmount").value;
        const vehicleId = vehicleSelect.value;
        const description = document.getElementById("expenseDescription").value.trim();
        const notes = document.getElementById("expenseNotes").value.trim();
        const vendorId = document.getElementById("expenseVendorId").value || "";

        if (!date) { alert("Please select expense date."); return; }
        if (!category) { alert("Please select expense category."); return; }
        if (!amount) { alert("Please enter expense amount."); return; }
        if (!vehicleId) { alert("Please select vehicle."); return; }

        const expense = {
            id: editMode ? editId : Date.now(),
            date,
            category,
            amount: Number(amount),
            vehicleId,
            vendorId,
            description,
            notes,
            createdAt: editMode ? (expenses.find(item => String(item.id) === String(editId)) || {}).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (editMode) {
            expenses = expenses.map(item => String(item.id) === String(editId) ? expense : item);
            addActivityLog("Expense", "Expense updated");
        } else {
            expenses.push(expense);
            addActivityLog("Expense", `Expense of Rs. ${amount} added`);
        }

        saveExpenses(expenses);
        renderExpenses();
        expenseForm.reset();
        loadVehicles();
        editMode = false;
        editId = null;

        try { const modal = bootstrap.Modal.getInstance(document.getElementById("expenseModal")); if (modal) modal.hide(); } catch (err) {}
        triggerStorageSync(StorageKeys.EXPENSES);
    };

    window.editExpense = function (id) {
        const expense = getExpenses().find(item => String(item.id) === String(id));
        if (!expense) return;
        editMode = true;
        editId = expense.id;
        document.getElementById("expenseDate").value = expense.date || "";
        document.getElementById("expenseCategory").value = expense.category || "";
        document.getElementById("expenseAmount").value = expense.amount || "";
        document.getElementById("vehicleSelect").value = expense.vehicleId || "";
        document.getElementById("expenseDescription").value = expense.description || "";
        document.getElementById("expenseNotes").value = expense.notes || "";
        document.getElementById("expenseVendorId").value = expense.vendorId || "";
        try { new bootstrap.Modal(document.getElementById("expenseModal")).show(); } catch (err) {}
    };

    window.deleteExpense = function (id) {
        if (!confirm("Delete this expense?")) return;
        expenses = getExpenses().filter(item => String(item.id) !== String(id));
        saveExpenses(expenses);
        renderExpenses();
        addActivityLog("Expense", "Expense deleted");
        triggerStorageSync(StorageKeys.EXPENSES);
    };

    window.addEventListener("storageSync", function (e) {
        if ([StorageKeys.EXPENSES, StorageKeys.VEHICLES].includes(e.key)) {
            loadVehicles();
            renderExpenses();
        }
    });

    loadVehicles();
    renderExpenses();
});
