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
                    badge: './static/assets/dumbbell_128.png',
                    icon: './static/assets/dumbbell_32.png',
                }
            );
            console.log("scheduled a notification for " + getTomorrowDateStamp());
        }
    });
};

async function registerPeriodicHomeCache() {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
        // Request permission
        const status = await navigator.permissions.query({
            name: 'periodic-background-sync',
        });
    }
    if (status.state === 'granted') {
        try {
            await registration.periodicSync.register('fetch-home', {
                minInterval: 2 * 60 * 60 * 1000, // Every two hours, since we can't pick what time.
            });
        } catch {
            console.log('Periodic Sync could not be registered!');
        }
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('./service-worker.js')
        .then(() => { console.log('Service Worker Registered'); });
}

navigator.serviceWorker.ready.then(() => deleteNotification()).then(() => scheduleNotification()).then(() => registerPeriodicHomeCache());