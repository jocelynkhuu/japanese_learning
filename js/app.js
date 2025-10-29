let verbs = [];
let adjectives = [];

// ------------------------- INIT -------------------------
function initApp() {
  // Load verbs
  fetch("js/verbs.json")
    .then(r => r.json())
    .then(data => {
      verbs = []
        .concat(data["u-verbs"])
        .concat(data["ru-verbs"])
        .concat(data["irregular"]);

      verbs.forEach(v => {
        if (!Array.isArray(v.lesson)) v.lesson = [v.lesson];
      });

      buildVerbLessonDropdown();
      updateTotalVerbs();
    })
    .catch(err => console.error("Error loading verbs.json:", err));

  // Load adjectives
  fetch("js/adjectives.json")
    .then(r => r.json())
    .then(data => {
      adjectives = data["adjectives"];
      adjectives.forEach(a => {
        if (!Array.isArray(a.lesson)) a.lesson = [a.lesson];
      });

      buildAdjectiveLessonDropdown();
      updateTotalAdjectives();
    })
    .catch(err => console.error("Error loading adjectives.json:", err));

  bindMenuButtons();
}

// ------------------------- MENU BUTTONS -------------------------
function bindMenuButtons() {
  document.getElementById("btnVerbQuiz").onclick = () => showSection("quiz");
  document.getElementById("btnAdjQuiz").onclick = () => showSection("adjQuiz");
  document.getElementById("btnListVerbs").onclick = () => { showSection("list"); renderVerbList(); };
  document.getElementById("btnListAdjs").onclick = () => { showSection("adjectives"); renderAdjectiveList(); };

  document.getElementById("backMenu1").onclick =
  document.getElementById("backMenu2").onclick =
  document.getElementById("backMenu3").onclick =
  document.getElementById("backMenu4").onclick =
  document.getElementById("backMenu5").onclick = reset;

  document.getElementById("maxQuestionsBtn").onclick = setMaxQuestions;
  document.getElementById("maxAdjQuestionsBtn").onclick = setMaxAdjectiveQuestions;

  document.getElementById("startVerbQuiz").onclick = generateVerbQuiz;
  document.getElementById("startAdjQuiz").onclick = generateAdjectiveQuiz;
}

// ------------------------- SHOW / HIDE SECTIONS -------------------------
function showSection(id) {
  ["menu","quiz","adjQuiz","results","list","adjectives"].forEach(sec => {
    document.getElementById(sec).style.display = (sec === id) ? "block" : "none";
  });
}

function reset() {
  showSection("menu");
}

// ------------------------- SHUFFLE -------------------------
function shuffle(array) {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m]; array[m] = array[i]; array[i] = t;
  }
  return array;
}

// ------------------------- VERB DROPDOWN & COUNT -------------------------
function buildVerbLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => v.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);

  dropdown.onchange = updateTotalVerbs;
  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
}

function updateTotalVerbs() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  const skipIrregular = document.getElementById("skipIrregular").checked;

  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v => v.lesson.some(l => lessons.includes(l)));
  }
  if (skipIrregular) pool = pool.filter(v => v.type !== "irregular");

  document.getElementById("totalVerbs").textContent = pool.length;
  document.getElementById("numQuestions").value = pool.length;
}

// ------------------------- ADJECTIVE DROPDOWN & COUNT -------------------------
function buildAdjectiveLessonDropdown() {
  const lessons = new Set();
  adjectives.forEach(a => a.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("adjLessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);

  dropdown.onchange = updateTotalAdjectives;
}

function updateTotalAdjectives() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);

  let pool = adjectives;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(a => a.lesson.some(l => lessons.includes(l)));
  }

  document.getElementById("totalAdjectives").textContent = pool.length;
  document.getElementById("numAdjQuestions").value = pool.length;
}

// ------------------------- VERB LIST -------------------------
function renderVerbList() {
  const container = document.getElementById("verbTables");
  container.innerHTML = "";
  const grouped = {};
  verbs.forEach(v => v.lesson.forEach(l => {
    if (!grouped[l]) grouped[l]=[]; grouped[l].push(v);
  }));

  Object.keys(grouped).sort((a,b)=>a-b).forEach(lesson=>{
    const verbsForLesson = grouped[lesson];
    let table = `<h3>Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
      <thead class="table-dark">
      <tr><th>Kanji</th><th>Dict</th><th>て-form(s)</th><th>ます-form(s)</th>
      <th>Past short</th><th>Past short negative</th><th>Type</th><th>Meaning</th></tr>
      </thead><tbody>`;
    verbsForLesson.forEach(v=>{
      table += `<tr>
        <td>${v.kanji||""}</td>
        <td>${v.dict}</td>
        <td>${v.te.join(", ")}</td>
        <td>${v.masu.join(", ")}</td>
        <td>${(v.past_short||[]).join(", ")}</td>
        <td>${(v.past_short_negative||[]).join(", ")}</td>
        <td>${v.type}</td>
        <td>${v.meaning}</td>
      </tr>`;
    });
    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

// ------------------------- ADJECTIVE LIST -------------------------
function renderAdjectiveList() {
  const container = document.getElementById("adjectiveTables");
  container.innerHTML = "";
  const grouped = {};
  adjectives.forEach(a => a.lesson.forEach(l => {
    if (!grouped[l]) grouped[l]=[];
    grouped[l].push(a);
  }));

  Object.keys(grouped).sort((a,b)=>a-b).forEach(lesson=>{
    const adjs = grouped[lesson];
    let table = `<h3>Lesson ${lesson}</h3>
      <table class="table table-striped table-bordered">
      <thead class="table-dark">
      <tr><th>Kanji</th><th>Dict</th><th>Type</th><th>Meaning</th></tr>
      </thead><tbody>`;
    adjs.forEach(a=>{
      table += `<tr>
        <td>${a.kanji||""}</td>
        <td>${a.dict}</td>
        <td>${a.type}</td>
        <td>${a.meaning}</td>
      </tr>`;
    });
    table += "</tbody></table>";
    container.innerHTML += table;
  });
}

// ------------------------- VERB QUIZ -------------------------
let currentVerbQuestions = [];
let currentVerbType = "te";

function generateVerbQuiz() {
  const num = Math.min(parseInt(document.getElementById("numQuestions").value), verbs.length);
  const selectedLessons = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  const skipIrregular = document.getElementById("skipIrregular").checked;
  currentVerbType = document.getElementById("quizType").value;

  let pool = verbs;
  if (!selectedLessons.includes("all")) {
    const lessons = selectedLessons.map(Number);
    pool = pool.filter(v=>v.lesson.some(l=>lessons.includes(l)));
  }
  if (skipIrregular) pool = pool.filter(v=>v.type!=="irregular");

  currentVerbQuestions = shuffle(pool).slice(0, num);
  renderVerbQuizForm();
}

function renderVerbQuizForm() {
  const form = document.getElementById("quizForm");
  form.innerHTML = "";
  currentVerbQuestions.forEach((v,i)=>{
    const answers = v[currentVerbType] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i+1}: ${v.kanji||v.dict} (${v.meaning}) → ${currentVerbType.replace("_"," ")}?</label>
      <input type="text" class="form-control" name="q${i}" data-answers='${JSON.stringify(answers)}'>
    </div>`;
  });
  form.innerHTML += `<button type="button" class="btn btn-success" onclick="checkVerbAnswers()">Submit Answers</button>`;
}

function checkVerbAnswers() {
  let score = 0, output = "";
  currentVerbQuestions.forEach((v,i)=>{
    const input = document.querySelector(`[name=q${i}]`);
    const user = input.value.trim();
    const answers = JSON.parse(input.getAttribute("data-answers"));
    if (answers.includes(user)) {
      score++; output+=`<div class="alert alert-success">✅ Q${i+1}: Correct!<br>Your answer: <b>${user}</b><br>Answers: ${answers.join(", ")}</div>`;
    } else {
      output+=`<div class="alert alert-danger">❌ Q${i+1}: Incorrect<br>Your answer: <b>${user}</b><br>Answers: ${answers.join(", ")}</div>`;
    }
  });
  output+=`<p class="fw-bold">Score: ${score}/${currentVerbQuestions.length}</p>`;
  document.getElementById("resultsContent").innerHTML = output;
  showSection("results");
}

// ------------------------- ADJECTIVE QUIZ -------------------------
let currentAdjQuestions = [];
let currentAdjType = "te";

function generateAdjectiveQuiz() {
  const num = Math.min(parseInt(document.getElementById("numAdjQuestions").value), adjectives.length);
  const selectedLessons = [...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);
  currentAdjType = document.getElementById("adjQuizType").value;

  let pool = adjectives;
  if (!selectedLessons.includes("all")) {
    const lessons = selectedLessons.map(Number);
    pool = pool.filter(a=>a.lesson.some(l=>lessons.includes(l)));
  }

  currentAdjQuestions = shuffle(pool).slice(0, num);
  renderAdjQuizForm();
}

function renderAdjQuizForm() {
  const form = document.getElementById("adjQuizForm");
  form.innerHTML = "";
  currentAdjQuestions.forEach((a,i)=>{
    const answers = a[currentAdjType] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i+1}: ${a.kanji||a.dict} (${a.meaning}) → ${currentAdjType.replace("_"," ")}?</label>
      <input type="text" class="form-control" name="adjQ${i}" data-answers='${JSON.stringify(answers)}'>
    </div>`;
  });
  form.innerHTML += `<button type="button" class="btn btn-success" onclick="checkAdjAnswers()">Submit Answers</button>`;
}

function checkAdjAnswers() {
  let score=0, output="";
  currentAdjQuestions.forEach((a,i)=>{
    const input = document.querySelector(`[name=adjQ${i}]`);
    const user = input.value.trim();
    const answers = JSON.parse(input.getAttribute("data-answers"));
    if (answers.includes(user)) { score++; output+=`<div class="alert alert-success">✅ Q${i+1}: Correct!<br>Your answer: <b>${user}</b><br>Answers: ${answers.join(", ")}</div>`; }
    else { output+=`<div class="alert alert-danger">❌ Q${i+1}: Incorrect<br>Your answer: <b>${user}</b><br>Answers: ${answers.join(", ")}</div>`; }
  });
  output+=`<p class="fw-bold">Score: ${score}/${currentAdjQuestions.length}</p>`;
  document.getElementById("resultsContent").innerHTML = output;
  showSection("results");
}

// ------------------------- MAX QUESTIONS -------------------------
function setMaxQuestions() {
  document.getElementById("numQuestions").value = parseInt(document.getElementById("totalVerbs").textContent);
}
function setMaxAdjectiveQuestions() {
  document.getElementById("numAdjQuestions").value = parseInt(document.getElementById("totalAdjectives").textContent);
}

// ------------------------- INIT -------------------------
document.addEventListener("DOMContentLoaded", initApp);
