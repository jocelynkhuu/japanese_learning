let verbs = [];
let adjectives = [];

// ------------------------- INIT -------------------------
function initApp() {
  fetch("js/verbs.json")
    .then(r => r.json())
    .then(data => {
      verbs = [].concat(data["u-verbs"], data["ru-verbs"], data["irregular"]);
      verbs.forEach(v => { if (!Array.isArray(v.lesson)) v.lesson = [v.lesson]; });
      buildLessonDropdown();
      updateTotalVerbs();
    });

  fetch("js/adjectives.json")
    .then(r => r.json())
    .then(data => {
      adjectives = data["adjectives"];
      adjectives.forEach(adj => { if (!Array.isArray(adj.lesson)) adj.lesson = [adj.lesson]; });
    });
}

document.addEventListener("DOMContentLoaded", initApp);

// ------------------------- VERB HELPERS -------------------------
function buildLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => v.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l=> dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);

  dropdown.addEventListener("change", updateTotalVerbs);
  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
}

function updateTotalVerbs() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v=>v.lesson.some(l=>lessons.includes(l)));
  }
  if (document.getElementById("skipIrregular").checked) {
    pool = pool.filter(v=>v.type!=="irregular");
  }
  document.getElementById("totalVerbs").textContent = pool.length;
  document.getElementById("numQuestions").value = pool.length;
}

// ------------------------- ADJECTIVE HELPERS -------------------------
function buildAdjectiveLessonDropdown() {
  const lessons = new Set();
  adjectives.forEach(a => a.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("adjLessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l=> dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);
  dropdown.addEventListener("change", updateTotalAdjectives);
  updateTotalAdjectives();
}

function updateTotalAdjectives() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);
  let pool = adjectives;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(a=>a.lesson.some(l=>lessons.includes(l)));
  }
  document.getElementById("totalAdjectives").textContent = pool.length;
  document.getElementById("numAdjQuestions").value = pool.length;
}

// ------------------------- SECTION DISPLAY -------------------------
function startQuiz() {
  document.getElementById("menu").style.display="none";
  document.getElementById("quiz").style.display="block";
}

function startAdjectiveQuiz() {
  document.getElementById("menu").style.display="none";
  document.getElementById("adjQuiz").style.display="block";
  buildAdjectiveLessonDropdown();
}

function showList() {
  document.getElementById("menu").style.display="none";
  document.getElementById("list").style.display="block";
  const c = document.getElementById("verbTables");
  c.innerHTML="";
  const grouped = {};
  verbs.forEach(v=>v.lesson.forEach(l=>{
    if(!grouped[l]) grouped[l]=[];
    grouped[l].push(v);
  }));
  Object.keys(grouped).sort((a,b)=>a-b).forEach(lesson=>{
    const list = grouped[lesson];
    let table = `<h3 class="lesson-heading">Lesson ${lesson}</h3>
    <table class="table table-striped table-bordered"><thead class="table-dark">
    <tr><th>Kanji</th><th>Dict</th><th>て-form</th><th>ます-form</th><th>Past short</th><th>Past short neg</th><th>Type</th><th>Meaning</th></tr></thead><tbody>`;
    list.forEach(v=>{
      table += `<tr><td>${v.kanji||""}</td><td>${v.dict}</td><td>${(v.te||[]).join(", ")}</td>
      <td>${(v.masu||[]).join(", ")}</td><td>${(v.past_short||[]).join(", ")}</td>
      <td>${(v.past_short_negative||[]).join(", ")}</td><td>${v.type}</td><td>${v.meaning}</td></tr>`;
    });
    c.innerHTML += table + "</tbody></table>";
  });
}

function showAdjectives() {
  document.getElementById("menu").style.display="none";
  document.getElementById("adjectives").style.display="block";
  const c = document.getElementById("adjectiveTables");
  c.innerHTML="";
  const grouped={};
  adjectives.forEach(a=>a.lesson.forEach(l=>{
    if(!grouped[l]) grouped[l]=[];
    grouped[l].push(a);
  }));
  Object.keys(grouped).sort((a,b)=>a-b).forEach(lesson=>{
    const list = grouped[lesson];
    let table=`<h3 class="lesson-heading">Lesson ${lesson}</h3>
    <table class="table table-striped table-bordered"><thead class="table-dark">
    <tr><th>Kanji</th><th>Dict</th><th>Type</th><th>Meaning</th></tr></thead><tbody>`;
    list.forEach(a=>{
      table += `<tr><td>${a.kanji||""}</td><td>${a.dict}</td><td>${a.type}</td><td>${a.meaning}</td></tr>`;
    });
    c.innerHTML += table + "</tbody></table>";
  });
}

// ------------------------- QUIZ LOGIC -------------------------
let currentQuestions=[], currentType="te";

function generateQuiz() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  let pool = verbs;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v=>v.lesson.some(l=>lessons.includes(l)));
  }
  if (document.getElementById("skipIrregular").checked)
    pool = pool.filter(v=>v.type!=="irregular");

  currentType = document.getElementById("quizType").value;
  const num = Math.min(parseInt(document.getElementById("numQuestions").value), pool.length);
  currentQuestions = shuffle([...pool]).slice(0,num);

  const form = document.getElementById("quizForm");
  form.innerHTML="";
  currentQuestions.forEach((v,i)=>{
    let answers = v[currentType] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i+1}: ${(v.kanji||v.dict)} (${v.meaning}) → ${currentType.replace("_"," ")}?</label>
      <input type="text" class="form-control" name="q${i}" data-answers='${JSON.stringify(answers)}'>
    </div>`;
  });
  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;
}

function checkAnswers() {
  let score=0, output="";
  currentQuestions.forEach((v,i)=>{
    const input = document.querySelector(`[name=q${i}]`);
    const user = input.value.trim();
    const valid = JSON.parse(input.dataset.answers);
    if (valid.includes(user)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i+1}: ${v.dict} - Correct!<br>Your: <b>${user}</b><br>Answers: ${valid.join(", ")}</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i+1}: ${v.dict} - Incorrect<br>Your: <b>${user}</b><br>Answers: ${valid.join(", ")}</div>`;
    }
  });
  output += `<p class="fw-bold">Score: ${score}/${currentQuestions.length}</p>`;
  document.getElementById("quiz").style.display="none";
  document.getElementById("results").style.display="block";
  document.getElementById("resultsContent").innerHTML = output;
}

// ------------------------- ADJECTIVE QUIZ -------------------------
let currentAdjQuestions=[];

function generateAdjectiveQuiz() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);
  let pool = adjectives;
  if (!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(a=>a.lesson.some(l=>lessons.includes(l)));
  }

  const quizType = document.getElementById("adjQuizType").value;
  const num = Math.min(parseInt(document.getElementById("numAdjQuestions").value), pool.length);
  currentAdjQuestions = shuffle([...pool]).slice(0,num);

  const form = document.getElementById("adjQuizForm");
  form.innerHTML="";
  currentAdjQuestions.forEach((a,i)=>{
    let answers = a[quizType] || [];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i+1}: ${(a.kanji||a.dict)} (${a.meaning}) → ${quizType.replace("_"," ")}?</label>
      <input type="text" class="form-control" name="adjQ${i}" data-answers='${JSON.stringify(answers)}'>
    </div>`;
  });
  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;
}

function checkAdjectiveAnswers() {
  let score=0, output="";
  currentAdjQuestions.forEach((a,i)=>{
    const input=document.querySelector(`[name=adjQ${i}]`);
    const user=input.value.trim();
    const valid=JSON.parse(input.dataset.answers);
    if (valid.includes(user)) {
      score++;
      output += `<div class="alert alert-success">✅ Q${i+1}: ${a.dict} - Correct!<br>Your: <b>${user}</b><br>Answers: ${valid.join(", ")}</div>`;
    } else {
      output += `<div class="alert alert-danger">❌ Q${i+1}: ${a.dict} - Incorrect<br>Your: <b>${user}</b><br>Answers: ${valid.join(", ")}</div>`;
    }
  });
  output += `<p class="fw-bold">Score: ${score}/${currentAdjQuestions.length}</p>`;
  document.getElementById("adjQuiz").style.display="none";
  document.getElementById("results").style.display="block";
  document.getElementById("resultsContent").innerHTML = output;
}

// ------------------------- UTIL -------------------------
function reset() {
  ["quiz","adjQuiz","results","list","adjectives"].forEach(id=>document.getElementById(id).style.display="none");
  document.getElementById("menu").style.display="block";
}

function shuffle(arr){
  let m=arr.length,t,i;
  while(m){i=Math.floor(Math.random()*m--);t=arr[m];arr[m]=arr[i];arr[i]=t;}
  return arr;
}

function setMaxQuestions(){document.getElementById("numQuestions").value=document.getElementById("totalVerbs").textContent;}
function setMaxAdjectiveQuestions(){document.getElementById("numAdjQuestions").value=document.getElementById("totalAdjectives").textContent;}
