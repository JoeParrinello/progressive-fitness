function getTodayDateStamp() {
    const now = new Date();
    return now.toDateString();
}

function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(13, 30, 00, 00);
    return tomorrow;
}

function getTomorrowDateStamp() {
    return getTomorrow().toDateString();
}

async function deleteNotification() {
    const reg = await navigator.serviceWorker.getRegistration();
    const notifications = await reg.getNotifications({
        tag: getTodayDateStamp(),
        includeTriggered: true
    });
    notifications.forEach(notification => {
        console.log("cancelled a notification!");
        notification.close();
    });
};

async function scheduleNotification() {
    const reg = await navigator.serviceWorker.getRegistration();
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            console.log('you need to allow push notifications');
        } else {
            reg.showNotification(
                'Progressive Workout',
                {
                    tag: getTomorrowDateStamp(),
                    body: 'It looks like you haven\'t worked out yet today',
                    showTrigger: new TimestampTrigger(getTomorrow().getTime()),
                    data: {
                        url: window.location.href,
                    },
                }
            );
            console.log("scheduled a notification for "+getTomorrowDateStamp());
        }
    });
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then(() => { console.log('Service Worker Registered'); });
}

navigator.serviceWorker.ready.then(() => deleteNotification()).then(() => scheduleNotification());