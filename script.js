(function () {
    const API_BASE = 'http://localhost:5000/api';

    function requestSkill(skill) {
        fetch(`${API_BASE}/skills/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skill })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || `Skill request sent for ${skill}`);
            })
            .catch(() => {
                alert(`Skill request sent for ${skill}`);
            });
    }

    function joinSession(sessionId = 1) {
        fetch(`${API_BASE}/sessions/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Joining Java session...');
                loadSessions();
            })
            .catch(() => {
                alert('Joining Java session...');
            });
    }

    function acceptSession(sessionId = 2) {
        fetch(`${API_BASE}/sessions/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Session accepted!');
                loadSessions();
            })
            .catch(() => {
                alert('Session accepted!');
            });
    }

    function viewSession() {
        window.location.href = 'sessions.html';
    }

    function searchSkills() {
        const input = document.getElementById('searchInput');

        if (!input) {
            return;
        }

        const filter = input.value.toLowerCase();
        const cards = document.querySelectorAll('.skill-card');

        cards.forEach(function (card) {
            const heading = card.querySelector('h3');
            const skillName = heading ? heading.textContent.toLowerCase() : '';

            card.style.display = skillName.includes(filter) ? 'block' : 'none';
        });
    }

    function populateProfile() {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileTokenBalance = document.getElementById('profileTokenBalance');
        const profileSkills = document.getElementById('profileSkills');

        if (!profileName && !profileEmail && !profileTokenBalance && !profileSkills) {
            return;
        }

        fetch(`${API_BASE}/profile`)
            .then(response => response.json())
            .then(data => {
                if (profileName) profileName.textContent = data.name;
                if (profileEmail) profileEmail.textContent = data.email;
                if (profileTokenBalance) profileTokenBalance.textContent = `${data.tokenBalance} Tokens`;

                if (profileSkills) {
                    profileSkills.innerHTML = (data.skills || []).map(skill => `<span>${skill}</span>`).join('');
                }
            })
            .catch(() => {
                if (profileName) profileName.textContent = 'Manohar.U';
                if (profileEmail) profileEmail.textContent = 'manoharmanumesh@gmail.com';
                if (profileTokenBalance) profileTokenBalance.textContent = '120 Tokens';
            });
    }

    function populateDashboard() {
        const tokenBalance = document.getElementById('tokenBalance');
        const dashboardSkillsList = document.getElementById('dashboardSkillsList');
        const upcomingSessions = document.getElementById('upcomingSessions');

        if (!tokenBalance && !dashboardSkillsList && !upcomingSessions) {
            return;
        }

        fetch(`${API_BASE}/profile`)
            .then(response => response.json())
            .then(data => {
                if (tokenBalance) tokenBalance.textContent = `${data.tokenBalance} Tokens`;

                if (dashboardSkillsList) {
                    dashboardSkillsList.innerHTML = (data.skills || []).map(skill => `<span>${skill}</span>`).join('');
                }
            })
            .catch(() => {
                if (tokenBalance) tokenBalance.textContent = '120 Tokens';
            });

        fetch(`${API_BASE}/sessions`)
            .then(response => response.json())
            .then(data => {
                if (!upcomingSessions) return;

                upcomingSessions.innerHTML = data.map(session => `
                    <div class="session-card">
                        <h3>${session.title} Session</h3>
                        <p>With: ${session.with}</p>
                        <p>${session.time}</p>
                        <button onclick="viewSession()">View Session</button>
                    </div>
                `).join('');
            })
            .catch(() => {
                if (upcomingSessions) {
                    upcomingSessions.innerHTML = `
                        <div class="session-card">
                            <h3>Java Session</h3>
                            <p>With: Rahul</p>
                            <p>Tomorrow, 5:00 PM</p>
                            <button onclick="viewSession()">View Session</button>
                        </div>
                    `;
                }
            });
    }

    function loadSkills() {
        const skillContainer = document.getElementById('skillContainer');
        if (!skillContainer) return;

        fetch(`${API_BASE}/skills`)
            .then(response => response.json())
            .then(data => {
                skillContainer.innerHTML = data.map(skill => `
                    <div class="skill-card">
                        <h3>${skill.name}</h3>
                        <p>${skill.category}</p>
                        <button onclick="requestSkill('${skill.name}')">Learn</button>
                    </div>
                `).join('');
            })
            .catch(() => {
                skillContainer.innerHTML = `
                    <div class="skill-card">
                        <h3>Java</h3>
                        <p>Programming</p>
                        <button onclick="requestSkill('Java')">Learn</button>
                    </div>
                `;
            });
    }

    function loadSessions() {
        const sessionsList = document.getElementById('sessionsList');
        if (!sessionsList) return;

        fetch(`${API_BASE}/sessions`)
            .then(response => response.json())
            .then(data => {
                sessionsList.innerHTML = data.map(session => `
                    <div class="session-card">
                        <h2>${session.title}</h2>
                        <p><strong>With:</strong> ${session.with}</p>
                        <p><strong>Time:</strong> ${session.time}</p>
                        <p>
                            <strong>Status:</strong>
                            <span class="status ${session.status === 'scheduled' ? 'scheduled' : 'pending'}">
                                ${session.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                            </span>
                        </p>
                        <button onclick="${session.status === 'scheduled' ? 'joinSession(' + session.id + ')' : 'acceptSession(' + session.id + ')'}">
                            ${session.status === 'scheduled' ? 'Join Session' : 'Accept'}
                        </button>
                    </div>
                `).join('');
            })
            .catch(() => {
                sessionsList.innerHTML = `
                    <div class="session-card">
                        <h2>Java</h2>
                        <p><strong>With:</strong> Rahul</p>
                        <p><strong>Time:</strong> Tomorrow, 5:00 PM</p>
                        <p><strong>Status:</strong> <span class="status scheduled">Scheduled</span></p>
                        <button onclick="joinSession()">Join Session</button>
                    </div>
                `;
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        populateProfile();
        populateDashboard();
        loadSkills();
        loadSessions();
    });

    window.requestSkill = requestSkill;
    window.joinSession = joinSession;
    window.acceptSession = acceptSession;
    window.viewSession = viewSession;
    window.searchSkills = searchSkills;
})();