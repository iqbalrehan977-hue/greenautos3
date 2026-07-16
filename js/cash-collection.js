/* ==========================================
   Green Autos Fleet Management System
   Cash Collection Management
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       HTML Elements
    ========================== */

    const cashForm =
        document.getElementById("cashForm");

    const cashTable =
        document.getElementById("cashTable");

    const searchCash =
        document.getElementById("searchCash");

    const vehicleSelect =
        document.getElementById("cashVehicle");

    const driverSelect =
        document.getElementById("cashDriver");



    /* ==========================
       Local Storage
    ========================== */

    let collections = getCashCollections();
    let vehicles = getVehicles();
    let drivers = getDrivers();



    /* ==========================
       Edit Variables
    ========================== */

    let editMode = false;
    let editId = null;



    /* ==========================
       Initial Load
    ========================== */

    loadVehicles();
    loadDrivers();
    displayCollections();
    
    // Listen for storage changes from other pages
    window.addEventListener('storageSync', function(e) {
       if (e.key === StorageKeys.CASH_COLLECTIONS || e.key === StorageKeys.VEHICLES || e.key === StorageKeys.DRIVERS) {
           collections = getCashCollections();
           vehicles = getVehicles();
           drivers = getDrivers();
           loadVehicles();
           loadDrivers();
           displayCollections();
       }
    });



    /* ==========================
       Load Vehicles
    ========================== */

    function loadVehicles() {

        if (!vehicleSelect) return;

        vehicleSelect.innerHTML =
            `<option value="">Select Vehicle</option>`;

        vehicles = getVehicles();

        if (vehicles.length === 0) {
            vehicleSelect.innerHTML +=
            `<option disabled>No vehicles available</option>`;
            vehicleSelect.disabled = true;
            return;
        }

        vehicleSelect.disabled = false;

        vehicles.forEach(vehicle => {

            vehicleSelect.innerHTML += `
                <option value="${vehicle.id}">
                    ${vehicle.number} - ${vehicle.name}
                </option>
            `;

        });

    }



    /* ==========================
       Load Drivers
    ========================== */

    function loadDrivers() {

        if (!driverSelect) return;

        driverSelect.innerHTML =
            `<option value="">Select Driver</option>`;

        drivers = getDrivers();

        if (drivers.length === 0) {
            driverSelect.innerHTML +=
            `<option disabled>No drivers available</option>`;
            driverSelect.disabled = true;
            return;
        }

        driverSelect.disabled = false;

        drivers.forEach(driver => {

            if (driver.status === "Active") {

                driverSelect.innerHTML += `
                    <option value="${driver.name}">
                        ${driver.name}
                    </option>
                `;

            }

        });

    }



    /* ==========================
       Search Collection
    ========================== */

    if (searchCash) {

        searchCash.addEventListener("keyup", () => {

            let value =
                searchCash.value.toLowerCase();

            let filtered = collections.filter(item =>

                item.driver.toLowerCase().includes(value)
                ||
                item.vehicle.toLowerCase().includes(value)
                ||
                item.date.toLowerCase().includes(value)

            );

            displayCollections(filtered);

        });

    }



    /* ==========================
       Display Collections
    ========================== */

    function displayCollections(data = collections) {

        cashTable.innerHTML = "";

        if (data.length === 0) {

            cashTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        No Cash Collection Found
                    </td>
                </tr>
            `;

            return;

        }

        data.forEach((item, index) => {

            const vehicleInfo = vehicles.find(v => v.id == item.vehicle);
            const vehicleName = vehicleInfo ? (vehicleInfo.number || vehicleInfo.plate || "Unknown") : "Unknown";

            cashTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.date}</td>
                    <td>${vehicleName}</td>
                    <td>${item.driver}</td>
                    <td>Rs. ${item.amount}</td>
                    <td>${item.remarks}</td>
                    <td>
                        <button
                            class="btn btn-primary btn-sm"
                            onclick="editCash(${item.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteCash(${item.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

        });

    }

    /* ==========================================
       SAVE / UPDATE CASH COLLECTION
    ========================================== */

window.saveCash = function () {

        let date =
            document.getElementById("cashDate").value;

        let vehicle =
            document.getElementById("cashVehicle").value;

        let driver =
            document.getElementById("cashDriver").value;

        let amount =
            document.getElementById("cashAmount").value;

        let remarks =
            document.getElementById("cashRemarks").value.trim();



        /* ==========================
           Validation
        ========================== */

        if (date === "") {

            alert("Please select collection date.");
            return;

        }

        if (vehicle === "") {

            alert("Please select vehicle.");
            return;

        }

        if (driver === "") {

            alert("Please select driver.");
            return;

        }

        if (amount === "") {

            alert("Please enter collection amount.");
            return;

        }

        // Get vendor ID from selected vehicle
        let vehicleObj = vehicles.find(v => v.id == vehicle);
        let vendorId = vehicleObj ? vehicleObj.vendorId : null;

        /* ==========================
           Collection Object
        ========================== */

        let collection = {

            id: editMode ? editId : Date.now(),
            date: date,
            vehicle: vehicle,
            driver: driver,
            amount: amount,
            remarks: remarks,
            vendorId: vendorId

        };



        /* ==========================
           Update
        ========================== */

        if (editMode) {

            collections = collections.map(item =>

                item.id === editId ? collection : item

            );

            editMode = false;
            editId = null;
            
            addActivityLog("Cash Collection", "Collection updated");

        }

        /* ==========================
           Add New
        ========================== */

        else {

            collections.push(collection);
            addActivityLog("Cash Collection", `Collection of Rs. ${amount} added`);

        }



        /* ==========================
           Save LocalStorage
        ========================== */

        saveCashCollections(collections);



        /* ==========================
           Refresh Table
        ========================== */

        displayCollections();



        /* ==========================
           Reset Form
        ========================== */

        cashForm.reset();



        /* ==========================
           Close Modal
        ========================== */

        let modal = bootstrap.Modal.getInstance(

            document.getElementById("cashModal")

        );

        if (modal) {

            modal.hide();

        }
        
        // Trigger sync
        triggerStorageSync(StorageKeys.CASH_COLLECTIONS);

    };

    /* ==========================================
       EDIT CASH COLLECTION
    ========================================== */

    window.editCash = function (id) {

        let collection = collections.find(item => item.id === id);

        if (!collection) return;

        editMode = true;
        editId = id;

        document.getElementById("cashDate").value =
            collection.date;

        document.getElementById("cashVehicle").value =
            collection.vehicle;

        document.getElementById("cashDriver").value =
            collection.driver;

        document.getElementById("cashAmount").value =
            collection.amount;

        document.getElementById("cashRemarks").value =
            collection.remarks;

        let modal = new bootstrap.Modal(
            document.getElementById("cashModal")
        );

        modal.show();

    };



    /* ==========================================
       DELETE CASH COLLECTION
    ========================================== */

    window.deleteCash = function (id) {

        if (!confirm("Are you sure you want to delete this collection?"))
            return;

        collections = collections.filter(item => item.id !== id);

        saveCashCollections(collections);

        displayCollections();

        addActivityLog(
            "Cash Collection",
            "Cash Collection Deleted"
        );

    };

});

/* ==========================================
   END OF FILE
========================================== */
