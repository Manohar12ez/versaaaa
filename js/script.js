(function () {
    const API_BASE = '/api';

    async function parseJsonResponse(response) {
        const text = await response.text();

        if (!text) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error(text || 'Unexpected server response');
        }
    }

    function requestSkill(skill) {
        fetch(`${API_BASE}/skills/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ skill })
        })
            .then(async response => {
                const data = await parseJsonResponse(response);
                if (!response.ok) {
                    throw new Error(data.message || 'Request failed');
                }
                alert(data.message || `Skill request sent for ${skill}`);
            })
            .catch(() => {
                alert(`Skill request sent for ${skill}`);
            });
    }

    function joinSession(sessionId = 1, meetLink = '') {
        if (!meetLink) {
            showToast('The host has not added a Google Meet link yet.', true);
            return;
        }

        fetch(`${API_BASE}/sessions/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        })
            .then(async response => {
                const data = await parseJsonResponse(response);
                if (!response.ok) throw new Error(data.message || 'Unable to join this room');
                return data;
            })
            .then(data => {
                showToast(data.message || 'You joined the room');
                window.setTimeout(() => {
                    window.location.href = meetLink;
                }, 500);
            })
            .catch(error => {
                showToast(error.message || 'Unable to join this room', true);
            });
    }

    function showToast(message, isError = false) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = isError ? 'toast visible toast-error' : 'toast visible';
        window.clearTimeout(window.skillSwapToastTimer);
        window.skillSwapToastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
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
                showToast(data.message || 'Session accepted!');
                loadSessions();
            })
            .catch(() => {
                showToast('Session accepted!', true);
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

                upcomingSessions.innerHTML = data.slice(0, 3).map(sessionCard).join('');
            })
            .catch(() => {
                if (upcomingSessions) {
                    upcomingSessions.innerHTML = '<p class="empty-state">Sessions are taking a quick break. Refresh to try again.</p>';
                }
            });
    }

    function sessionCard(session) {
        const participants = Number(session.participants || 0);
        const capacity = Number(session.capacity || 20);
        const progress = Math.min(100, Math.round((participants / capacity) * 100));
        const statusLabel = session.status === 'pending' ? 'Needs people' : 'Starting soon';
        const meetLink = session.meetLink || '';
        const joinLabel = meetLink ? 'Join Google Meet' : 'Meet link coming soon';
        return `
            <article class="session-card">
                <div class="session-card-top"><span class="category-label">${session.category || 'Community'}</span><span class="session-status ${session.status}">${statusLabel}</span></div>
                <h3>${session.title}</h3>
                <p class="session-description">${session.description || 'A community-led room for sharing practical knowledge.'}</p>
                <div class="host-row"><span class="host-avatar">${session.hostInitials || 'SS'}</span><span>Hosted by <strong>${session.with}</strong></span></div>
                <div class="session-meta"><span>${session.time}</span><span>${participants}/${capacity} joined</span></div>
                <div class="capacity-bar"><span style="width: ${progress}%"></span></div>
                <button class="button button-dark join-button" ${meetLink ? `onclick="joinSession(${session.id}, '${meetLink}')"` : 'disabled'}>${joinLabel} <span aria-hidden="true">-&gt;</span></button>
            </article>`;
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
                window.skillSwapSessions = data;
                renderSessionList(data);
            })
            .catch(() => {
                sessionsList.innerHTML = '<p class="empty-state">Could not load rooms. Check that the backend is running.</p>';
            });
    }

    function renderSessionList(sessions) {
        const sessionsList = document.getElementById('sessionsList');
        const sessionCount = document.getElementById('sessionCount');
        if (!sessionsList) return;
        sessionsList.innerHTML = sessions.length ? sessions.map(sessionCard).join('') : '<p class="empty-state">No rooms match this filter yet.</p>';
        if (sessionCount) sessionCount.textContent = `${sessions.length} open room${sessions.length === 1 ? '' : 's'}`;
    }

    function initSessionFilters() {
        const filters = document.querySelectorAll('.filter-pill');
        if (!filters.length) return;
        filters.forEach(filter => filter.addEventListener('click', () => {
            filters.forEach(item => item.classList.remove('active'));
            filter.classList.add('active');
            const selected = filter.dataset.filter;
            const sessions = window.skillSwapSessions || [];
            renderSessionList(selected === 'all' ? sessions : sessions.filter(session => session.status === selected));
        }));
    }

    function initAuthForm() {
        const authForm = document.getElementById('authForm');
        const authTitle = document.getElementById('authTitle');
        const toggleAuthMode = document.getElementById('toggleAuthMode');
        const toggleText = document.getElementById('toggleText');
        const authMessage = document.getElementById('authMessage');
        const nameField = document.getElementById('nameField');
        const authSubmitBtn = document.getElementById('authSubmitBtn');

        if (!authForm) return;

        let isSignupMode = false;

        const setMode = (signup) => {
            isSignupMode = signup;
            nameField.style.display = signup ? 'block' : 'none';
            authTitle.textContent = signup ? 'Create Account' : 'Login';
            authSubmitBtn.textContent = signup ? 'Create Account' : 'Login';
            toggleText.textContent = signup ? 'Already have an account?' : 'New here?';
            toggleAuthMode.textContent = signup ? 'Login' : 'Create account';
            authMessage.textContent = '';
        };

        toggleAuthMode.addEventListener('click', function (event) {
            event.preventDefault();
            setMode(!isSignupMode);
        });

        authForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('nameInput')?.value?.trim() || '';
            const email = document.getElementById('emailInput').value.trim();
            const password = document.getElementById('passwordInput').value;

            const endpoint = isSignupMode ? '/auth/signup' : '/auth/login';
            const payload = isSignupMode ? { name, email, password } : { email, password };

            fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(async response => {
                    const data = await parseJsonResponse(response);

                    if (!response.ok) {
                        throw new Error(data.message || 'Authentication failed');
                    }

                    authMessage.textContent = data.message;
                    authMessage.style.color = '#166534';

                    localStorage.setItem('skillSwapUser', JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 500);
                })
                .catch(error => {
                    const message = error && error.message ? error.message : 'Something went wrong. Check if the backend is running.';
                    authMessage.textContent = message;
                    authMessage.style.color = '#b91c1c';
                });
        });

        setMode(false);
    }

    function bindLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('skillSwapUser');
            window.location.href = 'auth.html';
        });
    }

    function setWelcomeName() {
        const welcomeHeading = document.querySelector('h1');
        const savedUser = JSON.parse(localStorage.getItem('skillSwapUser') || 'null');

        if (welcomeHeading && savedUser && savedUser.name) {
            welcomeHeading.textContent = `Welcome ${savedUser.name}`;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const isAuthPage = path === 'auth.html';
        const savedUser = localStorage.getItem('skillSwapUser');

        if (!isAuthPage && !savedUser) {
            window.location.href = 'auth.html';
            return;
        }

        setWelcomeName();
        populateProfile();
        populateDashboard();
        loadSkills();
        loadSessions();
        initSessionFilters();
        initAuthForm();
        bindLogout();
    });

    window.requestSkill = requestSkill;
    window.joinSession = joinSession;
    window.acceptSession = acceptSession;
    window.viewSession = viewSession;
    window.searchSkills = searchSkills;
})();