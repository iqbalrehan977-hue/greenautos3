/* ==========================================
   Green Autos
   User Guard
========================================== */


let user = getStorageData(StorageKeys.CURRENT_USER);


if(!user){

    window.location.href = "../../index.html";

}


else if(user.role !== "user"){

    window.location.href = "../../index.html";

}