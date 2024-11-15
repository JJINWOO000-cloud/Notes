let workoutData = [];
let currentExerciseIndex = 0;
let currentSet = 1;
let workoutInterval;
let routineStartTime;
let restInterval;

// Toggle input visibility based on exercise type
document.getElementById("exerciseType").addEventListener("change", function() {
    const type = this.value;
    document.getElementById("setsInput").classList.toggle("hidden", type !== "sets");
    document.getElementById("timeInput").classList.toggle("hidden", type !== "time");
});

// Add additional secondary muscle selection
document.getElementById("addAnotherMuscle").addEventListener("click", function() {
    const muscleContainer = document.getElementById("secondaryMuscles");
    const newMuscleSelect = document.createElement("select");
    newMuscleSelect.classList.add("secondaryMuscle");
    newMuscleSelect.innerHTML = `
        <option>Chest</option>
        <option>Back</option>
        <option>Shoulders</option>
        <option>Legs</option>
        <option>Biceps</option>
        <option>Triceps</option>
    `;
    muscleContainer.appendChild(newMuscleSelect);
});

// Validate input fields
function validateInput() {
    const name = document.getElementById("exerciseName").value;
    if (!name) {
        alert("Please enter an exercise name.");
        return false;
    }

    return true;
}

// Function to add exercise to workout plan
function addExercise() {
    if (!validateInput()) return;

    const name = document.getElementById("exerciseName").value;
    const primaryMuscle = document.getElementById("primaryMuscle").value;

    // Collect secondary muscles dynamically
    const secondaryMuscles = Array.from(document.querySelectorAll(".secondaryMuscle"))
                                  .map(select => select.value);
    
    const type = document.getElementById("exerciseType").value;
    const restTime = document.getElementById("restTime").value;

    let exercise = { name, primaryMuscle, secondaryMuscles, type, restTime };

    if (type === "sets") {
        exercise.sets = parseInt(document.getElementById("sets").value);
        exercise.reps = parseInt(document.getElementById("reps").value);
    } else {
        exercise.time = document.getElementById("timer").value;
    }

    workoutData.push(exercise);
    displayExercises();
}

// Display added exercises
function displayExercises() {
    const list = document.getElementById("exerciseList");
    list.innerHTML = "";
    workoutData.forEach((exercise, index) => {
        const li = document.createElement("li");
        li.innerText = `${exercise.name} - Primary: ${exercise.primaryMuscle}, Secondary: ${exercise.secondaryMuscles.join(", ")} - ${exercise.type === "sets" ? exercise.sets + " sets x " + exercise.reps + " reps" : "Time: " + exercise.time} - Rest: ${exercise.restTime}`;
        list.appendChild(li);
    });
}

// Start the workout
function startWorkout() {
    if (!workoutData.length) {
        alert("Please add at least one exercise.");
        return;
    }

    document.getElementById("routine-creation").classList.add("hidden");
    document.getElementById("workout-display").classList.remove("hidden");

    document.getElementById("workoutName").innerText = document.getElementById("routineName").value;
    routineStartTime = Date.now();
    displayCurrentExercise();
    startRoutineTimer();
}

// Display current exercise details
function displayCurrentExercise() {
    const exercise = workoutData[currentExerciseIndex];
    document.getElementById("currentExercise").innerText = `${exercise.name}`;
    document.getElementById("setCount").innerText = exercise.type === "sets" ? `Set ${currentSet} of ${exercise.sets}` : `Time: ${exercise.time}`;
    document.getElementById("muscleGroups").innerText = `Primary Muscle: ${exercise.primaryMuscle}, Secondary Muscles: ${exercise.secondaryMuscles.join(", ")}`;
    document.getElementById("startExerciseButton").classList.toggle("hidden", exercise.type === "sets");
    document.getElementById("nextExerciseButton").classList.add("hidden");
    document.getElementById("finishWorkoutButton").classList.add("hidden");
}

// Start the exercise (time-based or sets)
function startExercise() {
    const exercise = workoutData[currentExerciseIndex];
    if (exercise.type === "time") {
        let [minutes, seconds] = exercise.time.split(":").map(Number);
        let duration = minutes * 60 + seconds;
        let countdown = setInterval(() => {
            if (duration <= 0) {
                clearInterval(countdown);
                startRest();
            } else {
                duration--;
                document.getElementById("setCount").innerText = `Time Left: ${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")}`;
            }
        }, 1000);
    } else {
        startSet();
    }
}

// Handle rest period between sets or exercises
function startRest() {
    const exercise = workoutData[currentExerciseIndex];
    document.getElementById("restCountdown").classList.remove("hidden");
    let [minutes, seconds] = exercise.restTime.split(":").map(Number);
    let restTime = minutes * 60 + seconds;
    restInterval = setInterval(() => {
        if (restTime <= 0) {
            clearInterval(restInterval);
            nextExercise();
        } else {
            restTime--;
            document.getElementById("restCountdown").innerText = `Rest Time Left: ${String(Math.floor(restTime / 60)).padStart(2, "0")}:${String(restTime % 60).padStart(2, "0")}`;
        }
    }, 1000);
}

// Move to next exercise or set
function nextExercise() {
    const exercise = workoutData[currentExerciseIndex];
    if (exercise.type === "sets" && currentSet < exercise.sets) {
        currentSet++;
        startExercise();
    } else {
        currentExerciseIndex++;
        currentSet = 1;
        if (currentExerciseIndex < workoutData.length) {
            displayCurrentExercise();
        } else {
            finishWorkout();
        }
    }
}

// Finish workout
function finishWorkout() {
    alert("Workout completed!");
    resetWorkout();
}

// Reset workout
function resetWorkout() {
    currentExerciseIndex = 0;
    currentSet = 1;
    workoutData = [];
    document.getElementById("routine-creation").classList.remove("hidden");
    document.getElementById("workout-display").classList.add("hidden");
    displayExercises();
}

// Start routine timer
function startRoutineTimer() {
    workoutInterval = setInterval(() => {
        const timeElapsed = Math.floor((Date.now() - routineStartTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        document.getElementById("routineTimer").innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
}

// End workout early
function endWorkout() {
    clearInterval(workoutInterval);
    clearInterval(restInterval);
    resetWorkout();
}
