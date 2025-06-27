// ===== preset workouts =====
const workouts = [
  {
    name: "15-min Chest/Core/Legs",
    rounds: 3,
    work: 40,
    rest: 20,
    exercises: [
      "Push-ups",
      "Bodyweight Squats",
      "Plank Shoulder Taps",
      "Glute Bridge Marches",
      "Mountain Climbers"
    ]
  },
  {
    /* enhanced version with varied timings */
    name: "15-min Chest/Core/Legs v2",
    rounds: 3,
    sequence: [
      { name: "Push-ups",            work: 40, rest: 20 },
      { name: "Bodyweight Squats",   work: 40, rest: 20 },
      { name: "Plank Shoulder Taps", work: 40, rest: 20 },
      { name: "Glute Bridge",        work: 50, rest: 20 },
      { name: "Mountain Climbers",   work: 50, rest: 60 }   // 1-min round break
    ]
  },
  {
    name: "Quick Core Blast",
    rounds: 4,
    work: 30,
    rest: 15,
    exercises: [
      "High Plank",
      "Bicycle Crunches",
      "Side Plank (R)",
      "Side Plank (L)",
      "Flutter Kicks"
    ]
  },
  {
    name: "Leg Burner",
    rounds: 4,
    work: 45,
    rest: 15,
    exercises: [
      "Jump Squats",
      "Reverse Lunges",
      "Wall Sit",
      "Calf Raises",
      "Glute Bridge"
    ]
  }
];
// ===== end workouts block =====
// ---------- element refs ----------
const select          = document.getElementById("workoutSelect");
const startBtn        = document.getElementById("startBtn");
const pauseBtn        = document.getElementById("pauseBtn");
const skipBtn         = document.getElementById("skipBtn");
const quitBtn         = document.getElementById("quitBtn");

// container for pause/skip/quit
const workoutControls = document.getElementById("workoutControls");

const display         = document.getElementById("display");
const exName          = document.getElementById("exerciseName");
const timerEl         = document.getElementById("timer");
const roundInfo       = document.getElementById("roundInfo");
const queueEl         = document.getElementById("queue");

const preview         = document.getElementById("preview");
const previewList     = document.getElementById("previewList");
const menuScreen      = document.getElementById("menuScreen");
const workoutScreen   = document.getElementById("workoutScreen");
const progressBar     = document.getElementById("progressBar");
const menuBtn         = document.getElementById("menuBtn");

const confirmOverlay  = document.getElementById("confirmOverlay");
const confirmYes      = document.getElementById("confirmYes");
const confirmNo       = document.getElementById("confirmNo");

function goToMenu() {
  workoutScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
  preview.classList.add("hidden");
  startBtn.disabled = true;
  workoutControls.classList.add("hidden");
  progressBar.classList.add("hidden");
  menuBtn.classList.add("hidden");
}

// ---------- state ----------
let seq = [], currentPhase = 0, timeLeft = 0, intervalId = null, isPaused = false;

// ---------- helpers ----------
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 600;
    osc.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch(e){}
  navigator.vibrate?.([100, 50, 100]);
}
function updateTimer(t){ timerEl.textContent = t + "s"; }

/* ---------- preview & progress helpers ---------- */
function renderPreview(w) {
  previewList.innerHTML = "";
  (w.sequence || w.exercises).forEach(step => {
    const name  = step.name || step;
    const dur   = step.work || w.work;
    const li = document.createElement("li");
    li.textContent = `${name} – ${dur}s`;
    previewList.appendChild(li);
  });
  preview.classList.remove("hidden");
  startBtn.disabled = false;
}

function buildProgressBar(rounds) {
  progressBar.innerHTML = "";
  for (let i = 0; i < rounds; i++) {
    const seg = document.createElement("div");
    seg.className = "progress-seg";
    progressBar.appendChild(seg);
  }
}
function updateProgress(roundIdx, pctIntoRound) {
  const segs = progressBar.children;
  [...segs].forEach((seg, i) => {
    if (i < roundIdx) {
      seg.className = "progress-seg progress-complete";
      seg.style.background = "";
    } else if (i === roundIdx) {
      seg.className = "progress-seg progress-active";
    } else {
      seg.className = "progress-seg";
      seg.style.background = "";
    }
  });
  // fill current seg via inline gradient
  segs[roundIdx].style.background = `linear-gradient(to right,#4CAF50 ${pctIntoRound}%,#ddd ${pctIntoRound}%)`;
}

function updateRoundProgress() {
  const current = seq[currentPhase];
  const curRound = current.round;
  let roundTotal = 0, roundElapsed = 0;
  seq.forEach((p, idx) => {
    if (p.round === curRound) {
      roundTotal += p.duration;
      if (idx < currentPhase) roundElapsed += p.duration;
    }
  });
  const pct = (roundElapsed / roundTotal) * 100;
  updateProgress(curRound - 1, pct);
}

// ---------- queue rendering ----------
function renderQueue() {
  queueEl.innerHTML = "";
  seq.slice(currentPhase + 1, currentPhase + 6).forEach((p, idx) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} – ${p.duration}s`;
    if (idx === 0) li.classList.add("current"); // next up
    queueEl.appendChild(li);
  });
}

// ---------- build sequence ----------
function buildSeq(w) {
  seq = [];
  for (let r = 1; r <= w.rounds; r++) {
    if (w.sequence) {
      w.sequence.forEach(step => {
        seq.push({ type:"work", name:step.name, duration:step.work, round:r });
        if (step.rest) seq.push({ type:"rest", name:"Rest", duration:step.rest, round:r });
      });
    } else {
      w.exercises.forEach(ex => {
        seq.push({ type:"work", name:ex, duration:w.work, round:r });
        seq.push({ type:"rest", name:"Rest", duration:w.rest, round:r });
      });
    }
  }
}

/* ---------- menu interactions ---------- */
select.addEventListener("change", () => {
  const w = workouts[select.value];
  if (!w) return;
  renderPreview(w);
});

// ---------- core workflow ----------
function startWorkout() {
  const w = workouts[select.value];
  buildSeq(w);
  buildProgressBar(w.rounds);

  progressBar.classList.remove("hidden");
  workoutControls.classList.remove("hidden");
  pauseBtn.classList.remove("hidden");
  skipBtn.classList.remove("hidden");
  quitBtn.classList.remove("hidden");
  menuBtn.classList.add("hidden");
  queueEl.classList.remove("hidden");

  // flip screens
  menuScreen.classList.add("hidden");
  workoutScreen.classList.remove("hidden");

  currentPhase = 0; isPaused = false;
  pauseBtn.textContent = "Pause";
  nextPhase();
}

function nextPhase(){
  if(currentPhase >= seq.length){ finishWorkout(); return; }
  const phase = seq[currentPhase];
  timeLeft = phase.duration;
  exName.textContent = phase.name;
  roundInfo.textContent = `Round ${phase.round} of ${workouts[select.value].rounds}`;
  updateTimer(timeLeft);
  renderQueue();
  updateRoundProgress();
  beep();
  clearInterval(intervalId);
  intervalId = setInterval(tick,1000);
}

function tick() {
  if (isPaused) return;
  timeLeft--;

  const current = seq[currentPhase];
  const curRound = current.round;
  const dur = current.duration;

  // percentage of elapsed time within the whole round
  let roundTotal = 0, roundElapsed = dur - timeLeft;
  seq.forEach((p, idx) => {
    if (p.round === curRound) {
      roundTotal += p.duration;
      if (idx < currentPhase) roundElapsed += p.duration;
    }
  });
  const pctIntoRound = (roundElapsed / roundTotal) * 100;
  updateProgress(curRound - 1, pctIntoRound);

  if (timeLeft <= 0) { currentPhase++; nextPhase(); }
  else updateTimer(timeLeft);
}

function finishWorkout(){
  clearInterval(intervalId);
  // ensure last round shows as complete
  const totalRounds = workouts[select.value].rounds;
  updateProgress(totalRounds - 1, 100);

  exName.textContent="Done!"; timerEl.textContent=""; roundInfo.textContent="";
  pauseBtn.classList.add("hidden");
  skipBtn.classList.add("hidden");
  quitBtn.classList.add("hidden");
  workoutControls.classList.add("hidden");
  progressBar.classList.add("hidden");

  menuBtn.classList.remove("hidden");

  startBtn.disabled=false; queueEl.classList.add("hidden"); beep();
}

// ---------- controls ----------
pauseBtn.onclick = () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
};
skipBtn.onclick  = () => {
  clearInterval(intervalId);
  // finish the current phase instantly so progress updates correctly
  timeLeft = 1;
  tick();
};
startBtn.onclick = startWorkout;
menuBtn.onclick  = goToMenu;

/* ---------- quit workflow ---------- */
quitBtn.onclick = () => confirmOverlay.classList.remove("hidden");
confirmNo.onclick  = () => confirmOverlay.classList.add("hidden");
confirmYes.onclick = () => {
  confirmOverlay.classList.add("hidden");
  clearInterval(intervalId);
  finishWorkout();   // reuse existing cleanup
  goToMenu();
};

// ---------- initial dropdown ----------
workouts.forEach((w,i)=>{
  const opt=document.createElement("option");
  opt.value=i; opt.textContent=w.name;
  select.appendChild(opt);
});

select.selectedIndex = -1;
