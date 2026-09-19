(function () {
    const API_BASE = 'http://localhost:5000/api';
    const JAVA_MEETING_URL = 'https://meet.google.com/uyv-hfdu-fnk';

    function currentUser() {
        try {
            return JSON.parse(localStorage.getItem('skillswapUser'));
        } catch (error) {
            return null;
        }
    }

    function showAuthMessage(message, isError = false) {
        const authMessage = document.getElementById('authMessage');
        if (!authMessage) return;

        authMessage.textContent = message;
        authMessage.className = `auth-message ${isError ? 'error' : 'success'}`;
    }

    function setupAuth() {
        const authForm = document.getElementById('authForm');

        if (!authForm) {
            if (!currentUser()) window.location.href = 'auth.html';
            return;
        }

        if (currentUser()) {
            window.location.href = 'index.html';
            return;
        }

        let signupMode = false;
        const nameField = document.getElementById('nameField');
        const nameInput = document.getElementById('nameInput');
        const authTitle = document.getElementById('authTitle');
        const submitButton = document.getElementById('authSubmitBtn');
        const toggleText = document.getElementById('toggleText');
        const toggleLink = document.getElementById('toggleAuthMode');

        toggleLink.addEventListener('click', function (event) {
            event.preventDefault();
            signupMode = !signupMode;
            nameField.style.display = signupMode ? 'block' : 'none';
            nameInput.required = signupMode;
            authTitle.textContent = signupMode ? 'Create account' : 'Login';
            submitButton.textContent = signupMode ? 'Create account' : 'Login';
            toggleText.textContent = signupMode ? 'Already a member?' : 'New here?';
            toggleLink.textContent = signupMode ? 'Login' : 'Create account';
            showAuthMessage('');
        });

        authForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            submitButton.disabled = true;
            showAuthMessage('Checking your details...');

            const payload = {
                email: document.getElementById('emailInput').value,
                password: document.getElementById('passwordInput').value
            };

            if (signupMode) payload.name = nameInput.value;

            try {
                const response = await fetch(`${API_BASE}/auth/${signupMode ? 'signup' : 'login'}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'Unable to authenticate.');

                localStorage.setItem('skillswapUser', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } catch (error) {
                const message = error instanceof TypeError
                    ? 'Cannot connect to SkillSwap. Start the backend, then open http://localhost:5000/auth.html.'
                    : error.message;
                showAuthMessage(message, true);
                submitButton.disabled = false;
            }
        });
    }

    function logout() {
        localStorage.removeItem('skillswapUser');
        window.location.href = 'auth.html';
    }

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

    function startJavaMeeting(sessionId = 1) {
        fetch(`${API_BASE}/sessions/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        }).catch(() => null);

        window.location.href = JAVA_MEETING_URL;
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
                        <button onclick="${session.title === 'Java Foundations' ? 'startJavaMeeting(' + session.id + ')' : session.status === 'scheduled' ? 'joinSession(' + session.id + ')' : 'acceptSession(' + session.id + ')'}">
                            ${session.title === 'Java Foundations' ? 'Start Java meeting' : session.status === 'scheduled' ? 'Join Session' : 'Accept'}
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
        setupAuth();
        const logoutButton = document.getElementById('logoutBtn');
        if (logoutButton) logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            logout();
        });
        populateProfile();
        populateDashboard();
        loadSkills();
        loadSessions();
    });

    window.requestSkill = requestSkill;
    window.joinSession = joinSession;
    window.startJavaMeeting = startJavaMeeting;
    window.acceptSession = acceptSession;
    window.viewSession = viewSession;
    window.searchSkills = searchSkills;
})();