/* ==========================================
   Green Autos
   Admin Guard
========================================== */


let user = getStorageData(StorageKeys.CURRENT_USER);


if(!user){

    window.location.href = "../../index.html";

}


else if(user.role !== "admin"){

    window.location.href = "../../index.html";

}