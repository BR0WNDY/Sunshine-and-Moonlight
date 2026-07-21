import random

from pyscript import document, window
from pyodide.ffi import create_proxy


class House:
    def __init__(self):
        self.name = ""
        self.assigned_house = "Unsorted"
        self.scores = {"gryffindor": 0, "ravenclaw": 0, "hufflepuff": 0, "slytherin": 0, "muggle": 0}
        self.force_muggle = False
        self.aside = None

    def add(self, key):
        self.scores[key] += 1

    def set_force_muggle(self):
        self.force_muggle = True

    def sort_into_house(self):
        if self.force_muggle:
            self.assigned_house = "Muggle"
            return

        wizard_keys = ["gryffindor", "ravenclaw", "hufflepuff", "slytherin"]
        wizard_max = max(self.scores[k] for k in wizard_keys)
        max_score = max(wizard_max, self.scores["muggle"])

        if max_score == self.scores["gryffindor"]:
            self.assigned_house = "Gryffindor"
        elif max_score == self.scores["ravenclaw"]:
            self.assigned_house = "Ravenclaw"
        elif max_score == self.scores["hufflepuff"]:
            self.assigned_house = "Hufflepuff"
        elif max_score == self.scores["slytherin"]:
            self.assigned_house = "Slytherin"
        else:
            self.assigned_house = "Muggle"


QUESTIONS = [
    {
        "text": "Q1: Which trait do you value most?",
        "options": [
            ("Bravery", "gryffindor"),
            ("Wisdom", "ravenclaw"),
            ("Loyalty", "hufflepuff"),
            ("Ambition", "slytherin"),
            ("You are a freak — why am I wearing a hat that can talk and read my brain!", "muggle"),
        ],
    },
    {
        "text": "Q2: Where are you most likely to be found at Hogwarts?",
        "options": [
            ("Running into danger to help a friend", "gryffindor"),
            ("In the library reading", "ravenclaw"),
            ("Helping others with homework", "hufflepuff"),
            ("Plotting how to get power", "slytherin"),
            ("Just being a normal struggling student", "muggle"),
        ],
    },
    {
        "text": "Q3: What kind of friend are you?",
        "options": [
            ("Brave protector", "gryffindor"),
            ("Smart idea generator", "ravenclaw"),
            ("Loyal supporter", "hufflepuff"),
            ("Ambitious motivator", "slytherin"),
            ("Just a normal friend", "muggle"),
        ],
    },
    {
        "text": "Q4: How do you brush your teeth?",
        "options": [
            ("I'm too brave to skip brushing my teeth", "gryffindor"),
            ("While I'm reading", "ravenclaw"),
            ("While I'm making a sandwich", "hufflepuff"),
            ("I'm rich enough to own an electric toothbrush", "slytherin"),
            ("Just… in the bathroom like normal", "muggle"),
        ],
    },
    {
        "text": "Q5: What's your favorite subject?",
        "options": [
            ("DADA (Defence Against the Dark Arts) and Animagus", "gryffindor"),
            ("Astronomy and Charms", "ravenclaw"),
            ("Care of Magical Creatures and Herbology", "hufflepuff"),
            ("I want motivation… for the Dark Arts", "slytherin"),
            ("I don't know what that means, freaking hat!!!", "muggle"),
        ],
    },
    {
        "text": "Q6: What's your dream job in the Wizarding World?",
        "options": [
            ("Auror with an Order of Merlin", "gryffindor"),
            ("Astronomer and Professor at Hogwarts", "ravenclaw"),
            ("Magizoologist / Mediwizard", "hufflepuff"),
            ("Rich enough to never need a job", "slytherin"),
            ("I don't know what that means, freaking hat!!!", "muggle"),
        ],
    },
    {
        "text": "Q7: What do you do when you find a mysterious glowing door at Hogwarts?",
        "options": [
            ("Open it immediately — adventure waits!", "gryffindor"),
            ("Study the symbols and decode the magic behind it", "ravenclaw"),
            ("Find a professor — I don't want anyone to get hurt", "hufflepuff"),
            ("Try to claim whatever power is behind it before anyone else does", "slytherin"),
            ("WHAT IS THAT?? That's not normal!!", "muggle"),
        ],
    },
    {
        "text": "Q8: Where are you most likely to be found at Hogwarts?",
        "options": [
            ("Running into danger to help a friend", "gryffindor"),
            ("Reading in the library", "ravenclaw"),
            ("Helping classmates", "hufflepuff"),
            ("Plotting success", "slytherin"),
            ("WHAT IS THAT?? That's not normal!!", "muggle"),
        ],
    },
    {
        "text": "Q9: Someone drops a bag full of Galleons. What do you do?",
        "options": [
            ("Run after them to return it", "gryffindor"),
            ("Find clues to track down the owner", "ravenclaw"),
            ("Wait in place until they come back", "hufflepuff"),
            ("Pocket just a little bit!!!!", "slytherin"),
            ("Scream because money shouldn't fall from nowhere", "muggle"),
        ],
    },
]

Q10_ASIDE = (
    "[Albus]: I think I just doomed myself, Scorpius…\n"
    "[Scorpius]: Hey… it's okay. Even Muggles deserve magic in their lives.\n"
    "[Albus]: Really?\n"
    "[Scorpius]: You said my name once. That's all the magic I ever needed."
)

RESULT_LINES = {
    "Muggle": [
        "The Sorting Hat sighs…",
        "“MUGGLE!”",
        "{name}, you cannot attend Hogwarts. Please return to the train.",
        "",
        "[Albus]: Even if Hogwarts says no… your story isn't over.",
        "[Scorpius]: Magic or not, we're still with you.",
    ],
    "default": [
        "The Sorting Hat roars: {house}!",
        "{name}, welcome to {house}!",
        "",
        "[Albus]: See? The Hat knew.",
        "[Scorpius]: Whatever House you're in… you'll never be alone here.",
    ],
}

HOUSE_COLORS = {
    "Gryffindor": ("#5c0f14", "#f4c86a"),
    "Ravenclaw": ("#10214a", "#c9a86a"),
    "Hufflepuff": ("#6b5000", "#fdf2c4"),
    "Slytherin": ("#0b3d2a", "#cdeecb"),
    "Muggle": ("#2c3444", "#d7deee"),
}

MIN_QUESTIONS = 5
MAX_QUESTIONS = len(QUESTIONS)

player = House()
state = {"question_index": 0, "questions": QUESTIONS, "total_steps": len(QUESTIONS) + 1}
_proxies = []  # keep proxy refs alive so listeners aren't garbage-collected


def esc(s):
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def body_el():
    return document.getElementById("hatBody")


def progress_el():
    return document.getElementById("hatProgress")


def bind(el_id, handler):
    el = document.getElementById(el_id)
    proxy = create_proxy(handler)
    _proxies.append(proxy)
    el.addEventListener("click", proxy)


def set_progress(step):
    progress_el().innerHTML = f"Question {step} of {state['total_steps']}" if step else ""


def render_intro(*_):
    player.__init__()
    state["question_index"] = 0
    set_progress(0)
    body_el().innerHTML = """
      <p class="hat-line">Welcome to Hogwarts!</p>
      <p class="hat-line">You are in a Sorting House Ceremony (or you are a Muggle).</p>
      <p class="hat-line">You are wearing a sorting hat placed by Headmistress Professor McGonagall.</p>
      <p class="hat-question">Are you ready?</p>
      <div class="hat-options">
        <button class="hat-opt" id="optYes">Yes</button>
        <button class="hat-opt" id="optNo">No</button>
      </div>
    """
    bind("optYes", lambda e: render_name("The Great Hall falls silent. The Hat awakens…"))
    bind("optNo", lambda e: render_name("Too bad! The Hat is already on your head…"))


def render_name(flavor):
    body_el().innerHTML = f"""
      <p class="hat-line">{esc(flavor)}</p>
      <p class="hat-question">Enter your name:</p>
      <div class="hat-name-row">
        <input class="hat-input" id="nameInput" type="text" maxlength="40"
               placeholder="Your name" autocomplete="off" />
        <button class="hat-opt hat-opt-primary" id="nameGo">Continue</button>
      </div>
    """

    def go(_e):
        value = document.getElementById("nameInput").value.strip()
        player.name = value if value else "Traveler"
        count = random.randint(MIN_QUESTIONS, MAX_QUESTIONS)
        state["questions"] = random.sample(QUESTIONS, count)
        state["total_steps"] = count + 1
        state["question_index"] = 0
        render_question()

    bind("nameGo", go)
    document.getElementById("nameInput").focus()


def render_question(*_):
    idx = state["question_index"]
    q = state["questions"][idx]
    set_progress(idx + 1)

    opts_html = "".join(
        f'<button class="hat-opt" id="opt{i}">{esc(label)}</button>'
        for i, (label, _house) in enumerate(q["options"])
    )
    body_el().innerHTML = f"""
      <p class="hat-question">{esc(q["text"])}</p>
      <div class="hat-options">{opts_html}</div>
    """

    for i, (_label, house_key) in enumerate(q["options"]):
        bind(f"opt{i}", make_choice_handler(house_key))


def make_choice_handler(house_key):
    def handler(_e):
        if house_key == "muggle":
            player.set_force_muggle()
            player.add("muggle")
        else:
            player.add(house_key)
        advance()

    return handler


def advance():
    state["question_index"] += 1
    if state["question_index"] < len(state["questions"]):
        render_question()
    else:
        render_q10()


def render_q10(*_):
    set_progress(state["total_steps"])
    body_el().innerHTML = """
      <p class="hat-question">Q10: Which path calls to you?</p>
      <div class="hat-options">
        <button class="hat-opt" id="optA">Forest (wisdom + bravery)</button>
        <button class="hat-opt" id="optB">River (ambition + loyalty)</button>
        <button class="hat-opt" id="optC">What???</button>
      </div>
    """

    def choose_a(_e):
        player.add("gryffindor")
        player.add("ravenclaw")
        finish()

    def choose_b(_e):
        player.add("hufflepuff")
        player.add("slytherin")
        finish()

    def choose_c(_e):
        player.set_force_muggle()
        player.aside = Q10_ASIDE
        finish()

    bind("optA", choose_a)
    bind("optB", choose_b)
    bind("optC", choose_c)


def finish(*_):
    player.sort_into_house()
    house = player.assigned_house
    template = RESULT_LINES["Muggle"] if house == "Muggle" else RESULT_LINES["default"]
    lines = [line.format(name=player.name, house=house) for line in template]
    bg, fg = HOUSE_COLORS.get(house, HOUSE_COLORS["Muggle"])

    aside_html = ""
    if player.aside:
        aside_lines = "".join(f'<p class="hat-line">{esc(l)}</p>' for l in player.aside.split("\n"))
        aside_html = f'<div class="hat-aside">{aside_lines}</div>'

    lines_html = "".join(f'<p class="hat-line">{esc(l)}</p>' for l in lines if l)

    set_progress(0)
    body_el().innerHTML = f"""
      <div class="hat-result" style="--house-bg:{bg}; --house-fg:{fg}">
        <p class="hat-house">{esc(house)}</p>
        {aside_html}
        {lines_html}
        <button class="hat-opt hat-opt-primary" id="restart">Sort me again</button>
      </div>
    """

    def restart(_e):
        render_intro()

    bind("restart", restart)


window.pyStartHat = create_proxy(render_intro)
window.dispatchEvent(window.Event.new("hatpy:ready"))
