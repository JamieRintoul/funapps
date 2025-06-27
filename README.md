# Quick Workout Timer

This repository contains a small single-page web application for running quick bodyweight workouts. It lives inside the `docs/` directory so it can be deployed easily with GitHub Pages.

## Features

- Choose from a selection of preset workouts defined in [`docs/app.js`](docs/app.js).
- Preview the exercises and durations before starting the workout.
- Visual per-round progress bar and queue of upcoming exercises.
- Pause/resume, skip and quit controls with a confirmation dialog.
- Audio beep and vibration feedback at each phase change (supported devices only).
- Includes a minimal web app manifest so the timer can be installed as a standalone page.

The structure of the workout selection and the interface can be seen in [`docs/index.html`](docs/index.html):

```html
<!-- MENU SCREEN -->
<div id="menuScreen">
  <h1>Quick Workout Timer</h1>
  <label for="workoutSelect">Choose workout:</label>
  <select id="workoutSelect"></select>
  <div id="preview" class="hidden">
    <h3>Preview</h3>
    <ul id="previewList"></ul>
  </div>
  <button id="startBtn" disabled>Start Workout</button>
</div>
```

The page also contains a workout view with controls and a quit confirmation modal:

```html
<!-- WORKOUT SCREEN -->
<div id="workoutScreen" class="hidden">
  <div id="progressBar"></div>
  <div id="display">
    <h2 id="exerciseName"></h2>
    <div id="timer"></div>
    <div id="roundInfo"></div>
    <ul id="queue"></ul>
  </div>
  <div id="workoutControls">
    <button id="pauseBtn">Pause</button>
    <button id="skipBtn">Skip ▶︎</button>
    <button id="quitBtn">Quit</button>
  </div>
</div>
```

See the manifest snippet for the minimal PWA configuration:

```json
{
  "name": "Quick Workout Timer",
  "short_name": "Workout",
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff"
}
```

## Running Locally

No build step is required. Simply open `docs/index.html` in a modern browser. To serve it via a local HTTP server you can run:

```bash
python3 -m http.server --directory docs
```

Then visit `http://localhost:8000` in your browser.

## Customising Workouts

The preset workouts are defined at the top of [`docs/app.js`](docs/app.js). Each workout specifies the number of rounds, durations and exercises. Modify this array to adjust existing workouts or add new ones.

## Folder Structure

```
funapps/
└── docs/
    ├── app.js        # application logic and workout definitions
    ├── index.html    # main page
    ├── manifest.json # PWA manifest
    └── style.css     # styles
```

## License

This project currently does not include an explicit license. All rights reserved to the original author.
