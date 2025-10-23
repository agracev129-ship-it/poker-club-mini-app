// ============================================
// POKER CLUB MINI APP - FINAL DESIGN
// ============================================

const tg = window.Telegram?.WebApp || {};
const API_BASE = 'https://poker-club-server-1.onrender.com/api';

// Данные приложения
const appData = {
    currentUser: null,
    isAdmin: false,
    registeredGames: new Set(),
    games: [
        {
            id: 1,
            name: 'TEXAS HOLDEM CLASSIC',
            players: '45 / 60',
            time: '18:00',
            date: '24.10',
            description: 'Классический покер Texas Hold\'em с бай-ином 5000₽. Стартовый стек 10,000 фишек. Уровни по 20 минут.'
        },
        {
            id: 2,
            name: 'OMAHA CHAMPIONSHIP',
            players: '32 / 50',
            time: '20:00',
            date: '24.10',
            description: 'Pot-Limit Omaha чемпионат. Бай-ин 7500₽. Глубокие стеки и длинные уровни по 30 минут.'
        },
        {
            id: 3,
            name: 'DEEP STACK TURBO',
            players: '67 / 80',
            time: '19:30',
            date: '25.10',
            description: 'Турбо-турнир с глубокими стеками. Бай-ин 3000₽. Стартовый стек 15,000 фишек. Уровни по 15 минут.'
        },
        {
            id: 4,
            name: 'BOUNTY TOURNAMENT',
            players: '28 / 40',
            time: '21:00',
            date: '25.10',
            description: 'Баунти-турнир с прогрессивными наградами. Бай-ин 6000₽. Получайте 1000₽ за каждого выбитого игрока.'
        }
    ],
    tournaments: [],
    topPlayers: [
        { id: 1, name: 'Devans', points: 2850, games: 45, wins: 28, rank: 1, trend: 'up' },
        { id: 2, name: 'PokerPro', points: 2720, games: 42, wins: 25, rank: 2, trend: 'up' },
        { id: 3, name: 'AllInKing', points: 2650, games: 38, wins: 22, rank: 3, trend: 'down' },
        { id: 4, name: 'ChipLeader', points: 2580, games: 40, wins: 21, rank: 4, trend: 'same' },
        { id: 5, name: 'BluffMaster', points: 2510, games: 35, wins: 19, rank: 5, trend: 'up' },
        { id: 6, name: 'RiverRat', points: 2445, games: 36, wins: 18, rank: 6, trend: 'up' },
        { id: 7, name: 'FlopKing', points: 2380, games: 33, wins: 17, rank: 7, trend: 'down' },
        { id: 8, name: 'TurnAce', points: 2320, games: 34, wins: 16, rank: 8, trend: 'same' }
    ]
};

// ============================================
// API МЕТОДЫ
// ============================================

const API = {
    async getUsers() {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        return await response.json();
    },

    async getUserByTelegramId(telegramId) {
        const response = await fetch(`${API_BASE}/users/telegram/${telegramId}`);
        if (!response.ok) return null;
        return await response.json();
    },

    async createUser(userData) {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Ошибка создания пользователя');
        return await response.json();
    },

    async getBigTournaments() {
        const response = await fetch(`${API_BASE}/big-tournaments`);
        if (!response.ok) throw new Error('Ошибка загрузки турниров');
        return await response.json();
    },

    async createBigTournament(tournamentData) {
        const response = await fetch(`${API_BASE}/big-tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания турнира');
        }
        return await response.json();
    },

    async getGames(tournamentId = null) {
        const url = tournamentId 
            ? `${API_BASE}/games?tournamentId=${tournamentId}`
            : `${API_BASE}/games`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки игр');
        return await response.json();
    },

    async createGame(gameData) {
        const response = await fetch(`${API_BASE}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        if (!response.ok) throw new Error('Ошибка создания игры');
        return await response.json();
    },

    async getStats() {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error('Ошибка загрузки статистики');
        return await response.json();
    },

    async getTournamentStandings(tournamentId) {
        const response = await fetch(`${API_BASE}/tournament-standings/${tournamentId}`);
        if (!response.ok) throw new Error('Ошибка загрузки standings');
        return await response.json();
    }
};

// ============================================
// НАВИГАЦИЯ
// ============================================

function switchTab(tabName) {
    // Убираем active у всех вкладок
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Добавляем active для выбранной
    const tab = document.getElementById(tabName);
    const btn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
    
    if (tab) tab.classList.add('active');
    if (btn) btn.classList.add('active');

    // Загружаем данные для вкладки
    loadTabData(tabName);
    
    // Haptic feedback
    vibrate();
}

async function loadTabData(tabName) {
    try {
        switch(tabName) {
            case 'home':
                await loadHomeData();
                break;
            case 'games':
                await loadGamesTab();
                break;
            case 'tournaments':
                await loadTournamentsTab();
                break;
            case 'rating':
                await loadRatingTab();
                break;
            case 'profile':
                await loadProfileTab();
                break;
            case 'admin':
                if (appData.isAdmin) {
                    await loadAdminPanel();
                }
                break;
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showAlert(`Ошибка: ${error.message}`);
    }
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================

async function loadHomeData() {
    updateTimer();
    
    if (appData.currentUser) {
        document.getElementById('headerName').textContent = appData.currentUser.game_nickname || 'Игрок';
        if (appData.currentUser.avatar_url) {
            document.getElementById('headerAvatar').src = appData.currentUser.avatar_url;
        }
    }
}

function updateTimer() {
    const calculateTimeLeft = () => {
        const now = new Date();
        const nextGame = new Date();
        nextGame.setHours(19, 0, 0, 0);
        
        if (now.getHours() >= 19) {
            nextGame.setDate(nextGame.getDate() + 1);
        }
        
        const diff = nextGame.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('timeLeft').textContent = `${hours}ч ${minutes}м`;
    };

    calculateTimeLeft();
    setInterval(calculateTimeLeft, 60000);
}

// ============================================
// ИГРЫ
// ============================================

async function loadGamesTab() {
    const container = document.getElementById('gamesList');
    if (!container) return;

    container.innerHTML = appData.games.map(game => `
        <div class="game-card">
            <div class="game-header">
                <div>
                    <div class="game-title">${game.name}</div>
                    <div class="game-meta">
                        <div class="game-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            </svg>
                            <span>${game.players}</span>
                        </div>
                        <div class="game-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>${game.time}</span>
                        </div>
                        <div class="game-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/>
                                <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                            </svg>
                            <span>${game.date}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button class="game-join-btn" onclick="showGameDetails(${game.id})">
                Присоединиться
            </button>
        </div>
    `).join('');
}

// ============================================
// ТУРНИРЫ
// ============================================

async function loadTournamentsTab() {
    const container = document.getElementById('tournamentsList');
    if (!container) return;

    try {
        appData.tournaments = await API.getBigTournaments();
    } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
    }

    if (appData.tournaments.length === 0) {
        container.innerHTML = '<div class="list-card">Турниры не найдены</div>';
        return;
    }

    // Активный турнир
    const activeTournament = appData.tournaments[0];
    
    container.innerHTML = `
        <div style="padding: 0 1rem 1.5rem;">
            <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #d1d5db;">Активные турниры</h3>
            <div class="tournament-active-card">
                <div style="position: relative; z-index: 10;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-style: italic;">
                                ${activeTournament.name}
                            </h3>
                            <div class="tournament-status-badge">
                                <div class="tournament-status-dot"></div>
                                <span>Идет регистрация</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Призовой фонд</div>
                            <div style="display: flex; align-items: center; gap: 0.25rem;">
                                <span>50,000₽</span>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Участники</div>
                            <div>89 / 100</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Начало</div>
                            <div>19:00</div>
                        </div>
                    </div>
                    <button class="btn-primary">Зарегистрироваться</button>
                </div>
            </div>
        </div>
        
        <div style="padding: 0 1rem;">
            <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #d1d5db;">Предстоящие турниры</h3>
            ${appData.tournaments.slice(1).map(tournament => `
                <div class="list-card" style="border: 1px solid #374151;">
                    <h3 style="font-size: 1.125rem; margin-bottom: 0.75rem; font-style: italic;">
                        ${tournament.name}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; font-size: 0.875rem; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">Призовой</div>
                            <div style="color: #fbbf24;">25,000₽</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">Игроки</div>
                            <div>45 / 80</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">Дата</div>
                            <div>${new Date(tournament.start_date).toLocaleDateString('ru-RU')}</div>
                        </div>
                    </div>
                    <button style="width: 100%; background: rgba(255,255,255,0.1); border: none; border-radius: 0.75rem; padding: 0.625rem; color: white; cursor: pointer;">
                        Подробнее
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// РЕЙТИНГ
// ============================================

async function loadRatingTab() {
    const container = document.getElementById('ratingContent');
    if (!container) return;

    container.innerHTML = `
        <!-- Ваша позиция -->
        <div style="padding: 0 1rem 1rem;">
            <div class="rating-position-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Ваша позиция</div>
                        <div style="font-size: 1.5rem;">#15</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Рейтинг</div>
                        <div style="font-size: 1.25rem; color: #fbbf24;">2180</div>
                    </div>
                    <div style="width: 48px; height: 48px; background: rgba(185,28,28,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                    </div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.75rem;">
                    До топ-10: <span style="color: white;">165 очков</span>
                </div>
            </div>
        </div>

        <!-- Топ-3 -->
        <div style="padding: 0 1rem 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Топ-3</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <!-- 2 место -->
                <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #9ca3af, #6b7280); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        2
                    </div>
                    <div class="list-card" style="width: 100%; text-align: center; padding: 0.625rem; border: 1px solid #374151;">
                        <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${appData.topPlayers[1].name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">${appData.topPlayers[1].points}</div>
                    </div>
                </div>

                <!-- 1 место -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #f59e0b); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                    </div>
                    <div style="width: 100%; text-align: center; padding: 0.625rem; border-radius: 0.75rem; background: linear-gradient(135deg, var(--accent-red), var(--accent-red-dark));">
                        <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${appData.topPlayers[0].name}</div>
                        <div style="font-size: 0.75rem;">${appData.topPlayers[0].points}</div>
                    </div>
                </div>

                <!-- 3 место -->
                <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #fb923c, #ea580c); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-size: 0.875rem;">
                        3
                    </div>
                    <div class="list-card" style="width: 100%; text-align: center; padding: 0.625rem; border: 1px solid #374151;">
                        <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${appData.topPlayers[2].name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">${appData.topPlayers[2].points}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Полный рейтинг -->
        <div style="padding: 0 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Общий рейтинг</div>
            ${appData.topPlayers.map((player, index) => {
                const bgClass = index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                index === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' :
                                index === 2 ? 'linear-gradient(135deg, #fb923c, #ea580c)' : '#374151';
                return `
                    <div class="list-card" style="display: flex; align-items: center; gap: 0.75rem; border: 1px solid #374151;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgClass}; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; flex-shrink: 0;">
                            ${player.rank}
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.125rem;">
                                <span style="font-size: 0.875rem;">${player.name}</span>
                                ${player.trend === 'up' ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>' : ''}
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280;">
                                ${player.games} игр • ${player.wins} побед
                            </div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0;">
                            <div style="font-size: 0.875rem; color: #fbbf24;">${player.points}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">pts</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ============================================
// ПРОФИЛЬ
// ============================================

async function loadProfileTab() {
    const container = document.getElementById('profileContent');
    if (!container) return;

    const userName = appData.currentUser?.game_nickname || 'Devans';
    const userInitials = userName.substring(0, 2).toUpperCase();

    container.innerHTML = `
        <!-- Хедер профиля -->
        <div class="profile-header">
            <div class="profile-user-info">
                <div class="profile-avatar">${userInitials}</div>
                <div class="profile-details">
                    <div class="profile-name">${userName}</div>
                    <div class="profile-role">Игрок • #15 в рейтинге</div>
                </div>
                <button class="header-menu-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Статистика -->
        <div style="padding: 0 1rem 1rem;">
            <div class="summary-card">
                <div class="summary-label">Статистика</div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div style="width: 40px; height: 40px; margin: 0 auto 0.5rem; border-radius: 50%; background: rgba(251,191,36,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                            </svg>
                        </div>
                        <div class="summary-number">5</div>
                        <div class="summary-text">Побед</div>
                    </div>
                    <div class="summary-item">
                        <div style="width: 40px; height: 40px; margin: 0 auto 0.5rem; border-radius: 50%; background: rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                            </svg>
                        </div>
                        <div class="summary-number">12</div>
                        <div class="summary-text">Игр</div>
                    </div>
                    <div class="summary-item">
                        <div style="width: 40px; height: 40px; margin: 0 auto 0.5rem; border-radius: 50%; background: rgba(168,85,247,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <div class="summary-number">2180</div>
                        <div class="summary-text">Очков</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Достижения -->
        <div style="padding: 0 1rem 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Достижения</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <div class="list-card" style="border: 1px solid rgba(251,191,36,0.3);">
                    <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(251,191,36,0.2); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                    </div>
                    <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Первая победа</h3>
                    <p style="font-size: 0.75rem; color: #6b7280;">Выиграл турнир</p>
                </div>
                <div class="list-card" style="border: 1px solid rgba(59,130,246,0.3);">
                    <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                    </div>
                    <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Активист</h3>
                    <p style="font-size: 0.75rem; color: #6b7280;">Сыграл 10 игр</p>
                </div>
                <div class="list-card" style="border: 1px solid rgba(168,85,247,0.3);">
                    <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(168,85,247,0.2); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Легенда</h3>
                    <p style="font-size: 0.75rem; color: #6b7280;">Попал в топ-3</p>
                </div>
                <div class="list-card" style="border: 1px solid rgba(34,197,94,0.3);">
                    <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(34,197,94,0.2); display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                        </svg>
                    </div>
                    <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Рост</h3>
                    <p style="font-size: 0.75rem; color: #6b7280;">+5 позиций</p>
                </div>
            </div>
        </div>

        <!-- Последняя активность -->
        <div style="padding: 0 1rem 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Последняя активность</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <div class="list-card" style="display: flex; align-items: center; gap: 0.75rem; border: 1px solid #374151;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(34,197,94,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                        </svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.875rem; margin-bottom: 0.125rem;">Победа в турнире</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">DEEP CLASSIC TOURNAMENT</div>
                    </div>
                    <div style="font-size: 0.75rem; color: #6b7280; flex-shrink: 0;">2д</div>
                </div>
                <div class="list-card" style="display: flex; align-items: center; gap: 0.75rem; border: 1px solid #374151;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.875rem; margin-bottom: 0.125rem;">Участие в игре</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">TEXAS HOLDEM CLASSIC</div>
                    </div>
                    <div style="font-size: 0.75rem; color: #6b7280; flex-shrink: 0;">5д</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// АДМИН-ПАНЕЛЬ
// ============================================

async function loadAdminPanel() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    try {
        const stats = await API.getStats();
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; padding: 0 1rem; margin-bottom: 1rem;">
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${stats.totalUsers || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Пользователей</div>
                </div>
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${stats.totalTournaments || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Турниров</div>
                </div>
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${stats.activeGames || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Активных игр</div>
                </div>
            </div>

            <div style="padding: 0 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <button class="btn-primary" onclick="showCreateTournamentModal()">
                    Создать турнир
                </button>
                <button class="btn-primary" onclick="showCreateGameModal()">
                    Создать игру
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки админ-панели:', error);
        container.innerHTML = '<div class="list-card">Ошибка загрузки</div>';
    }
}

function showCreateTournamentModal() {
    showAlert('Создание турнира - используйте админ-панель на сайте');
}

function showCreateGameModal() {
    showAlert('Создание игры - используйте админ-панель на сайте');
}

// ============================================
// МОДАЛЬНОЕ ОКНО ДЛЯ ИГР
// ============================================

let currentGameId = null;

function showGameDetails(gameId) {
    const game = appData.games.find(g => g.id === gameId);
    if (!game) return;

    currentGameId = gameId;
    
    document.getElementById('modalGameName').textContent = game.name;
    document.getElementById('modalGameDate').textContent = game.date;
    document.getElementById('modalGameTime').textContent = game.time;
    document.getElementById('modalGamePlayers').textContent = game.players;
    document.getElementById('modalGameDescription').textContent = game.description;
    
    updateRegisterButton();
    
    document.getElementById('gameModal').classList.add('active');
    vibrate();
}

function closeGameModal() {
    document.getElementById('gameModal').classList.remove('active');
    currentGameId = null;
}

function updateRegisterButton() {
    const btn = document.getElementById('registerBtn');
    if (!btn || !currentGameId) return;
    
    const isRegistered = appData.registeredGames.has(currentGameId);
    
    btn.className = 'modal-register-btn' + (isRegistered ? ' registered' : '');
    btn.innerHTML = isRegistered 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> Отменить запись'
        : 'Зарегистрироваться';
}

function toggleRegistration() {
    if (!currentGameId) return;
    
    if (appData.registeredGames.has(currentGameId)) {
        appData.registeredGames.delete(currentGameId);
        showAlert('Регистрация отменена');
    } else {
        appData.registeredGames.add(currentGameId);
        showAlert('Вы зарегистрированы!');
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('registeredGames', JSON.stringify(Array.from(appData.registeredGames)));
    
    updateRegisterButton();
    vibrate();
}

// ============================================
// УТИЛИТЫ
// ============================================

function showAlert(message) {
    if (tg.showAlert) {
        try {
            tg.showAlert(message);
        } catch (error) {
            console.warn('Telegram showAlert failed:', error);
            alert(message);
        }
    } else {
        alert(message);
    }
}

function vibrate() {
    if (tg.HapticFeedback) {
        try {
            tg.HapticFeedback.impactOccurred('light');
        } catch (error) {
            console.warn('Telegram vibrate failed:', error);
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

async function init() {
    console.log('🚀 Инициализация приложения...');

    // Инициализация Telegram WebApp
    if (tg.ready) {
        try {
            tg.ready();
            tg.expand();
        } catch (error) {
            console.warn('Telegram API init failed:', error);
        }
    }

    // Загружаем сохраненные регистрации
    try {
        const saved = localStorage.getItem('registeredGames');
        if (saved) {
            const parsed = JSON.parse(saved);
            appData.registeredGames = new Set(parsed);
        }
    } catch (error) {
        console.warn('Failed to load registrations:', error);
    }

    // Проверяем авторизацию
    const telegramUser = tg.initDataUnsafe?.user;
    if (telegramUser) {
        try {
            let user = await API.getUserByTelegramId(telegramUser.id);
            
            if (!user) {
                // Создаём нового пользователя
                user = await API.createUser({
                    telegram_id: telegramUser.id.toString(),
                    telegram_username: telegramUser.username || '',
                    game_nickname: telegramUser.first_name || 'Игрок',
                    avatar_url: telegramUser.photo_url || ''
                });
            }
            
            appData.currentUser = user;
            appData.isAdmin = user.role === 'admin';

            // Показываем админ-кнопку если админ
            if (appData.isAdmin) {
                document.getElementById('adminBtn').style.display = 'flex';
            }
        } catch (error) {
            console.error('Auth error:', error);
        }
    }

    // Загружаем начальные данные
    await loadHomeData();
    await loadGamesTab();
    
    console.log('✅ Приложение готово!');
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

// Закрытие модального окна по клику вне его
document.getElementById('gameModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeGameModal();
    }
});

