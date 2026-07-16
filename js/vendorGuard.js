/* ==========================================
   Green Autos
   Vendor Guard
========================================== */


let user = getStorageData(StorageKeys.CURRENT_USER);


if(!user){

    window.location.href = "../../index.html";

}


else if(user.role !== "vendor"){

    window.location.href = "../../index.html";

}