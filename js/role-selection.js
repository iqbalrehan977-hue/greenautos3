// ==========================================
// Green Autos Fleet Management System
// Role Selection
// ==========================================


document.addEventListener("DOMContentLoaded", () => {


    const userData = getCurrentUser();


    if (!userData) {

        window.location.href = "index.html";
        return;

    }



    const adminCard = document.getElementById("adminCard");

    const entryCard = document.getElementById("entryCard");

    const ownerCard = document.getElementById("ownerCard");



    adminCard.addEventListener("click", () => {


        if(userData.role === "admin"){

            setStorageData("selectedRole", "admin");

            window.location.href =
            "admin-dashboard.html";

        }
        else{

            alert("You don't have Admin access");

        }


    });




    entryCard.addEventListener("click", () => {


        if(userData.role === "entry"){

            setStorageData("selectedRole", "entry");

            window.location.href =
            "entry-dashboard.html";

        }
        else{

            alert("You don't have Data Entry access");

        }


    });




    ownerCard.addEventListener("click", () => {


        if(userData.role === "owner"){

            setStorageData("selectedRole", "owner");

            window.location.href =
            "owner-dashboard.html";

        }
        else{

            alert("You don't have Owner access");

        }


    });



});