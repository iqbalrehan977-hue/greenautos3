/* ==========================================
   Green Autos
   Vendor Profile JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser() || {};
    const vendorId = getCurrentVendorId();
    const userName = document.getElementById("userName");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");
    const profileCompany = document.getElementById("profileCompany");
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const phoneField = document.getElementById("phone");
    const companyField = document.getElementById("company");
    const profileForm = document.getElementById("profileForm");

    // Display current profile
    if (userName) {
        userName.innerText = currentUser.name || "Vendor";
    }

    if (profileName) {
        profileName.innerText = currentUser.name || "-";
    }
    if (profileEmail) {
        profileEmail.innerText = currentUser.email || "-";
    }
    if (profilePhone) {
        profilePhone.innerText = currentUser.phone || "-";
    }
    if (profileCompany) {
        profileCompany.innerText = currentUser.company || "-";
    }

    // Load form fields
    if (nameField) {
        nameField.value = currentUser.name || "";
    }
    if (emailField) {
        emailField.value = currentUser.email || "";
    }
    if (phoneField) {
        phoneField.value = currentUser.phone || "";
    }
    if (companyField) {
        companyField.value = currentUser.company || "";
    }

    // Handle profile update
    if (profileForm) {
        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            const updatedName = nameField.value.trim();
            const updatedEmail = emailField.value.trim();
            const updatedPhone = phoneField.value.trim();
            const updatedCompany = companyField.value.trim();

            if (!updatedName || !updatedEmail || !updatedPhone) {
                alert("Please complete all profile fields.");
                return;
            }

            // Update system users
            const systemUsers = getSystemUsers();
            const updatedUsers = systemUsers.map(user => {
                if ((String(user.id) === String(currentUser.id) || String(user.vendorId) === String(vendorId)) && user.role === "vendor") {
                    return {
                        ...user,
                        name: updatedName,
                        email: updatedEmail,
                        phone: updatedPhone,
                        company: updatedCompany
                    };
                }
                return user;
            });

            saveSystemUsers(updatedUsers);

            // Update current user session
            const updatedCurrentUser = {
                ...currentUser,
                name: updatedName,
                email: updatedEmail,
                phone: updatedPhone,
                company: updatedCompany
            };

            setStorageData(StorageKeys.CURRENT_USER, updatedCurrentUser);

            // Sync vendor profile in vendors table
            const vendors = getVendors();
            const vendorIndex = vendors.findIndex(v => 
                String(v.id) === String(vendorId) ||
                String(v.id) === String(currentUser.vendorId) ||
                String(v.id) === String(currentUser.id)
            );
            
            if (vendorIndex !== -1) {
                vendors[vendorIndex] = {
                    ...vendors[vendorIndex],
                    name: updatedName,
                    email: updatedEmail,
                    phone: updatedPhone,
                    company: updatedCompany
                };
                saveVendors(vendors);
                
                // Trigger vendor data sync
                triggerStorageSync(StorageKeys.VENDORS);
            }

            // Update display
            if (profileName) {
                profileName.innerText = updatedCurrentUser.name;
            }
            if (profileEmail) {
                profileEmail.innerText = updatedCurrentUser.email;
            }
            if (profilePhone) {
                profilePhone.innerText = updatedCurrentUser.phone;
            }
            if (profileCompany) {
                profileCompany.innerText = updatedCurrentUser.company || "-";
            }

            if (userName) {
                userName.innerText = updatedCurrentUser.name;
            }

            addActivityLog("Update Profile", `Vendor profile updated`);
            alert("Profile updated successfully.");
        });
    }
});
