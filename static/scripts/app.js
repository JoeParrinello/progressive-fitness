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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => { console.log('Service Worker Registered'); });
}

function displayExercises(setData) {
  const loadingElement = document.getElementById('grid-loader');
  loadingElement.remove();
  const date = setData["Date"];
  const dateElement = document.getElementById('header-date');
  dateElement.innerHTML = `Progressive Workout for ${date}`;
  const exercises = setData["Exercises"];
  const grid = document.getElementById('exercise-grid');
  exercises.forEach((exercise) => {
    const html = `
    <div style="width:100%">
      <input type="checkbox" style="display:none" id="${exercise.Name}" class="checks">
      <label class="pure-u-1-2 grid-cell" for="${exercise.Name}">
        <div>${exercise.Name}</div>
      </label>
      <label class="pure-u-1-2 grid-cell" for="${exercise.Name}">
        <div>${exercise.Reps}</div>
      </label>
    </div>`;
    grid.insertAdjacentHTML('beforeend', html);
  });
}

function getDaysData(year, month, day) {
  if ('localStorage' in window) {
    const cachedData = localStorage.getItem(`${year}-${month}-${day}`)
    if (cachedData) {
      displayExercises(JSON.parse(cachedData));
      return;
    }
    // Else, fall through and fetch.
  }

  fetch('./set/' + year + '/' + month + '/' + day)
    .then(
      (response) => {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        // Examine the text in the response
        response.json().then((data) => {
          console.log(data);
          displayExercises(data);
          if ('localStorage' in window) {
            window.localStorage.setItem(data["Date"], JSON.stringify(data));
          }
        });
      }
    )
    .catch((err) => {
      console.log('Fetch Error :-S', err);
    });
}

function getCurrentDaysData() {
  const now = new Date();
  const year = now.getUTCFullYear().toString();
  const month = (now.getUTCMonth() + 1) < 10 ? '0' + (now.getUTCMonth() + 1) : (now.getUTCMonth() + 1).toString();
  const day = now.getUTCDate() < 10 ? '0' + now.getUTCDate() : now.getUTCDate().toString();
  getDaysData(year, month, day);
}

getCurrentDaysData();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => deleteNotification()).then(() => scheduleNotification());
}
