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
const select    = document.getElementById("workoutSelect");
const startBtn  = document.getElementById("startBtn");
const pauseBtn  = document.getElementById("pauseBtn");
const skipBtn   = document.getElementById("skipBtn");
const display   = document.getElementById("display");
const exName    = document.getElementById("exerciseName");
const timerEl   = document.getElementById("timer");
const roundInfo = document.getElementById("roundInfo");
const queueEl   = document.getElementById("queue");

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

// ---------- core workflow ----------
function startWorkout(){
  buildSeq(workouts[select.value]);
  currentPhase = 0;        isPaused = false;
  display.classList.remove("hidden");
  queueEl.classList.remove("hidden");
  startBtn.disabled = true;
  pauseBtn.classList.remove("hidden");
  skipBtn.classList.remove("hidden");
  pauseBtn.textContent = "Pause";
  nextPhase();
}

function nextPhase(){
  if(currentPhase >= seq.length){ finishWorkout(); return; }
  const phase = seq[currentPhase];
  timeLeft = phase.duration;
  exName.textContent = phase.name;
  roundInfo.textContent = `Round ${phase.round} of ${workouts[select.value].rounds}`;
  updateTimer(timeLeft);   renderQueue();   beep();
  clearInterval(intervalId);
  intervalId = setInterval(tick,1000);
}

function tick(){
  if(isPaused) return;
  timeLeft--;
  if(timeLeft <= 0){ currentPhase++; nextPhase(); }
  else updateTimer(timeLeft);
}

function finishWorkout(){
  clearInterval(intervalId);
  exName.textContent="Done!"; timerEl.textContent=""; roundInfo.textContent="";
  pauseBtn.classList.add("hidden"); skipBtn.classList.add("hidden");
  startBtn.disabled=false; queueEl.classList.add("hidden"); beep();
}

// ---------- controls ----------
pauseBtn.onclick = () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
};
skipBtn.onclick  = () => {
  clearInterval(intervalId);
  currentPhase++; nextPhase();
};
startBtn.onclick = startWorkout;

// ---------- initial dropdown ----------
workouts.forEach((w,i)=>{
  const opt=document.createElement("option");
  opt.value=i; opt.textContent=w.name;
  select.appendChild(opt);
});
