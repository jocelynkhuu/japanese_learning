let verbs = [];
let adjectives = [];

// Load JSON files
async function loadData() {
  const [verbRes, adjRes] = await Promise.all([
    fetch("verbs.json"),
    fetch("adjectives.json")
  ]);
  verbs = await verbRes.json();
  adjectives = await adjRes.json();
}

// Utility: shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Generate quiz question
function generateQuiz(data, type, count = 10) {
  const selected = shuffle(data).slice(0, count);
  return selected.map(item => ({
    ...item,
    correct: getAnswer(item, type)
  }));
}

// Return correct form depending on quiz type
function getAnswer(item, type) {
  switch (type) {
    case "te": return item.te?.[0] || "";
    case "shortPresent": return item.short?.[0] || "";
    case "shortNegative": return item.shortNegative?.[0] || "";
    case "past": return item.past?.[0] || "";
    case "pastNegative": return item.pastNegative?.[0] || "";
    default: return "";
  }
}

// Render quiz
function renderQuiz(container, quizData, type) {
  container.innerHTML = `
    <form id="quizForm">
      ${quizData.map((q, i) => `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${q.kanji || q.dict}</h5>
            <p class="card-text text-muted">(${q.meaning})</p>
            <input type="text" class="form-control" name="q${i}" placeholder="Your answer">
          </div>
        </div>
      `).join("")}
      <button type="submit" class="btn btn-primary">Submit Answers</button>
    </form>
  `;

  const form = container.querySelector("#quizForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    let correct = 0;
    const results = quizData.map((q, i) => {
      const userAnswer = formData.get(`q${i}`).trim();
      const isCorrect = q.correct === userAnswer;
      if (isCorrect) correct++;
      return { q, userAnswer, isCorrect };
    });

    container.innerHTML = `
      <h4>Results</h4>
      <p>You got ${correct}/${quizData.length} correct.</p>
      ${results.map(r => `
        <div class="card mb-2 ${r.isCorrect ? 'border-success' : 'border-danger'}">
          <div class="card-body">
            <strong>${r.q.dict}</strong> (${r.q.meaning})<br>
            <span class="text-muted">${r.q.type}</span><br>
            <span>${r.isCorrect ? "✅ Correct!" : "❌ Incorrect"}</span><br>
            <b>Your answer:</b> ${r.userAnswer || "(blank)"}<br>
            <b>Correct answer:</b> ${r.correct}
          </div>
        </div>
      `).join("")}
      <button class="btn btn-secondary mt-3" id="restartQuiz">Restart Quiz</button>
    `;

    container.querySelector("#restartQuiz").addEventListener("click", () => {
      renderQuiz(container, quizData, type);
    });
  });
}

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();

  // Verb quiz
  document.getElementById("startVerbQuiz").addEventListener("click", () => {
    const type = document.getElementById("verbQuizType").value;
    const quizData = generateQuiz(verbs, type);
    renderQuiz(document.getElementById("verbQuizContainer"), quizData, type);
  });

  // Adjective quiz
  document.getElementById("startAdjectiveQuiz").addEventListener("click", () => {
    const type = document.getElementById("adjectiveQuizType").value;
    const quizData = generateQuiz(adjectives, type);
    renderQuiz(document.getElementById("adjectiveQuizContainer"), quizData, type);
  });
});
