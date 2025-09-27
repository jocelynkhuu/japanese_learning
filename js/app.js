let verbs = [];

function initApp() {
  fetch("js/verbs.json")
    .then(response => response.json())
    .then(data => {
      verbs = []
        .concat(data["u-verbs"])
        .concat(data["ru-verbs"])
        .concat(data["irregular"]); 

      buildLessonDropdown();
      updateTotalVerbs();
    })
    .catch(error => console.error("Error loading verbs.json:", error));
}


document.addEventListener("DOMContentLoaded", initApp);

function updateTotalVerbs() {
  const lesson = document.getElementById("lessonFilter").value;
  const skipIrregular = document.getElementById("skipIrregular").checked;
  let pool = verbs;

  if (lesson !== "all") {
    pool = pool.filter(v =>
      Array.isArray(v.lesson) ? v.lesson.includes(parseInt(lesson)) : v.lesson == lesson
    );
  }

  if (skipIrregular) {
    pool = pool.filter(v => v.type !== "irregular");
  }

  document.getElementById("totalVerbs").textContent = pool.length;
}

function buildLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => {
    if (Array.isArray(v.lesson)) {
      v.lesson.forEach(l => lessons.add(l));
    } else if (v.lesson) {
      lessons.add(v.lesson);
    }
  });

  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all">All Lessons</option>`;
  [...lessons].sort((a, b) => a - b).forEach(l => {
    dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`;
  });

  dropdown.onchange = updateTotalVerbs;
  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
  updateTotalVerbs();
}
buildLessonDropdown();

function startQuiz() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";
}

function showList() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("list").style.display = "block";
  const container = document.getElementById("verbTables");
  container.innerHTML = "";

  const grouped = {};
  verbs.forEach(v => {
    if (Array.isArray(v.lesson)) {
      v.lesson.forEach(l => {
        if (!grouped[l]) grouped[l] = [];
        grouped[l].push(v);
      });
    } else {
      if (!grouped[v.lesson]) grouped[v.lesson] = [];
      grouped[v.lesson].push(v);
    }
  });

  Object.keys(grouped).sort((a, b) => a - b).forEach(lesson => {
    const verbsForLesson = grouped[lesson];
    let table = `
      <h3 class="lesson-heading">Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Kanji</th><th>Dict</th><th>Te-form(s)</th><th>Masu-form(s)</th><th>Type</th><th>Meaning</th>
          </tr>
        </thead><tbody>`;
    verbsForLesson.forEach(v => {
      table += `
        <tr>
          <td>${v.kanji || ""}</td>
          <td>${v.dict}</td>
          <td>${v.te.join(", ")}</td>
          <td>${v.masu.join(", ")}</td>
          <td>${v.type}</td>
          <td>${v.meaning}</td>
        </tr>`;
    });
    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

let currentQuestions = [];
let currentType = "te";

function generateQuiz() {
  const numInput = document.getElementById("numQuestions");
  const lesson = document.getElementById("lessonFilter").value;
  currentType = document.getElementById("quizType").value;

  let pool = verbs;
  if (lesson !== "all") {
    pool = pool.filter(v =>
      Array.isArray(v.lesson) ? v.lesson.includes(parseInt(lesson)) : v.lesson == lesson
    );
  }
  if (document.getElementById("skipIrregular").checked) {
    pool = pool.filter(v => v.type !== "irregular");
  }

  document.getElementById("totalVerbs").textContent = pool.length;

  const num = Math.min(parseInt(numInput.value), pool.length);
  currentQuestions = shuffle([...pool]).slice(0, num);

  const form = document.getElementById("quizForm");
  form.innerHTML = "";
  currentQuestions.forEach((v, i) => {
    form.innerHTML += `
      <div class="mb-3">
        <label class="form-label">Q${i+1}: ${(v.kanji || v.dict)} (${v.meaning}) → ${currentType}-form?</label>
        <input type="text" class="form-control" name="q${i}" data-answers='${JSON.stringify(v[currentType])}'>
      </div>`;
  });
  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;
}

function checkAnswers() {
  let score = 0;
  let output = "";
  currentQuestions.forEach((v, i) => {
    const input = document.querySelector(`[name=q${i}]`);
    const userAnswer = input.value.trim();
    const validAnswers = JSON.parse(input.getAttribute("data-answers"));
    if (validAnswers.includes(userAnswer)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i+1}: Correct!<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")} (${v.type})</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i+1}: Incorrect<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")} (${v.type})</div>`;
    }
  });
  output += `<p class="fw-bold">Final Score: ${score}/${currentQuestions.length}</p>`;
  document.getElementById("quiz").style.display = "none";
  document.getElementById("results").style.display = "block";
  document.getElementById("resultsContent").innerHTML = output;
}

function reset() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("results").style.display = "none";
  document.getElementById("list").style.display = "none";
  document.getElementById("menu").style.display = "block";
}

function shuffle(array) {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m]; array[m] = array[i]; array[i] = t;
  }
  return array;
}