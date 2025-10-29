let verbs = [];
let adjectives = [];

// ------------------------- INIT -------------------------
function initApp() {
  // Load verbs
  fetch("js/verbs.json")
    .then(response => response.json())
    .then(data => {
      verbs = []
        .concat(data["u-verbs"])
        .concat(data["ru-verbs"])
        .concat(data["irregular"]);

      verbs.forEach(v => {
        if (!Array.isArray(v.lesson)) v.lesson = [v.lesson];
      });

      buildLessonDropdown();
      updateTotalVerbs();
    })
    .catch(error => console.error("Error loading verbs.json:", error));

  // Load adjectives
  fetch("js/adjectives.json")
    .then(r => r.json())
    .then(data => {
      adjectives = data["adjectives"];
      adjectives.forEach(adj => {
        if (!Array.isArray(adj.lesson)) adj.lesson = [adj.lesson];
      });
    })
    .catch(error => console.error("Error loading adjectives.json:", error));
}

document.addEventListener("DOMContentLoaded", initApp);

// ------------------------- VERB HELPERS -------------------------
function updateTotalVerbs() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o => o.value);
  const skipIrregular = document.getElementById("skipIrregular").checked;
  let pool = verbs;

  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v => v.lesson.some(l => lessons.includes(l)));
  }

  if (skipIrregular) {
    pool = pool.filter(v => v.type !== "irregular");
  }

  const max = pool.length;
  document.getElementById("totalVerbs").textContent = max;
  document.getElementById("numQuestions").value = max;
}

function buildLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => v.lesson.forEach(l => lessons.add(l)));

  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a, b) => a - b).forEach(l => {
    dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`;
  });

  dropdown.addEventListener("change", () => {
    const selected = [...dropdown.selectedOptions].map(o => o.value);
    if (selected.length > 1 && selected.includes("all")) {
      [...dropdown.options].forEach(opt => {
        if (opt.value === "all") opt.selected = false;
      });
    }
    updateTotalVerbs();
  });

  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
  updateTotalVerbs();
}

// ------------------------- ADJECTIVE HELPERS -------------------------
function buildAdjectiveLessonDropdown() {
  const lessons = new Set();
  adjectives.forEach(adj => adj.lesson.forEach(l => lessons.add(l)));

  const dropdown = document.getElementById("adjLessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a, b) => a - b).forEach(l => {
    dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`;
  });

  dropdown.addEventListener("change", () => {
    const selected = [...dropdown.selectedOptions].map(o => o.value);
    if (selected.length > 1 && selected.includes("all")) {
      [...dropdown.options].forEach(opt => {
        if (opt.value === "all") opt.selected = false;
      });
    }
    updateTotalAdjectives();
  });

  updateTotalAdjectives();
}

function updateTotalAdjectives() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o => o.value);
  let pool = adjectives;

  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(adj => adj.lesson.some(l => lessons.includes(l)));
  }

  const max = pool.length;
  document.getElementById("totalAdjectives").textContent = max;
  document.getElementById("numAdjQuestions").value = max;
}

// ------------------------- SHOW SECTIONS -------------------------
function startQuiz() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";
}

function startAdjectiveQuiz() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("adjQuiz").style.display = "block";
  buildAdjectiveLessonDropdown();
}

function showList() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("list").style.display = "block";
  const container = document.getElementById("verbTables");
  container.innerHTML = "";

  const grouped = {};
  verbs.forEach(v => {
    v.lesson.forEach(l => {
      if (!grouped[l]) grouped[l] = [];
      grouped[l].push(v);
    });
  });

  Object.keys(grouped).sort((a, b) => a - b).forEach(lesson => {
    const verbsForLesson = grouped[lesson];
    let table = `
      <h3 class="lesson-heading">Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Kanji</th><th>Dict</th><th>て-form(s)</th><th>ます-form(s)</th>
            <th>Past short</th><th>Past short negative</th><th>Type</th><th>Meaning</th>
          </tr>
        </thead><tbody>`;
    verbsForLesson.forEach(v => {
      table += `
        <tr>
          <td>${v.kanji || ""}</td>
          <td>${v.dict}</td>
          <td>${v.te.join(", ")}</td>
          <td>${v.masu.join(", ")}</td>
          <td>${(v.past_short || []).join(", ")}</td>
          <td>${(v.past_short_negative || []).join(", ")}</td>
          <td>${v.type}</td>
          <td>${v.meaning}</td>
        </tr>`;
    });
    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

function showAdjectives() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("adjectives").style.display = "block";
  const container = document.getElementById("adjectiveTables");
  container.innerHTML = "";

  const grouped = {};
  adjectives.forEach(adj => {
    adj.lesson.forEach(l => {
      if (!grouped[l]) grouped[l] = [];
      grouped[l].push(adj);
    });
  });

  Object.keys(grouped).sort((a, b) => a - b).forEach(lesson => {
    const adjectivesForLesson = grouped[lesson];
    let table = `
      <h3 class="lesson-heading">Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>Kanji</th><th>Dict</th><th>Type</th><th>Meaning</th>
          </tr>
        </thead><tbody>`;
    adjectivesForLesson.forEach(adj => {
      table += `
        <tr>
          <td>${adj.kanji || ""}</td>
          <td>${adj.dict}</td>
          <td>${adj.type}</td>
          <td>${adj.meaning}</td>
        </tr>`;
    });
    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

// ------------------------- QUIZZES -------------------------
let currentQuestions = [];
let currentType = "te";

function generateQuiz() {
  const numInput = document.getElementById("numQuestions");
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o => o.value);
  currentType = document.getElementById("quizType").value;

  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v => v.lesson.some(l => lessons.includes(l)));
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
    let answers = v[currentType] || [];
    form.innerHTML += `
      <div class="mb-3">
        <label class="form-label">Q${i + 1}: ${(v.kanji || v.dict)} (${v.meaning}) → ${currentType.replace("_", " ")}?</label>
        <input type="text" class="form-control" name="q${i}" data-answers='${JSON.stringify(answers)}'>
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
      output += `<div class="alert alert-success">✅ Q${i + 1}: Correct!<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")} (${v.type})</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i + 1}: Incorrect<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")} (${v.type})</div>`;
    }
  });
  output += `<p class="fw-bold">Final Score: ${score}/${currentQuestions.length}</p>`;
  document.getElementById("quiz").style.display = "none";
  document.getElementById("results").style.display = "block";
  document.getElementById("resultsContent").innerHTML = output;
}

// ------------------------- ADJECTIVE QUIZ -------------------------
let currentAdjQuestions = [];

function generateAdjectiveQuiz() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o => o.value);
  let pool = adjectives;

  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(adj => adj.lesson.some(l => lessons.includes(l)));
  }

  const num = Math.min(parseInt(document.getElementById("numAdjQuestions").value), pool.length);
  currentAdjQuestions = shuffle([...pool]).slice(0, num);

  const form = document.getElementById("adjQuizForm");
  form.innerHTML = "";
  currentAdjQuestions.forEach((adj, i) => {
    form.innerHTML += `
      <div class="mb-3">
        <label class="form-label">Q${i + 1}: ${(adj.kanji || adj.dict)} (${adj.meaning}) → て-form?</label>
        <input type="text" class="form-control" name="adjQ${i}" data-answers='${JSON.stringify(adj.te)}'>
      </div>`;
  });
  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;
}

function checkAdjectiveAnswers() {
  let score = 0;
  let output = "";
  currentAdjQuestions.forEach((adj, i) => {
    const input = document.querySelector(`[name=adjQ${i}]`);
    const userAnswer = input.value.trim();
    const validAnswers = JSON.parse(input.getAttribute("data-answers"));
    if (validAnswers.includes(userAnswer)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i + 1}: Correct!<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i + 1}: Incorrect<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
    }
  });
  output += `<p class="fw-bold">Final Score: ${score}/${currentAdjQuestions.length}</p>`;

  document.getElementById("adjQuiz").style.display = "none";
  document.getElementById("results").style.display = "block";
  document.getElementById("resultsContent").innerHTML = output;
}

// ------------------------- UTIL -------------------------
function reset() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("adjQuiz").style.display = "none";
  document.getElementById("results").style.display = "none";
  document.getElementById("list").style.display = "none";
  document.getElementById("adjectives").style.display = "none";
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

function setMaxQuestions() {
  const max = parseInt(document.getElementById("totalVerbs").textContent);
  document.getElementById("numQuestions").value = max;
}

function setMaxAdjectiveQuestions() {
  document.getElementById("numAdjQuestions").value = adjectives.length;
}
