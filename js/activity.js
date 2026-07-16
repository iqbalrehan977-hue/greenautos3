/* ==========================================
   Green Autos
   Activity Log JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadActivities();
    updateCards();

});


// ===============================
// Load Activity Table
// ===============================

function loadActivities() {

    let table =
        document.getElementById("activityTable");

    if (!table) return;

    let logs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);

    table.innerHTML = "";

    if (logs.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No Activity Found
                </td>
            </tr>
        `;

        return;

    }

    logs.reverse().forEach((log, index) => {

        table.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <span class="badge bg-primary">
                        ${log.type}
                    </span>
                </td>
                <td>${log.user}</td>
                <td>
                    ${getActivityBadge(log.message)}
                </td>
                <td>${log.date}</td>
            </tr>
        `;

    });

}



// ===============================
// Dashboard Cards
// ===============================

function updateCards() {

    let logs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);

    let total =
        document.getElementById("totalActivities");

    let today =
        document.getElementById("todayActivities");

    let current =
        document.getElementById("currentUserName");

    if (total) {

        total.innerText = logs.length;

    }

    if (today) {

        let todayDate =
            new Date().toLocaleDateString();

        let todayCount =
            logs.filter(log =>
                log.date.includes(todayDate)
            ).length;

        today.innerText = todayCount;

    }

    if (current) {

        let user = getCurrentUser();

        current.innerText =
            user ? user.name : "Admin";

    }

}





/* ==========================================
   SEARCH ACTIVITY
========================================== */

let searchActivity =
document.getElementById("searchActivity");

if(searchActivity){

    searchActivity.addEventListener("keyup", function(){

        let value =
        this.value.toLowerCase();

        document
        .querySelectorAll("#activityTable tr")
        .forEach(row=>{

            row.style.display =

            row.innerText
            .toLowerCase()
            .includes(value)

            ?

            ""

            :

            "none";

        });

    });

}








/* ==========================================
   CLEAR ALL ACTIVITY LOGS
========================================== */

let clearLogs =
document.getElementById("clearLogs");

if(clearLogs){

    clearLogs.addEventListener("click", function(){

        let confirmDelete = confirm(
            "Are you sure you want to delete all activity logs?"
        );

        if(!confirmDelete){
            return;
        }

        setStorageData(StorageKeys.ACTIVITY_LOGS, []);

        loadActivities();

        updateCards();

        alert("All activity logs have been deleted.");

    });

}
/* ==========================================
   ACTIVITY BADGES
========================================== */

function getActivityBadge(message){

    if(message.includes("Added")){

        return `
        <span class="badge bg-success">
            ${message}
        </span>
        `;

    }

    if(message.includes("Updated")){

        return `
        <span class="badge bg-warning text-dark">
            ${message}
        </span>
        `;

    }

    if(message.includes("Deleted")){

        return `
        <span class="badge bg-danger">
            ${message}
        </span>
        `;

    }

    return `
    <span class="badge bg-secondary">
        ${message}
    </span>
    `;

}