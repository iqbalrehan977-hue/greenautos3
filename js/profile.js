/* ==========================================
   Green Autos
   Profile JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadProfile();

});


// ===============================
// Load Profile
// ===============================

function loadProfile(){

    let user = getCurrentUser();

    if(!user){
        return;
    }

    document.getElementById("profileName").value =
    user.name || "";

    document.getElementById("profileEmail").value =
    user.email || "";

    if(user.image){

        document.getElementById("profilePreview").src =
        user.image;

    }

}



// ===============================
// Image Preview
// ===============================

document.getElementById("profileImage")
.addEventListener("change", function(e){

    let file = e.target.files[0];

    if(!file){
        return;
    }

    let reader = new FileReader();

    reader.onload = function(event){

        document.getElementById("profilePreview").src =
        event.target.result;

    }

    reader.readAsDataURL(file);

});




// ===============================
// Update Profile
// ===============================

document.getElementById("profileForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    let password =
    document.getElementById("profilePassword").value;

    let confirm =
    document.getElementById("confirmPassword").value;

    if(password !== confirm){

        alert("Passwords do not match");

        return;

    }

   let user = getCurrentUser() || {};

   user.name =
   document.getElementById("profileName").value;

   user.email =
   document.getElementById("profileEmail").value;

   if(password !== ""){

       user.password = password;

   }

   user.image =
   document.getElementById("profilePreview").src;

   setStorageData(StorageKeys.CURRENT_USER, user);

   alert("Profile Updated Successfully");
    
   addActivityLog("Profile", "User profile updated");

});