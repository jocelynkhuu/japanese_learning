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
      adjectives.forEach(a => { if (!Array.isArray(a.lesson)) a.lesson = [a.lesson]; });
    });
}

document.addEventListener("DOMContentLoaded", initApp);

// ------------------------- VERB HELPERS -------------------------
function buildLessonDropdown() {
  const lessons = new Set();
  verbs.forEach(v => v.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("lessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);
  dropdown.addEventListener("change", updateTotalVerbs);
  document.getElementById("skipIrregular").onchange = updateTotalVerbs;
}

function updateTotalVerbs() {
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  let pool = verbs;
  if(!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(v=>v.lesson.some(l=>lessons.includes(l)));
  }
  if(document.getElementById("skipIrregular").checked) pool = pool.filter(v=>v.type!=="irregular");
  document.getElementById("totalVerbs").textContent = pool.length;
  document.getElementById("numQuestions").value = pool.length;
}

// ------------------------- ADJECTIVE HELPERS -------------------------
function buildAdjectiveLessonDropdown() {
  const lessons = new Set();
  adjectives.forEach(adj => adj.lesson.forEach(l => lessons.add(l)));
  const dropdown = document.getElementById("adjLessonFilter");
  dropdown.innerHTML = `<option value="all" selected>All Lessons</option>`;
  [...lessons].sort((a,b)=>a-b).forEach(l => dropdown.innerHTML += `<option value="${l}">Lesson ${l}</option>`);
  dropdown.addEventListener("change", updateTotalAdjectives);
  updateTotalAdjectives();
}

function updateTotalAdjectives() {
  const selected = [...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);
  let pool = adjectives;
  if(!selected.includes("all")) {
    const lessons = selected.map(Number);
    pool = pool.filter(adj=>adj.lesson.some(l=>lessons.includes(l)));
  }
  document.getElementById("totalAdjectives").textContent = pool.length;
  document.getElementById("numAdjQuestions").value = pool.length;
}

// ------------------------- SHOW SECTIONS -------------------------
function startQuiz() { document.getElementById("menu").style.display="none"; document.getElementById("quiz").style.display="block"; }
function startAdjectiveQuiz() { document.getElementById("menu").style.display="none"; document.getElementById("adjQuiz").style.display="block"; buildAdjectiveLessonDropdown(); }
function showList() { /* existing verb table code */ }
function showAdjectives() { /* existing adjective table code */ }

// ------------------------- QUIZZES -------------------------
let currentQuestions=[], currentType="te";
function generateQuiz() {
  const num = parseInt(document.getElementById("numQuestions").value);
  currentType = document.getElementById("quizType").value;
  let pool = verbs;
  const selected = [...document.getElementById("lessonFilter").selectedOptions].map(o=>o.value);
  if(!selected.includes("all")) { const lessons = selected.map(Number); pool = pool.filter(v=>v.lesson.some(l=>lessons.includes(l))); }
  if(document.getElementById("skipIrregular").checked) pool = pool.filter(v=>v.type!=="irregular");
  currentQuestions = shuffle([...pool]).slice(0,num);
  const form = document.getElementById("quizForm"); form.innerHTML="";
  currentQuestions.forEach((v,i)=>{
    let answers = v[currentType]||[];
    form.innerHTML += `<div class="mb-3">
      <label class="form-label">Q${i+1}: ${(v.kanji||v.dict)} (${v.meaning}) → ${currentType.replace("_"," ")}?</label>
      <input type="text" class="form-control" name="q${i}" data-answers='${JSON.stringify(answers)}'>
    </div>`;
  });
  form.innerHTML += `<button type="submit" class="btn btn-success">Submit Answers</button>`;
}

function checkAnswers() {
  let score=0,output="";
  currentQuestions.forEach((v,i)=>{
    const input=document.querySelector(`[name=q${i}]`);
    const ans=input.value.trim();
    const valid=JSON.parse(input.getAttribute("data-answers"))||[];
    const correct = valid.some(a=>a.replace(/\s+/g,"")===ans.replace(/\s+/g,""));
    if(correct) score++;
    output += `<div class="alert ${correct?"alert-success":"alert-danger"}">
      ${correct?"✅ Correct!":"❌ Incorrect"}<br>Q${i+1}: ${(v.kanji||v.dict)} (${v.meaning})<br>
      Your answer: <b>${ans}</b><br>Correct answer(s): ${valid.join(", ")}</div>`;
  });
  output+=`<p class="fw-bold">Final Score: ${score}/${currentQuestions.length}</p>`;
  document.getElementById("quiz").style.display="none";
  document.getElementById("results").style.display="block";
  document.getElementById("resultsContent").innerHTML=output;
}

// ------------------------- ADJECTIVE QUIZ -------------------------
let currentAdjQuestions=[],currentAdjType="te";
function generateAdjectiveQuiz() {
  const num=parseInt(document.getElementById("numAdjQuestions").value);
  currentAdjType=document.getElementById("adjQuizType").value;
  let pool=adjectives;
  const selected=[...document.getElementById("adjLessonFilter").selectedOptions].map(o=>o.value);
  if(!selected.includes("all")) { const lessons=selected.map(Number); pool=pool.filter(a=>a.lesson.some(l=>lessons.includes(l))); }
  currentAdjQuestions=shuffle([...pool]).slice(0,num
