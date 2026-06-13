with open("styles.css") as f:
    text = f.read()

opened = 0
for i, char in enumerate(text):
    if char == '{': opened += 1
    elif char == '}':
        opened -= 1
        if opened < 0:
            print(f"Extra closing brace at position {i}")
            opened = 0
            
print(f"Final opened count: {opened}")
