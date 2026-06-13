import sys

styles_projects = """
/* --- Projects Hub Styles --- */
.projects-hub-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 20px;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
}

.projects-hub-title {
    font-size: 3rem;
    color: #fff;
    text-shadow: 0 5px 15px rgba(0,0,0,0.5);
    margin-bottom: 10px;
    text-align: center;
}

.projects-hub-subtitle {
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 50px;
    text-align: center;
}

.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    width: 100%;
}

.project-card {
    background: rgba(47, 47, 63, 0.6); /* Aligned to DESIGN.md */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px; /* Aligned to DESIGN.md */
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Aligned to DESIGN.md */
    transition: all 0.3s ease;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.project-card:hover {
    transform: translateY(-5px);
    background: rgba(60, 60, 80, 0.8);
    border-color: rgba(255,255,255,0.3);
    box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(59, 130, 246, 0.3);
}

.project-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5));
}

.project-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 15px;
}

.project-desc {
    color: #cbd5e1;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 25px;
}

.btn-launch {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    padding: 10px 30px;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s;
}

.project-card:hover .btn-launch {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

/* --- Sorting Hat Styles --- */
.sorting-ceremony-container {
    font-family: 'Kanit', sans-serif;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;
}

.sorting-ceremony-container h1 { 
    margin-bottom: 10px; 
    color: #93c5fd; 
    text-shadow: 2px 2px 4px #000; 
    text-align: center;
    word-wrap: break-word;
    white-space: normal;
    max-width: 100%;
}

.sorting-ceremony-container p {
    color: #cbd5e1;
    margin-bottom: 20px;
    text-align: center;
    max-width: 100%;
    word-wrap: break-word;
}

.terminal-wrapper {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 15px; /* Aligned to DESIGN.md */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Aligned to DESIGN.md */
    border: 1px solid rgba(255, 255, 255, 0.1); /* Aligned to DESIGN.md */
    background-color: rgba(5, 11, 20, 0.8);
    backdrop-filter: blur(10px);
    margin: 0 auto;
}

/* Ravenclaw Terminal Styling */
py-terminal { 
    width: 100%; 
    min-width: 300px;
    max-width: 100%; 
    height: 500px; 
    background-color: transparent;
    margin: 0;
    box-sizing: border-box;
    display: block;
}

@media (max-width: 768px) {
    .sorting-ceremony-container {
        padding: 10px 0px;
    }
    .sorting-ceremony-container h1 {
        font-size: 1.4rem;
    }
    py-terminal {
        height: 400px;
        font-size: 0.8rem;
    }
}
"""

with open("styles.css", "a") as f:
    f.write(styles_projects)

print("CSS appended successfully.")
