css_content = """

/* --- Paotang Co-Pay Calculator Styles --- */
.paotang-container {
    display: flex;
    flex-direction: row;
    gap: 30px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    align-items: flex-start;
}

.paotang-dashboard {
    flex: 1.5;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.paotang-timeline-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 800px;
}

.paotang-card {
    background: rgba(30, 30, 50, 0.6);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.digital-wallet-card {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(147, 197, 253, 0.1) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(96, 165, 250, 0.1);
}

.wallet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: 600;
}

.highlight-green {
    color: #34d399;
}

.badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
}

.badge-red {
    background: rgba(225, 29, 72, 0.2);
    color: #fda4af;
    border: 1px solid rgba(225, 29, 72, 0.4);
}

.badge-blue {
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.4);
}

.wallet-balance {
    text-align: center;
    margin-bottom: 25px;
}

.wallet-balance p {
    color: #94a3b8;
    font-size: 1rem;
    margin-bottom: 5px;
}

.wallet-balance h2 {
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 10px rgba(255,255,255,0.2);
    margin: 0;
}

.wallet-progress-container {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin-bottom: 15px;
    overflow: hidden;
}

.wallet-progress-bar {
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease-out, background 0.5s ease;
}

.wallet-subtext {
    color: #cbd5e1;
    font-size: 0.9rem;
}

.input-section {
    margin-bottom: 25px;
}

.input-section label {
    display: block;
    margin-bottom: 8px;
    color: #94a3b8;
    font-size: 0.95rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
    color: #fff;
    font-family: 'Kanit', sans-serif;
    outline: none;
    transition: all 0.3s ease;
}

.input-wrapper input:focus {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
}

.input-wrapper input[type="number"] {
    font-size: 1.5rem;
    padding-right: 50px;
}

.currency-label {
    position: absolute;
    right: 15px;
    color: #94a3b8;
    font-size: 1.1rem;
    pointer-events: none;
}

.btn-quick-add {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
}

.btn-quick-add:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}

.split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
}

.split-box {
    background: rgba(15, 23, 42, 0.4);
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.split-label {
    font-size: 0.9rem;
    margin-bottom: 5px;
}

.split-amount {
    font-size: 1.5rem;
    font-weight: 600;
}

.split-gov .split-label { color: #93c5fd; }
.split-gov .split-amount { color: #60a5fa; }
.split-user .split-label { color: #6ee7b7; }
.split-user .split-amount { color: #34d399; }

.final-box {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
    border: 1px solid rgba(52, 211, 153, 0.3);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.05);
}

.final-label {
    color: #a7f3d0;
    font-size: 1rem;
    margin-bottom: 5px;
}

.final-amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.paotang-btn {
    border: none;
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.btn-primary.paotang-btn {
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.btn-primary.paotang-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.6);
    background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
}

.btn-secondary.paotang-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary.paotang-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.timeline-wrapper {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.timeline-wrapper::-webkit-scrollbar {
    width: 6px;
}

.timeline-wrapper::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.timeline-wrapper::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}

.timeline-item {
    display: flex;
    gap: 15px;
    position: relative;
}

.timeline-item::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 25px;
    bottom: -20px;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
}

.timeline-item:last-child::before {
    display: none;
}

.timeline-dot {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    margin-top: 5px;
    border: 4px solid rgba(30, 30, 50, 1);
    z-index: 1;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.timeline-content {
    flex: 1;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 15px;
    transition: transform 0.2s ease, background 0.2s ease;
}

.timeline-content:hover {
    transform: translateX(5px);
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.timeline-name {
    font-weight: 600;
    color: #f1f5f9;
    font-size: 1.1rem;
}

.timeline-date {
    font-size: 0.8rem;
    color: #64748b;
}

.timeline-details .t-amount {
    display: flex;
    flex-direction: column;
}

.timeline-details .t-amount .label {
    font-size: 0.75rem;
    margin-bottom: 2px;
}

.timeline-details .t-amount .val {
    font-weight: 600;
}

/* Mobile Responsive */
@media (max-width: 900px) {
    .paotang-container {
        flex-direction: column;
        padding: 0 15px;
    }
    
    .paotang-dashboard, .paotang-timeline-container {
        width: 100%;
        max-height: none;
    }
    
    .timeline-wrapper {
        max-height: 400px;
    }
}
"""
with open('styles.css', 'a') as f:
    f.write(css_content)
