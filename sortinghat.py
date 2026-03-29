class House:
    name = ""
    assigned_house = "Unsorted"
    gryffindor = 0
    ravenclaw = 0
    hufflepuff = 0
    slytherin = 0
    muggle = 0
    force_muggle = False

    def add_gryffindor(self):
        self.gryffindor += 1

    def add_ravenclaw(self):
        self.ravenclaw += 1

    def add_hufflepuff(self):
        self.hufflepuff += 1

    def add_slytherin(self):
        self.slytherin += 1

    def add_muggle_and_squib(self):
        self.muggle += 1

    def set_force_muggle(self, value):
        self.force_muggle = value

    def sort_into_house(self):
        # UNIVERSAL OVERRIDE
        if self.force_muggle:
            self.assigned_house = "Muggle"
            return

        wizard_max = max(self.gryffindor, self.ravenclaw, self.hufflepuff, self.slytherin)
        max_score = max(wizard_max, self.muggle)

        # Priority logic
        if max_score == self.gryffindor:
            self.assigned_house = "Gryffindor"
        elif max_score == self.ravenclaw:
            self.assigned_house = "Ravenclaw"
        elif max_score == self.hufflepuff:
            self.assigned_house = "Hufflepuff"
        elif max_score == self.slytherin:
            self.assigned_house = "Slytherin"
        else:
            self.assigned_house = "Muggle"

    def announce_house(self):
        print("\n------------------------------------")

        if self.assigned_house == "Muggle":
            print("The Sorting Hat sighs…")
            print("“MUGGLE!”")
            print(f"{self.name}, you cannot attend Hogwarts. Please return to the train.")

            print()
            print("[Albus]: Even if Hogwarts says no… your story isn’t over.")
            print("[Scorpius]: Magic or not, we’re still with you.")

        else:
            print(f"The Sorting Hat roars: {self.assigned_house.upper()}!")
            print(f"{self.name}, welcome to {self.assigned_house}!")

            print()
            print("[Albus]: See? The Hat knew.")
            print("[Scorpius]: Whatever House you’re in… you’ll never be alone here.")

        print(
            "\nProjects James & Lilly Potter : Sunshine and Moonlights - Sorting Hats (Python Versions)")
        print("------------------------------------")
# ---------- INTRODUCTION ---------- #
print("Welcome to Hogwarts!")
print("You are in a Sorting House Ceremony (or you are a Muggle).")
print("You are wearing a sorting hat placed by Headmistress Professor McGonagall.")

while True:
    sorting = input("Are You Ready? (Yes/No): ").strip().lower()

    if sorting == "yes" or sorting == "y":
        print("\nThe Great Hall falls silent. The Hat awakens...\n")
        break
    elif sorting == "no" or sorting == "n":
        print("\nToo bad! The Hat is already on your head...\n")
        break
    else:
        print("Professor McGonagall taps your foot. 'Please answer Yes or No.'")

# ---------- Creat your Characters ----------
player = House() # Create the player
player.name = input("Enter your name: ")
# ---------- Q1 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ1: Which trait do you value most?")
    print("A) Bravery")
    print("B) Wisdom")
    print("C) Loyalty")
    print("D) Ambition")
    print("E) You are Freak why's I wear a hat that can talk and read my brain!")

    ans1 = input("Choice : ").strip().upper()

    if ans1 == "A":
        player.add_gryffindor(); break
    elif ans1 == "B":
        player.add_ravenclaw(); break
    elif ans1 == "C":
        player.add_hufflepuff(); break
    elif ans1 == "D":
        player.add_slytherin(); break
    elif ans1 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")
# ---------- Q2 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ2: Where are you most likely to be found at Hogwarts?")
    print("A) Running into danger to help a friend")
    print("B) In the library reading")
    print("C) Helping others with homework")
    print("D) Plotting how to get power")
    print("E) Just being a normal struggling student")

    ans2 = input("Choice : ").strip().upper()

    if ans2 == "A":
        player.add_gryffindor(); break
    elif ans2 == "B":
        player.add_ravenclaw(); break
    elif ans2 == "C":
        player.add_hufflepuff(); break
    elif ans2 == "D":
        player.add_slytherin(); break
    elif ans2 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q3 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ3: What kind of friend are you?")
    print("A) Brave protector")
    print("B) Smart idea generator")
    print("C) Loyal supporter")
    print("D) Ambitious motivator")
    print("E) Just a normal friend")

    ans3 = input("Choice : ").strip().upper()

    if ans3 == "A":
        player.add_gryffindor(); break
    elif ans3 == "B":
        player.add_ravenclaw(); break
    elif ans3 == "C":
        player.add_hufflepuff(); break
    elif ans3 == "D":
        player.add_slytherin(); break
    elif ans3 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q4 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ4: How do you brush your teeth?")
    print("A) I'm too brave to didn't brush my teeth)")
    print("B) While I'm reading")
    print("C) While I'm making a sandwich")
    print("D) I'm rich to buy electric toothbrush")
    print("E) Just… in the bathroom like normal")

    ans4 = input("Choice : ").strip().upper()

    if ans4 == "A":
        player.add_gryffindor(); break
    elif ans4 == "B":
        player.add_ravenclaw(); break
    elif ans4 == "C":
        player.add_hufflepuff(); break
    elif ans4 == "D":
        player.add_slytherin(); break
    elif ans4 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q5 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ5: What's your favorite subjects")
    print("A) DADA (Defence Against the Dark Arts) and Animagus")
    print("B) Astronomy and Chrarms")
    print("C) Care of Magical Creatures and Herbology")
    print("D) I'm wants motivations to Dark Arts")
    print("E) I don't know what that meaning a freaking Hats !!!!!")

    ans5 = input("Choice : ").strip().upper()

    if ans5 == "A":
        player.add_gryffindor(); break
    elif ans5 == "B":
        player.add_ravenclaw(); break
    elif ans5 == "C":
        player.add_hufflepuff(); break
    elif ans5 == "D":
        player.add_slytherin(); break
    elif ans5 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q6 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ6: What's your Dream Jobs in Wizarding World")
    print("A) I'm Aurror and I have Order of Merlin")
    print("B) I'm Astronomer and I'm Professor at Hogwarts")
    print("C) I'm Magizoology and I'm Mediwizard/Mediwitch")
    print("D) I'm Rich to have lifetime without taking a Jobs")
    print("E) I don't know what that meaning a freaking Hats !!!!!")

    ans6 = input("Choice : ").strip().upper()

    if ans6 == "A":
        player.add_gryffindor(); break
    elif ans6 == "B":
        player.add_ravenclaw(); break
    elif ans6 == "C":
        player.add_hufflepuff(); break
    elif ans6 == "D":
        player.add_slytherin(); break
    elif ans6 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q7 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ7: What do you do when you find a mysterious glowing door at Hogwarts ???")
    print("A) I'm Open immediately — adventure waits!")
    print("B) I'm Study the symbols and try to decode the magic behind it.")
    print("C) I'm must goes to find a professor I'm wants to nobody gets hurt")
    print(
        "D) I'm Try to claim whatever power is behind the door before anyone else does like People in HardYai Zone 8 in Telephone line")
    print("E) WHAT IS THAT?? That’s not normal!!")

    ans7 = input("Choice : ").strip().upper()

    if ans7 == "A":
        player.add_gryffindor(); break
    elif ans7 == "B":
        player.add_ravenclaw(); break
    elif ans7 == "C":
        player.add_hufflepuff(); break
    elif ans7 == "D":
        player.add_slytherin(); break
    elif ans7 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q8 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ8: Where are you most likely to be found at Hogwarts? ???")
    print("A) Running into danger to help a friend")
    print("B) Reading in the library")
    print("C) Helping classmates")
    print("D) Plotting success")
    print("E) WHAT IS THAT?? That’s not normal!!")

    ans8 = input("Choice : ").strip().upper()

    if ans8 == "A":
        player.add_gryffindor(); break
    elif ans8 == "B":
        player.add_ravenclaw(); break
    elif ans8 == "C":
        player.add_hufflepuff(); break
    elif ans8 == "D":
        player.add_slytherin(); break
    elif ans8 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q9 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ9: Someone drops a bag full of Galleons. What do you do?")
    print("A) I'm running after them to return it")
    print("B) I'm finding a clues to find the owner")
    print("C) I'm waiting in place until they come back")
    print("D) Pocket just a little bit !!!!")
    print("E) Scream because money shouldn’t fall from nowhere")

    ans9 = input("Choice : ").strip().upper()

    if ans9 == "A":
        player.add_gryffindor(); break
    elif ans9 == "B":
        player.add_ravenclaw(); break
    elif ans9 == "C":
        player.add_hufflepuff(); break
    elif ans9 == "D":
        player.add_slytherin(); break
    elif ans9 == "E":
        player.set_force_muggle(True)
        player.add_muggle_and_squib()
        break
    else:
        print("Invalid answer. Try again.")

# ---------- Q10 "if you choose E = Forge to Muggle" ----------
while True:
    print("\nQ10: Which path calls to you?")
    print("A) Forest (wisdom + bravery)")
    print("B) River (ambition + loyalty)")
    print("C) What???")

    ans10 = input("Choice : ").strip().upper()

    if ans10 == "A":
        player.add_gryffindor()
        player.add_ravenclaw()
        break
    elif ans10 == "B":
        player.add_hufflepuff()
        player.add_slytherin()
        break
    elif ans10 == "C":
        player.set_force_muggle(True)

        print()
        print("[Albus]: I think I just doomed myself, Scorpius…")
        print("[Scorpius]: Hey… it’s okay. Even Muggles deserve magic in their lives.")
        print("[Albus]: Really?")
        print("[Scorpius]: You said my name once. That’s all the magic I ever needed.")
        break
    else:
        print("Invalid answer. Try again.")

    # ---------- FINAL SORTING FROM YOUR QUESTIONS ----------
player.sort_into_house()
player.announce_house()