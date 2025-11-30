let verbs = [];
let adjectives = [];
let lastQuizType = null; // "verb" or "adjective"
let lastQuizSettings = {}; // store lesson selection, number of questions, and form type


// ------------------------- INIT -------------------------
function initApp() {
  fetch("js/verbs.json")
    .then(r => r.json())
    .then(data => {
      verbs = []
        .concat(data["u-verbs"])
        .concat(data["ru-verbs"])
        .concat(data["irregular"]);
      verbs.forEach(v => { if (!Array.isArray(v.lesson)) v.lesson = [v.lesson]; });
      buildLessonDropdown();
      updateTotalVerbs();
    }).catch(e => console.error("Error loading verbs.json:", e));

  fetch("js/adjectives.json")
    .then(r => r.json())
    .then(data => {
      adjectives = data["adjectives"];
      adjectives.forEach(a => { if (!Array.isArray(a.lesson)) a.lesson = [a.lesson]; });
      buildAdjectiveLessonDropdown();
    }).catch(e => console.error("Error loading adjectives.json:", e));
}

document.addEventListener("DOMContentLoaded", initApp);

// ------------------------- VERB HELPERS -------------------------
function buildLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => v.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a, b) => a - b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);
  dropdown.addEventListener("change", updateTotalVerbs);
  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
}

function updateTotalVerbs() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o => o.value);
  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v => v.lesson.some(l => lessons.includes(l)));
  }
  if (document.getElementById("skipIrregular").checked) pool = pool.filter(v => v.type !== "irregular");
  document.getElementById("totalVerbs").textContent = pool.length;
  document.getElementById("numQuestions").value = pool.length;
}

// ------------------------- ADJECTIVE HELPERS -------------------------
function buildAdjectiveLessonDropdown() {
  const lessons = new Set();
  adjectives.forEach(a => a.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("adjLessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a, b) => a - b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);
  dropdown.addEventListener("change", updateTotalAdjectives);
  updateTotalAdjectives();
}

function updateTotalAdjectives() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o => o.value);
  let pool = adjectives;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(a => a.lesson.some(l => lessons.includes(l)));
  }
  document.getElementById("totalAdjectives").textContent = pool.length;
  document.getElementById("numAdjQuestions").value = pool.length;
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
    const l = v.lesson;
    if (!grouped[l]) grouped[l] = [];
    grouped[l].push(v);
  });

  Object.keys(grouped).sort((a, b) => a - b).forEach(lesson => {
    let verbsForLesson = grouped[lesson];

    let table = `
      <h3 class="lesson-heading">Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>Kanji</th>
          <th>Dict</th>
          <th>て-form(s)</th>
          <th>ます-form(s)</th>
          <th>Present Short Negative</th>
          <th>Past Short</th>
          <th>Past Short Negative</th>
          <th>Type</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
    `;

    verbsForLesson.forEach(v => {
      table += `
        <tr>
          <td>${v.kanji || ""}</td>
          <td>${v.dict}</td>
          <td>${(v["te-form"] || []).join(", ")}</td>
          <td>${(v.masu || []).join(", ")}</td>
          <td>${(v.present_short_negative || []).join(", ")}</td>
          <td>${(v.past_short_affirmative || []).join(", ")}</td>
          <td>${(v.past_short_negative || []).join(", ")}</td>
          <td>${v.type}</td>
          <td>${v.meaning}</td>
        </tr>
      `;
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
  adjectives.forEach(a => {
    const l = a.lesson;
    if (!grouped[l]) grouped[l] = [];
    grouped[l].push(a);
  });

  Object.keys(grouped).sort((a, b) => a - b).forEach(lesson => {
    let adjForLesson = grouped[lesson];

    let table = `
      <h3 class="lesson-heading">Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
      <thead class="table-dark">
        <tr>
          <th>Kanji</th>
          <th>Dict</th>
          <th>て-form(s)</th>
          <th>Present Short Negative</th>
          <th>Past Short</th>
          <th>Past Short Negative</th>
          <th>Type</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
    `;

    adjForLesson.forEach(a => {
      table += `
        <tr>
          <td>${a.kanji || ""}</td>
          <td>${a.dict}</td>
          <td>${(a["te-form"] || []).join(", ")}</td>
          <td>${(a.present_short_negative || []).join(", ")}</td>
          <td>${(a.past_short_affirmative || []).join(", ")}</td>
          <td>${(a.past_short_negative || []).join(", ")}</td>
          <td>${a.type}</td>
          <td>${a.meaning}</td>
        </tr>
      `;
    });

    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

function goBackToQuiz() {
  document.getElementById("results").style.display = "none";

  if (lastQuizType === "verb") {
    document.getElementById("quiz").style.display = "block";

    // Restore lesson selection
    const lessonDropdown = document.getElementById("lessonFilter");
    [...lessonDropdown.options].forEach(opt => {
      opt.selected = lastQuizSettings.selectedLessons.includes(opt.value);
    });

    // Restore quiz settings
    document.getElementById("numQuestions").value = lastQuizSettings.numQuestions;
    document.getElementById("quizType").value = lastQuizSettings.quizType;
    document.getElementById("skipIrregular").checked = lastQuizSettings.skipIrregular;

    // Re-generate the quiz with previous settings
    generateQuiz();

  } else if (lastQuizType === "adjective") {
    document.getElementById("adjQuiz").style.display = "block";

    // Restore lesson selection
    const adjDropdown = document.getElementById("adjLessonFilter");
    [...adjDropdown.options].forEach(opt => {
      opt.selected = lastQuizSettings.selectedLessons.includes(opt.value);
    });

    // Restore quiz settings
    document.getElementById("numAdjQuestions").value = lastQuizSettings.numQuestions;
    document.getElementById("adjQuizType").value = lastQuizSettings.quizType;

    // Re-generate the adjective quiz
    generateAdjectiveQuiz();
  }
}


// ------------------------- VERB QUIZ -------------------------
let currentQuestions = [], currentType = "te";
const typeMap = {
  "te": "te-form",
  "masu": "masu",
  "present_short_negative": "present_short_negative",
  "past_short_affirmative": "past_short_affirmative",
  "past_short_negative": "past_short_negative"
};

function generateQuiz() {
  const numInput = document.getElementById("numQuestions");
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o => o.value);
  currentType = document.getElementById("quizType").value;
  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v => v.lesson.some(l => lessons.includes(l)));
  }
  if (document.getElementById("skipIrregular").checked) pool = pool.filter(v => v.type !== "irregular");

  const num = Math.min(parseInt(numInput.value), pool.length);
  currentQuestions = shuffle([...pool]).slice(0, num);

  const form = document.getElementById("quizForm");
  form.innerHTML = "";

  currentQuestions.forEach((v, i) => {
    const answers = v[typeMap[currentType]] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i + 1}: ${(v.kanji || v.dict)} (${v.meaning}) → ${currentType.replace(/_/g, " ")}?</label>
      <input type="text" class="form-control" name="q${i}" data-answers='${encodeURIComponent(JSON.stringify(answers))}'>
    </div>`;
  });

  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;

  lastQuizType = "verb";
  lastQuizSettings = {
    selectedLessons: [...document.getElementById("lessonFilter").selectedOptions].map(o => o.value),
    numQuestions: parseInt(document.getElementById("numQuestions").value),
    quizType: document.getElementById("quizType").value,
    skipIrregular: document.getElementById("skipIrregular").checked
  };
}

function checkAnswers() {
  let score = 0, output = "";
  currentQuestions.forEach((v, i) => {
    const input = document.querySelector(`[name=q${i}]`);
    const userAnswer = input.value.trim();
    const validAnswers = JSON.parse(decodeURIComponent(input.getAttribute("data-answers")));
    if (validAnswers.includes(userAnswer)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i + 1}: ${(v.kanji || v.dict)} (${v.dict}) - Correct!<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i + 1}: ${(v.kanji || v.dict)} (${v.dict}) - Incorrect<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
    }
  });
  output += `<p class="fw-bold">Final Score: ${score}/${currentQuestions.length}</p>`;
  document.getElementById("quiz").style.display = "none";
  document.getElementById("results").style.display = "block";
  document.getElementById("resultsContent").innerHTML = output;
}

// ------------------------- ADJECTIVE QUIZ -------------------------
let currentAdjQuestions = [];
const typeMapAdj = {
  "te": "te-form",
  "past_short": "past_short_affirmative",
  "present_short_negative": "present_short_negative",
  "past_short_affirmative": "past_short_affirmative",
  "past_short_negative": "past_short_negative"
};

function generateAdjectiveQuiz() {
  const numInput = document.getElementById("numAdjQuestions");
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o => o.value);
  const type = document.getElementById("adjQuizType").value;

  let pool = adjectives;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(a => a.lesson.some(l => lessons.includes(l)));
  }

  const num = Math.min(parseInt(numInput.value), pool.length);
  currentAdjQuestions = shuffle([...pool]).slice(0, num);

  const form = document.getElementById("adjQuizForm");
  form.innerHTML = "";

  currentAdjQuestions.forEach((a, i) => {
    const answers = a[typeMapAdj[type]] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i + 1}: ${(a.kanji || a.dict)} (${a.meaning}) → ${type.replace(/_/g, " ")}?</label>
      <input type="text" class="form-control" name="adjQ${i}" data-answers='${encodeURIComponent(JSON.stringify(answers))}' data-dict='${a.dict}'>
    </div>`;
  });

  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;

  lastQuizType = "adjective";
  lastQuizSettings = {
    selectedLessons: [...document.getElementById("adjLessonFilter").selectedOptions].map(o => o.value),
    numQuestions: parseInt(document.getElementById("numAdjQuestions").value),
    quizType: document.getElementById("adjQuizType").value
  };

}

function checkAdjectiveAnswers() {
  let score = 0, output = "";
  const type = document.getElementById("adjQuizType").value;

  currentAdjQuestions.forEach((a, i) => {
    const input = document.querySelector(`[name=adjQ${i}]`);
    const userAnswer = input.value.trim();
    const validAnswers = JSON.parse(decodeURIComponent(input.getAttribute("data-answers")));
    const dict = input.getAttribute("data-dict");
    if (validAnswers.includes(userAnswer)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i + 1}: ${(a.kanji || a.dict)} (${dict}) - Correct!<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i + 1}: ${(a.kanji || a.dict)} (${dict}) - Incorrect<br>Your answer: <b>${userAnswer}</b><br>Answers: ${validAnswers.join(", ")}</div>`;
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
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function setMaxQuestions() {
  document.getElementById("numQuestions").value = parseInt(document.getElementById("totalVerbs").textContent);
}

function setMaxAdjectiveQuestions() {
  document.getElementById("numAdjQuestions").value = parseInt(document.getElementById("totalAdjectives").textContent);
}
