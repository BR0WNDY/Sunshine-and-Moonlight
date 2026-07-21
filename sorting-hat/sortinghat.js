(function () {
  "use strict";

  const QUESTIONS = [
    {
      text: "Q1: Which trait do you value most?",
      options: [
        ["Bravery", "gryffindor"],
        ["Wisdom", "ravenclaw"],
        ["Loyalty", "hufflepuff"],
        ["Ambition", "slytherin"],
        ["You are a freak — why am I wearing a hat that can talk and read my brain!", "muggle"],
      ],
    },
    {
      text: "Q2: Where are you most likely to be found at Hogwarts?",
      options: [
        ["Running into danger to help a friend", "gryffindor"],
        ["In the library reading", "ravenclaw"],
        ["Helping others with homework", "hufflepuff"],
        ["Plotting how to get power", "slytherin"],
        ["Just being a normal struggling student", "muggle"],
      ],
    },
    {
      text: "Q3: What kind of friend are you?",
      options: [
        ["Brave protector", "gryffindor"],
        ["Smart idea generator", "ravenclaw"],
        ["Loyal supporter", "hufflepuff"],
        ["Ambitious motivator", "slytherin"],
        ["Just a normal friend", "muggle"],
      ],
    },
    {
      text: "Q4: How do you brush your teeth?",
      options: [
        ["I'm too brave to skip brushing my teeth", "gryffindor"],
        ["While I'm reading", "ravenclaw"],
        ["While I'm making a sandwich", "hufflepuff"],
        ["I'm rich enough to own an electric toothbrush", "slytherin"],
        ["Just… in the bathroom like normal", "muggle"],
      ],
    },
    {
      text: "Q5: What's your favorite subject?",
      options: [
        ["DADA (Defence Against the Dark Arts) and Animagus", "gryffindor"],
        ["Astronomy and Charms", "ravenclaw"],
        ["Care of Magical Creatures and Herbology", "hufflepuff"],
        ["I want motivation… for the Dark Arts", "slytherin"],
        ["I don't know what that means, freaking hat!!!", "muggle"],
      ],
    },
    {
      text: "Q6: What's your dream job in the Wizarding World?",
      options: [
        ["Auror with an Order of Merlin", "gryffindor"],
        ["Astronomer and Professor at Hogwarts", "ravenclaw"],
        ["Magizoologist / Mediwizard", "hufflepuff"],
        ["Rich enough to never need a job", "slytherin"],
        ["I don't know what that means, freaking hat!!!", "muggle"],
      ],
    },
    {
      text: "Q7: What do you do when you find a mysterious glowing door at Hogwarts?",
      options: [
        ["Open it immediately — adventure waits!", "gryffindor"],
        ["Study the symbols and decode the magic behind it", "ravenclaw"],
        ["Find a professor — I don't want anyone to get hurt", "hufflepuff"],
        ["Try to claim whatever power is behind it before anyone else does", "slytherin"],
        ["WHAT IS THAT?? That's not normal!!", "muggle"],
      ],
    },
    {
      text: "Q8: Where are you most likely to be found at Hogwarts?",
      options: [
        ["Running into danger to help a friend", "gryffindor"],
        ["Reading in the library", "ravenclaw"],
        ["Helping classmates", "hufflepuff"],
        ["Plotting success", "slytherin"],
        ["WHAT IS THAT?? That's not normal!!", "muggle"],
      ],
    },
    {
      text: "Q9: Someone drops a bag full of Galleons. What do you do?",
      options: [
        ["Run after them to return it", "gryffindor"],
        ["Find clues to track down the owner", "ravenclaw"],
        ["Wait in place until they come back", "hufflepuff"],
        ["Pocket just a little bit!!!!", "slytherin"],
        ["Scream because money shouldn't fall from nowhere", "muggle"],
      ],
    },
  ];

  const Q10_ASIDE = [
    "[Albus]: I think I just doomed myself, Scorpius…",
    "[Scorpius]: Hey… it's okay. Even Muggles deserve magic in their lives.",
    "[Albus]: Really?",
    "[Scorpius]: You said my name once. That's all the magic I ever needed.",
  ];

  const RESULT_LINES = {
    Muggle: [
      "The Sorting Hat sighs…",
      "“MUGGLE!”",
      "{name}, you cannot attend Hogwarts. Please return to the train.",
      "",
      "[Albus]: Even if Hogwarts says no… your story isn't over.",
      "[Scorpius]: Magic or not, we're still with you.",
    ],
    default: [
      "The Sorting Hat roars: {house}!",
      "{name}, welcome to {house}!",
      "",
      "[Albus]: See? The Hat knew.",
      "[Scorpius]: Whatever House you're in… you'll never be alone here.",
    ],
  };

  const HOUSE_COLORS = {
    Gryffindor: ["#5c0f14", "#f4c86a"],
    Ravenclaw: ["#10214a", "#c9a86a"],
    Hufflepuff: ["#6b5000", "#fdf2c4"],
    Slytherin: ["#0b3d2a", "#cdeecb"],
    Muggle: ["#2c3444", "#d7deee"],
  };

  const MIN_QUESTIONS = 5;
  const MAX_QUESTIONS = QUESTIONS.length;

  const player = {
    name: "",
    assignedHouse: "Unsorted",
    scores: { gryffindor: 0, ravenclaw: 0, hufflepuff: 0, slytherin: 0, muggle: 0 },
    forceMuggle: false,
    aside: null,
  };
  const state = { questionIndex: 0, questions: QUESTIONS, totalSteps: QUESTIONS.length + 1 };

  function shuffledSample(arr, count) {
    const pool = arr.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bodyEl() {
    return document.getElementById("hatBody");
  }
  function progressEl() {
    return document.getElementById("hatProgress");
  }

  function setProgress(step) {
    progressEl().textContent = step ? `Question ${step} of ${state.totalSteps}` : "";
  }

  function sortIntoHouse() {
    if (player.forceMuggle) {
      player.assignedHouse = "Muggle";
      return;
    }
    const wizardKeys = ["gryffindor", "ravenclaw", "hufflepuff", "slytherin"];
    const wizardMax = Math.max(...wizardKeys.map((k) => player.scores[k]));
    const maxScore = Math.max(wizardMax, player.scores.muggle);

    if (maxScore === player.scores.gryffindor) player.assignedHouse = "Gryffindor";
    else if (maxScore === player.scores.ravenclaw) player.assignedHouse = "Ravenclaw";
    else if (maxScore === player.scores.hufflepuff) player.assignedHouse = "Hufflepuff";
    else if (maxScore === player.scores.slytherin) player.assignedHouse = "Slytherin";
    else player.assignedHouse = "Muggle";
  }

  function resetPlayer() {
    player.name = "";
    player.assignedHouse = "Unsorted";
    player.scores = { gryffindor: 0, ravenclaw: 0, hufflepuff: 0, slytherin: 0, muggle: 0 };
    player.forceMuggle = false;
    player.aside = null;
    state.questionIndex = 0;
  }

  function renderIntro() {
    resetPlayer();
    setProgress(0);
    bodyEl().innerHTML = `
      <p class="hat-line">Welcome to Hogwarts!</p>
      <p class="hat-line">You are in a Sorting House Ceremony (or you are a Muggle).</p>
      <p class="hat-line">You are wearing a sorting hat placed by Headmistress Professor McGonagall.</p>
      <p class="hat-question">Are you ready?</p>
      <div class="hat-options">
        <button class="hat-opt" id="optYes">Yes</button>
        <button class="hat-opt" id="optNo">No</button>
      </div>
    `;
    document.getElementById("optYes").addEventListener("click", () =>
      renderName("The Great Hall falls silent. The Hat awakens…")
    );
    document.getElementById("optNo").addEventListener("click", () =>
      renderName("Too bad! The Hat is already on your head…")
    );
  }

  function renderName(flavor) {
    bodyEl().innerHTML = `
      <p class="hat-line">${esc(flavor)}</p>
      <p class="hat-question">Enter your name:</p>
      <div class="hat-name-row">
        <input class="hat-input" id="nameInput" type="text" maxlength="40"
               placeholder="Your name" autocomplete="off" />
        <button class="hat-opt hat-opt-primary" id="nameGo">Continue</button>
      </div>
    `;
    const input = document.getElementById("nameInput");
    const go = () => {
      const value = input.value.trim();
      player.name = value || "Traveler";
      const count = MIN_QUESTIONS + Math.floor(Math.random() * (MAX_QUESTIONS - MIN_QUESTIONS + 1));
      state.questions = shuffledSample(QUESTIONS, count);
      state.totalSteps = count + 1;
      state.questionIndex = 0;
      renderQuestion();
    };
    document.getElementById("nameGo").addEventListener("click", go);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") go();
    });
    input.focus();
  }

  function renderQuestion() {
    const idx = state.questionIndex;
    const q = state.questions[idx];
    setProgress(idx + 1);

    const optsHtml = q.options
      .map(([label], i) => `<button class="hat-opt" id="opt${i}">${esc(label)}</button>`)
      .join("");

    bodyEl().innerHTML = `
      <p class="hat-question">${esc(q.text)}</p>
      <div class="hat-options">${optsHtml}</div>
    `;

    q.options.forEach(([, houseKey], i) => {
      document.getElementById(`opt${i}`).addEventListener("click", () => {
        if (houseKey === "muggle") {
          player.forceMuggle = true;
          player.scores.muggle += 1;
        } else {
          player.scores[houseKey] += 1;
        }
        advance();
      });
    });
  }

  function advance() {
    state.questionIndex += 1;
    if (state.questionIndex < state.questions.length) {
      renderQuestion();
    } else {
      renderQ10();
    }
  }

  function renderQ10() {
    setProgress(state.totalSteps);
    bodyEl().innerHTML = `
      <p class="hat-question">Q10: Which path calls to you?</p>
      <div class="hat-options">
        <button class="hat-opt" id="optA">Forest (wisdom + bravery)</button>
        <button class="hat-opt" id="optB">River (ambition + loyalty)</button>
        <button class="hat-opt" id="optC">What???</button>
      </div>
    `;
    document.getElementById("optA").addEventListener("click", () => {
      player.scores.gryffindor += 1;
      player.scores.ravenclaw += 1;
      finish();
    });
    document.getElementById("optB").addEventListener("click", () => {
      player.scores.hufflepuff += 1;
      player.scores.slytherin += 1;
      finish();
    });
    document.getElementById("optC").addEventListener("click", () => {
      player.forceMuggle = true;
      player.aside = Q10_ASIDE;
      finish();
    });
  }

  function finish() {
    sortIntoHouse();
    const house = player.assignedHouse;
    const template = RESULT_LINES[house] || RESULT_LINES.default;
    const lines = template.map((line) =>
      line.replace("{name}", player.name).replace("{house}", house)
    );
    const [bg, fg] = HOUSE_COLORS[house] || HOUSE_COLORS.Muggle;

    let asideHtml = "";
    if (player.aside) {
      asideHtml = `<div class="hat-aside">${player.aside
        .map((l) => `<p class="hat-line">${esc(l)}</p>`)
        .join("")}</div>`;
    }

    const linesHtml = lines
      .filter((l) => l)
      .map((l) => `<p class="hat-line">${esc(l)}</p>`)
      .join("");

    setProgress(0);
    bodyEl().innerHTML = `
      <div class="hat-result" style="--house-bg:${bg}; --house-fg:${fg}">
        <p class="hat-house">${esc(house)}</p>
        ${asideHtml}
        ${linesHtml}
        <button class="hat-opt hat-opt-primary" id="restart">Sort me again</button>
      </div>
    `;
    document.getElementById("restart").addEventListener("click", renderIntro);
  }

  window.jsStartHat = renderIntro;
})();
