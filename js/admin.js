/* ==========================================
   Green Autos Fleet Management System
   Authentication Guard
========================================== */


document.addEventListener("DOMContentLoaded",()=>{


    // Get current logged user via centralized storage
    const user = getCurrentUser();

    // If no login found
    if(!user){
        window.location.href = "index.html";
        return;
    }

    // Show user name if element exists
    const userName = document.getElementById("userName");
    if(userName){ userName.innerText = user.name || ''; }

    // Show role if element exists
    const userRole = document.getElementById("userRole");
    if(userRole){ userRole.innerText = (user.role || '').toUpperCase(); }



});