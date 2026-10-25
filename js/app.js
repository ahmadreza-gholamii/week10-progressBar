"use strict";
const steps = [
  { id: 1, title: "Start", description: "First step of your project" },
  { id: 2, title: "Planning", description: "Details of implementation" },
  { id: 3, title: "Execution", description: "Task management" },
  { id: 4, title: "Completion", description: "Final delivery" },
];
const progressFill = document.querySelector("#progressFill");
const stepCircles = document.querySelectorAll(".step-circle");
const stepItems = document.querySelectorAll(".step");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const stepCounter = document.querySelector("#stepCounter");
const successModal = document.querySelector("#successModal");
const closeModalBtn = document.querySelector("#closeModalBtn");

// for timer and theme toggle
const timerElement = document.querySelector("#timer");
const timerValueElement = document.querySelector("#timerValue");
const timeUpModal = document.querySelector("#timeUpModal");
const restartBtn = document.querySelector("#restartBtn");
const themeToggle = document.querySelector("#themeToggle");
const TIMER_DURATION = 60;
let timeLeft = 60;
let timerInterval = null;
let timeIsUp = false;

const savedStep = Number(localStorage.getItem("step"));
const savedTimeLeft = Number(localStorage.getItem("timeLeft"));
const timerWasResetAfterExpiry = localStorage.getItem("timerExpired") === "true";

if (timerWasResetAfterExpiry || savedTimeLeft === 0) {
  localStorage.removeItem("timeLeft");
  localStorage.removeItem("timerExpired");
  localStorage.setItem("step", "0");
  timeLeft = TIMER_DURATION;
  timeIsUp = false;
} else if (
  Number.isInteger(savedTimeLeft) &&
  savedTimeLeft > 0 &&
  savedTimeLeft <= TIMER_DURATION
) {
  timeLeft = savedTimeLeft;
} else {
  timeLeft = TIMER_DURATION;
}

let currentStep = 0;

if (timerWasResetAfterExpiry || savedTimeLeft === 0) {
  localStorage.setItem("step", "0");
  currentStep = 0;
} else if (
  Number.isInteger(savedStep) &&
  savedStep >= 0 &&
  savedStep < steps.length
) {
  currentStep = savedStep;
}

// update after every change
function updateProgress() {
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;
  progressFill.style.width = `${progressPercentage}%`;
  stepCircles.forEach((circle, index) => {
    const isCompleted = index < currentStep;
    const isActive = index === currentStep;
    circle.classList.toggle("completed", isCompleted);
    circle.classList.toggle("active", isActive);
    circle.innerHTML = isCompleted ? "✓" : steps[index].id;
    circle.setAttribute("aria-current", isActive ? "step" : "false");
    stepItems[index].classList.toggle("current", isActive);
    stepItems[index].classList.toggle("completed-step", isCompleted);
  });
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = false;
  nextBtn.innerHTML =
    currentStep === steps.length - 1
      ? 'Complete <span aria-hidden="true">✓</span>'
      : 'Next <span aria-hidden="true">→</span>';
  stepCounter.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  localStorage.setItem("step", String(currentStep));
}

// change step with 1 move forward or back
function changeStep(direction) {
  const nextStep = currentStep + direction;
  if (nextStep < 0 || nextStep >= steps.length) {
    return;
  }
  currentStep = nextStep;
  updateProgress();
}

// previous and next button event listeners
prevBtn.addEventListener("click", () => {
  changeStep(-1);
});
nextBtn.addEventListener("click", () => {
  if (currentStep === steps.length - 1) {
    completeProject();
  } else {
    changeStep(1);
  }
});

// for clicking on circle steps
stepCircles.forEach((circle) => {
  circle.addEventListener("click", () => {
    const selectedStep = Number(circle.dataset.step);
    if (selectedStep - currentStep >= 2) {
      // If user tries to skip a step, do not allow it. like a real form.
      // but it can go back to previous steps.
      return;
    }
    if (selectedStep >= 0 && selectedStep < steps.length) {
      currentStep = selectedStep;
      updateProgress();
    }
  });
});

// show modal when project is completed
function completeProject() {
  if (currentStep === steps.length - 1) {
    clearInterval(timerInterval);
    timeLeft = TIMER_DURATION;
    localStorage.removeItem("timerExpired");
    localStorage.setItem("timeLeft", String(timeLeft));
    updateTimerDisplay();
    successModal.classList.remove("hidden");
    closeModalBtn.focus();
  }
}

// close modal and reset progress
closeModalBtn.addEventListener("click", () => {
  successModal.classList.add("hidden");
  currentStep = 0;
  localStorage.setItem("step", "0");
  updateProgress();
  startTimer();
});

// timer functions
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  timerValueElement.textContent = formattedTime;
  timerElement.classList.toggle("time-warning", timeLeft <= 30);
  localStorage.setItem("timeLeft", String(timeLeft));
}
function startTimer() {
  clearInterval(timerInterval);
  localStorage.removeItem("timerExpired");
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    }
    if (timeLeft === 0) {
      clearInterval(timerInterval);
      timeIsUp = true;
      localStorage.setItem("timerExpired", "true");
      localStorage.setItem("timeLeft", "0");
      localStorage.setItem("step", "0");
      currentStep = 0;
      updateProgress();
      stepCircles.forEach((circle) => {
        circle.style.pointerEvents = "none";
      });
      timeUpModal.classList.remove("hidden");
      restartBtn.focus();
    }
  }, 1000);
}

// theme toggle functions
function updateTheme() {
  const isDarkMode = document.body.classList.contains("dark-mode");
  themeToggle.innerHTML = isDarkMode ? '<span aria-hidden="true">☀</span>' : '<span aria-hidden="true">☾</span>';
  themeToggle.setAttribute("aria-pressed", String(isDarkMode));
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}
updateTheme();
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  updateTheme();
});

// restart timer and reset progress
restartBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timeLeft = TIMER_DURATION;
  timeIsUp = false;
  currentStep = 0;
  localStorage.removeItem("timerExpired");
  localStorage.setItem("timeLeft", String(timeLeft));
  localStorage.setItem("step", "0");
  timeUpModal.classList.add("hidden");
  stepCircles.forEach((circle) => {
    circle.style.pointerEvents = "";
  });
  updateProgress();
  startTimer();
});
startTimer();
updateProgress();
