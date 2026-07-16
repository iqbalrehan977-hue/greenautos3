const user = getStorageData(StorageKeys.CURRENT_USER);

if (!user || (user.role !== "owner" && user.role !== "vendor")) {
    window.location.href = "../../index.html";
}