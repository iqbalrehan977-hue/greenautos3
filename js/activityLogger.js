function addActivity(action, details) {

    let user = getCurrentUser();

    if(!user){

        user = {
            name:"Owner"
        };

    }

    let logs = getStorageData(StorageKeys.ACTIVITY_LOGS, []);

    let now = new Date();

    logs.push({

        action: action,

        user: user.name,

        details: details,

        date: now.toLocaleDateString(),

        time: now.toLocaleTimeString()

    });

    setStorageData(StorageKeys.ACTIVITY_LOGS, logs);

}