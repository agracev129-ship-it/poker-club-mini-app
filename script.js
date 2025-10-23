// ============================================
// POKER CLUB MINI APP - ПОЛНАЯ ВЕРСИЯ С НОВЫМ ДИЗАЙНОМ
// ============================================

const tg = window.Telegram?.WebApp || {};
const API_BASE = 'https://poker-club-server-1.onrender.com/api';

// Данные приложения
const appData = {
    currentUser: null,
    isAdmin: false,
    registeredUsers: [],
    tournaments: [],
    games: [],
    selectedTournamentId: null,
    userGameHistory: [],
    tournamentStandings: []
};

// ============================================
// API МЕТОДЫ
// ============================================

const API = {
    // Пользователи
    async getUsers() {
        console.log('🔍 API.getUsers()');
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        const data = await response.json();
        console.log('✅ Пользователи:', data.length);
        return data;
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

    async updateUser(userId, userData) {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Ошибка обновления пользователя');
        return await response.json();
    },

    // Турниры
    async getBigTournaments() {
        console.log('🔍 API.getBigTournaments()');
        const response = await fetch(`${API_BASE}/big-tournaments`);
        if (!response.ok) throw new Error('Ошибка загрузки турниров');
        const data = await response.json();
        console.log('✅ Турниры:', data.length);
        return data;
    },

    async createBigTournament(tournamentData) {
        console.log('📤 API.createBigTournament:', tournamentData);
        const response = await fetch(`${API_BASE}/big-tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания турнира');
        }
        const result = await response.json();
        console.log('✅ Турнир создан:', result);
        return result;
    },

    // Игры
    async getGames(tournamentId = null) {
        console.log('🔍 API.getGames(), tournamentId:', tournamentId);
        const url = tournamentId 
            ? `${API_BASE}/games?tournamentId=${tournamentId}`
            : `${API_BASE}/games`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки игр');
        const data = await response.json();
        console.log('✅ Игры:', data.length);
        return data;
    },

    async createGame(gameData) {
        console.log('📤 API.createGame:', gameData);
        const response = await fetch(`${API_BASE}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания игры');
        }
        const result = await response.json();
        console.log('✅ Игра создана:', result);
        return result;
    },

    async updateGameStatus(gameId, status) {
        const response = await fetch(`${API_BASE}/games/${gameId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Ошибка обновления статуса игры');
        return await response.json();
    },

    // Регистрация на игры
    async registerForGame(gameId, userId) {
        console.log('📤 API.registerForGame:', { gameId, userId });
        const response = await fetch(`${API_BASE}/game-registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId, userId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка регистрации');
        }
        return await response.json();
    },

    async cancelGameRegistration(gameId, userId) {
        console.log('📤 API.cancelGameRegistration:', { gameId, userId });
        const response = await fetch(`${API_BASE}/game-registrations/${gameId}/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка отмены');
        }
        return await response.json();
    },

    async getGameRegistrations(gameId) {
        const response = await fetch(`${API_BASE}/game-registrations/${gameId}`);
        if (!response.ok) throw new Error('Ошибка загрузки регистраций');
        return await response.json();
    },

    async markGamePayment(gameId, userId, isPaid) {
        console.log('📤 API.markGamePayment:', { gameId, userId, isPaid });
        const response = await fetch(`${API_BASE}/game-registrations/${gameId}/${userId}/payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPaid })
        });
        if (!response.ok) throw new Error('Ошибка обновления оплаты');
        return await response.json();
    },

    // Результаты игр
    async saveGameResults(gameId, results) {
        console.log('📤 API.saveGameResults:', { gameId, results });
        const response = await fetch(`${API_BASE}/game-results/${gameId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results })
        });
        if (!response.ok) throw new Error('Ошибка сохранения результатов');
        return await response.json();
    },

    async getGameResults(gameId) {
        const response = await fetch(`${API_BASE}/game-results/${gameId}`);
        if (!response.ok) throw new Error('Ошибка загрузки результатов');
        return await response.json();
    },

    // Турнирная таблица
    async getTournamentStandings(tournamentId) {
        console.log('🔍 API.getTournamentStandings:', tournamentId);
        const response = await fetch(`${API_BASE}/tournament-standings/${tournamentId}`);
        if (!response.ok) throw new Error('Ошибка загрузки таблицы');
        const data = await response.json();
        console.log('✅ Таблица загружена:', data.length);
        return data;
    },

    // История игр пользователя
    async getUserGameHistory(userId, tournamentId = null) {
        const url = tournamentId
            ? `${API_BASE}/user-game-history/${userId}?tournamentId=${tournamentId}`
            : `${API_BASE}/user-game-history/${userId}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки истории');
        return await response.json();
    },

    // Статистика
    async getStats() {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (!response.ok) throw new Error('Ошибка загрузки статистики');
        return await response.json();
    }
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

async function initApp() {
    try {
        console.log('🚀 Инициализация приложения...');
        
        // Инициализация Telegram WebApp
        if (tg && tg.ready) {
            try {
                tg.ready();
                tg.expand();
            } catch (e) {
                console.warn('Telegram API недоступен:', e);
            }
        }

        // Проверяем авторизацию
        await checkAuthentication();

        console.log('✅ Приложение инициализировано');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
}

async function checkAuthentication() {
    try {
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            console.log('👤 Telegram пользователь не найден, используем тестовые данные');
            // Для тестирования создаём тестового пользователя (ВАС)
            appData.currentUser = {
                id: 1,
                telegram_id: '609464085',
                game_nickname: 'Devans',
                role: 'admin'
            };
            appData.isAdmin = true;
            await loadInitialData();
            return;
        }

        console.log('👤 Telegram пользователь:', user);

        // Проверяем, есть ли пользователь в БД
        let existingUser = await API.getUserByTelegramId(user.id);

        if (!existingUser) {
            // Создаём нового пользователя
            existingUser = await API.createUser({
                telegram_id: user.id.toString(),
                telegram_username: user.username || '',
                game_nickname: user.first_name || 'Игрок',
                avatar_url: user.photo_url || ''
            });
        }

        appData.currentUser = existingUser;
        appData.isAdmin = existingUser.role === 'admin' || existingUser.telegram_id === '609464085';
        
        console.log('✅ Пользователь:', existingUser.game_nickname, 'Admin:', appData.isAdmin);
        
        await loadInitialData();
    } catch (error) {
        console.error('❌ Ошибка авторизации:', error);
        showAlert('Ошибка авторизации: ' + error.message);
    }
}

async function loadInitialData() {
    try {
        console.log('📦 Загрузка начальных данных...');
        
        await loadUserData();
        await loadTournaments();
        
        // Показываем кнопку админа если админ
        if (appData.isAdmin) {
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) adminBtn.style.display = 'flex';
        }
        
        updateNavigation();
        console.log('✅ Начальные данные загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function switchTab(tabName) {
    console.log('📍 Переход на вкладку:', tabName);
    
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

function updateNavigation() {
    // Обновляем имя пользователя во всех местах
    const userNameElements = document.querySelectorAll('#headerName, #userName');
    userNameElements.forEach(el => {
        if (el) el.textContent = appData.currentUser?.game_nickname || 'Игрок';
    });
}

// ============================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================

async function loadHomeData() {
    console.log('🏠 Загрузка главной страницы');
    
    updateTimer();
    
    // Обновляем имя
    const headerName = document.getElementById('headerName');
    if (headerName && appData.currentUser) {
        headerName.textContent = appData.currentUser.game_nickname || 'Игрок';
    }
    
    // Обновляем аватар
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar && appData.currentUser?.avatar_url) {
        headerAvatar.src = appData.currentUser.avatar_url;
    }

    // Загружаем турниры для карточек
    await loadTournamentsForHome();
    
    // Загружаем статистику пользователя
    await loadUserStats();
}

async function loadTournamentsForHome() {
    const container = document.getElementById('tournamentCardsContainer');
    if (!container || appData.tournaments.length === 0) return;

    // Берём первые 2 турнира
    const activeTournaments = appData.tournaments.slice(0, 2);
    
    container.innerHTML = activeTournaments.map((tournament, index) => {
        const isPrimary = index === 0;
        const cardClass = isPrimary ? 'tournament-primary' : 'tournament-secondary';
        
        return `
            <button class="tournament-card ${cardClass}" onclick="selectTournament(${tournament.id})">
                <div class="tournament-players">
                    <div class="player-dot"></div>
                    <div class="player-dot"></div>
                    <div class="player-dot ${!isPrimary ? 'gray' : ''}"></div>
                </div>
                <div class="tournament-info">
                    <div class="tournament-type ${!isPrimary ? 'gray' : ''}">${tournament.name}</div>
                    <div class="tournament-time">19:00</div>
                </div>
                <button class="tournament-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </button>
        `;
    }).join('');
}

async function loadUserStats() {
    if (!appData.currentUser) return;

    try {
        // Загружаем историю игр пользователя
        appData.userGameHistory = await API.getUserGameHistory(appData.currentUser.id);
        
        // Считаем статистику
        const totalGames = appData.userGameHistory.length;
        const wins = appData.userGameHistory.filter(g => g.place === 1).length;
        const totalPrizes = appData.userGameHistory.reduce((sum, g) => sum + (g.points || 0), 0);
        
        // Обновляем UI
        const gamesPlayedEl = document.getElementById('gamesPlayed');
        const userWinsEl = document.getElementById('userWins');
        const userPrizesEl = document.getElementById('userPrizes');
        
        if (gamesPlayedEl) gamesPlayedEl.textContent = totalGames;
        if (userWinsEl) userWinsEl.textContent = wins;
        if (userPrizesEl) userPrizesEl.textContent = `${totalPrizes * 100}₽`;
        
        // Обновляем график активности
        renderActivityGraph(appData.userGameHistory);
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

function renderActivityGraph(games) {
    const container = document.getElementById('activityGraph');
    if (!container) return;

    // Группируем игры по последним 7 дням
    const last7Days = Array(7).fill(0);
    const now = new Date();
    
    games.forEach(game => {
        const gameDate = new Date(game.game_date);
        const daysDiff = Math.floor((now - gameDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
            last7Days[6 - daysDiff]++;
        }
    });
    
    const maxGames = Math.max(...last7Days, 1);
    
    container.innerHTML = last7Days.map(count => {
        const height = (count / maxGames) * 100;
        return `<div class="chart-bar" style="height: ${height}%"></div>`;
    }).join('');
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
        
        const timeLeftEl = document.getElementById('nextGameTimeLeft');
        if (timeLeftEl) {
            timeLeftEl.textContent = `До следующей игры ${hours}ч ${minutes}м`;
        }
    };

    calculateTimeLeft();
    setInterval(calculateTimeLeft, 60000);
}

// ============================================
// ИГРЫ
// ============================================

async function loadGamesTab() {
    console.log('🎮 Загрузка вкладки игр');
    
    try {
        // Загружаем игры для выбранного турнира или все игры
        appData.games = await API.getGames(appData.selectedTournamentId);
        
        const container = document.getElementById('gamesList');
        if (!container) return;

        if (appData.games.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
                    <p>Игр пока нет</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appData.games.map(game => {
            const gameDate = new Date(game.date);
            const participants = game.participants || [];
            const isRegistered = participants.some(p => p.user_id === appData.currentUser?.id);
            const canRegister = game.status === 'scheduled' && participants.length < game.max_players;
            
            return `
                <div class="game-card">
                    <div class="game-header">
                        <div>
                            <div class="game-title">Игра #${game.game_number}</div>
                            <div class="game-meta">
                                <div class="game-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                    </svg>
                                    <span>${participants.length} / ${game.max_players}</span>
                                </div>
                                <div class="game-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <span>${gameDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>
                                </div>
                                <div class="game-meta-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/>
                                        <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                                    </svg>
                                    <span>${gameDate.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})}</span>
                                </div>
                            </div>
                        </div>
                        <span class="game-status ${game.status}">${getGameStatusText(game.status)}</span>
                    </div>
                    ${isRegistered 
                        ? `<button class="game-join-btn" style="background: #4b5563;" onclick="cancelGameRegistration(${game.id})">
                            Отменить запись
                        </button>`
                        : canRegister 
                            ? `<button class="game-join-btn" onclick="registerForGame(${game.id})">
                                Присоединиться
                            </button>`
                            : `<button class="game-join-btn" style="background: #374151; cursor: not-allowed;" disabled>
                                Регистрация закрыта
                            </button>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка загрузки игр:', error);
        showAlert('Ошибка загрузки игр: ' + error.message);
    }
}

async function registerForGame(gameId) {
    if (!appData.currentUser) {
        showAlert('Войдите в систему для регистрации');
        return;
    }

    try {
        await API.registerForGame(gameId, appData.currentUser.id);
        showAlert('Вы успешно зарегистрированы на игру!');
        vibrate();
        await loadGamesTab();
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

async function cancelGameRegistration(gameId) {
    if (!appData.currentUser) return;

    if (!confirm('Вы уверены, что хотите отменить регистрацию? За отмену менее чем за 12 часов будет штраф.')) {
        return;
    }

    try {
        await API.cancelGameRegistration(gameId, appData.currentUser.id);
        showAlert('Регистрация отменена');
        vibrate();
        await loadGamesTab();
    } catch (error) {
        console.error('Ошибка отмены:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

function getGameStatusText(status) {
    const statusMap = {
        'scheduled': 'Запланирована',
        'registration_open': 'Регистрация',
        'registration_closed': 'Закрыта',
        'in_progress': 'Идёт',
        'completed': 'Завершена',
        'cancelled': 'Отменена'
    };
    return statusMap[status] || status;
}

// ============================================
// ТУРНИРЫ
// ============================================

async function loadTournaments() {
    try {
        console.log('🏆 Загрузка турниров...');
        appData.tournaments = await API.getBigTournaments();
        console.log('✅ Турниры загружены:', appData.tournaments.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки турниров:', error);
        showAlert('Ошибка загрузки турниров: ' + error.message);
    }
}

async function loadTournamentsTab() {
    console.log('🏆 Загрузка вкладки турниров');
    
    const container = document.getElementById('tournamentsList');
    if (!container) return;

    if (appData.tournaments.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                <p>Турниров пока нет</p>
            </div>
        `;
        return;
    }

    // Активный турнир
    const activeTournament = appData.tournaments[0];
    
    // Загружаем standings для активного турнира
    let standingsData = [];
    try {
        standingsData = await API.getTournamentStandings(activeTournament.id);
    } catch (error) {
        console.error('Ошибка загрузки standings:', error);
    }
    
    const totalPlayers = standingsData.length;
    
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
                            <div>${totalPlayers} / 100</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Начало</div>
                            <div>19:00</div>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="selectTournament(${activeTournament.id})">Посмотреть игры</button>
                </div>
            </div>
        </div>
        
        <div style="padding: 0 1rem;">
            <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #d1d5db;">Предстоящие турниры</h3>
            ${appData.tournaments.slice(1).map(tournament => `
                <div class="list-card" style="border: 1px solid #374151; margin-bottom: 0.75rem;">
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
                    <button style="width: 100%; background: rgba(255,255,255,0.1); border: none; border-radius: 0.75rem; padding: 0.625rem; color: white; cursor: pointer;" onclick="selectTournament(${tournament.id})">
                        Подробнее
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function selectTournament(tournamentId) {
    console.log('✅ Выбран турнир:', tournamentId);
    appData.selectedTournamentId = tournamentId;
    switchTab('games');
}

// ============================================
// РЕЙТИНГ
// ============================================

async function loadRatingTab() {
    console.log('📊 Загрузка рейтинга');
    
    const container = document.getElementById('ratingContent');
    if (!container) return;

    // Загружаем рейтинг для текущего или первого турнира
    const tournamentId = appData.selectedTournamentId || (appData.tournaments[0]?.id);
    
    if (!tournamentId) {
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <p>Создайте турнир для просмотра рейтинга</p>
            </div>
        `;
        return;
    }

    try {
        const standings = await API.getTournamentStandings(tournamentId);
        appData.tournamentStandings = standings;
        
        // Находим позицию текущего пользователя
        const userPosition = standings.findIndex(s => s.user_id === appData.currentUser?.id);
        const userStanding = userPosition >= 0 ? standings[userPosition] : null;
        
        const top3 = standings.slice(0, 3);
        
        container.innerHTML = `
            <!-- Ваша позиция -->
            ${userStanding ? `
                <div style="padding: 0 1rem 1rem;">
                    <div class="rating-position-card">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Ваша позиция</div>
                                <div style="font-size: 1.5rem;">#${userPosition + 1}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Рейтинг</div>
                                <div style="font-size: 1.25rem; color: #fbbf24;">${userStanding.total_points}</div>
                            </div>
                            <div style="width: 48px; height: 48px; background: rgba(185,28,28,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                    <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                                </svg>
                            </div>
                        </div>
                        ${userPosition < 20 ? `
                            <div style="font-size: 0.75rem; color: #22c55e; margin-top: 0.75rem;">
                                ✅ Вы проходите в Гранд Финал!
                            </div>
                        ` : `
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.75rem;">
                                До топ-20: <span style="color: white;">${standings[19]?.total_points - userStanding.total_points} очков</span>
                            </div>
                        `}
                    </div>
                </div>
            ` : ''}

            <!-- Топ-3 -->
            ${top3.length >= 3 ? `
                <div style="padding: 0 1rem 1rem;">
                    <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Топ-3</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                        <!-- 2 место -->
                        <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #9ca3af, #6b7280); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                2
                            </div>
                            <div class="list-card" style="width: 100%; text-align: center; padding: 0.625rem; border: 1px solid #374151;">
                                <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${top3[1].game_nickname}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">${top3[1].total_points}</div>
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
                                <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${top3[0].game_nickname}</div>
                                <div style="font-size: 0.75rem;">${top3[0].total_points}</div>
                            </div>
                        </div>

                        <!-- 3 место -->
                        <div style="display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #fb923c, #ea580c); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-size: 0.875rem;">
                                3
                            </div>
                            <div class="list-card" style="width: 100%; text-align: center; padding: 0.625rem; border: 1px solid #374151;">
                                <div style="font-size: 0.75rem; margin-bottom: 0.25rem;">${top3[2].game_nickname}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">${top3[2].total_points}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Полный рейтинг -->
            <div style="padding: 0 1rem;">
                <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Общий рейтинг</div>
                ${standings.map((player, index) => {
                    const bgClass = index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                    index === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' :
                                    index === 2 ? 'linear-gradient(135deg, #fb923c, #ea580c)' : '#374151';
                    const isCurrentUser = player.user_id === appData.currentUser?.id;
                    return `
                        <div class="list-card" style="display: flex; align-items: center; gap: 0.75rem; border: 1px solid ${isCurrentUser ? 'var(--accent-red)' : '#374151'}; ${isCurrentUser ? 'background: rgba(185,28,28,0.1);' : ''}">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgClass}; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; flex-shrink: 0;">
                                ${index + 1}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.125rem;">
                                    <span style="font-size: 0.875rem;">${player.game_nickname}</span>
                                    ${isCurrentUser ? '<span style="font-size: 0.75rem; color: var(--accent-red);">(Вы)</span>' : ''}
                                </div>
                                <div style="font-size: 0.75rem; color: #6b7280;">
                                    ${player.games_played} игр • ${player.total_points} очков
                                </div>
                            </div>
                            <div style="text-align: right; flex-shrink: 0;">
                                <div style="font-size: 0.875rem; color: #fbbf24;">${player.total_points}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">pts</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error);
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <p>Ошибка загрузки рейтинга</p>
            </div>
        `;
    }
}

// ============================================
// ПРОФИЛЬ
// ============================================

async function loadProfileTab() {
    console.log('👤 Загрузка профиля');
    
    const container = document.getElementById('profileContent');
    if (!container) return;

    const userName = appData.currentUser?.game_nickname || 'Игрок';
    const userInitials = userName.substring(0, 2).toUpperCase();

    // Загружаем статистику пользователя
    let userStats = {
        wins: 0,
        totalGames: 0,
        totalPoints: 0,
        position: '-'
    };

    try {
        if (appData.currentUser) {
            appData.userGameHistory = await API.getUserGameHistory(appData.currentUser.id);
            
            userStats.totalGames = appData.userGameHistory.length;
            userStats.wins = appData.userGameHistory.filter(g => g.place === 1).length;
            userStats.totalPoints = appData.userGameHistory.reduce((sum, g) => sum + (g.points || 0), 0);
            
            // Находим позицию в рейтинге
            if (appData.tournamentStandings.length > 0) {
                const position = appData.tournamentStandings.findIndex(s => s.user_id === appData.currentUser.id);
                userStats.position = position >= 0 ? `#${position + 1}` : '-';
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики профиля:', error);
    }

    container.innerHTML = `
        <!-- Хедер профиля -->
        <div class="profile-header">
            <div class="profile-user-info">
                <div class="profile-avatar">${userInitials}</div>
                <div class="profile-details">
                    <div class="profile-name">${userName}</div>
                    <div class="profile-role">${appData.isAdmin ? 'Администратор' : 'Игрок'} • ${userStats.position} в рейтинге</div>
                </div>
                <button class="header-menu-btn" onclick="showProfileMenu()">
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
                        <div class="summary-number">${userStats.wins}</div>
                        <div class="summary-text">Побед</div>
                    </div>
                    <div class="summary-item">
                        <div style="width: 40px; height: 40px; margin: 0 auto 0.5rem; border-radius: 50%; background: rgba(239,68,68,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                            </svg>
                        </div>
                        <div class="summary-number">${userStats.totalGames}</div>
                        <div class="summary-text">Игр</div>
                    </div>
                    <div class="summary-item">
                        <div style="width: 40px; height: 40px; margin: 0 auto 0.5rem; border-radius: 50%; background: rgba(168,85,247,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <div class="summary-number">${userStats.totalPoints}</div>
                        <div class="summary-text">Очков</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Достижения -->
        <div style="padding: 0 1rem 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Достижения</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                ${userStats.wins > 0 ? `
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
                ` : ''}
                ${userStats.totalGames >= 10 ? `
                    <div class="list-card" style="border: 1px solid rgba(59,130,246,0.3);">
                        <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(59,130,246,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                            </svg>
                        </div>
                        <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Активист</h3>
                        <p style="font-size: 0.75rem; color: #6b7280;">Сыграл 10+ игр</p>
                    </div>
                ` : ''}
                ${userStats.position.includes('#') && parseInt(userStats.position.slice(1)) <= 3 ? `
                    <div class="list-card" style="border: 1px solid rgba(168,85,247,0.3);">
                        <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(168,85,247,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Легенда</h3>
                        <p style="font-size: 0.75rem; color: #6b7280;">Попал в топ-3</p>
                    </div>
                ` : ''}
                ${userStats.totalPoints >= 1000 ? `
                    <div class="list-card" style="border: 1px solid rgba(34,197,94,0.3);">
                        <div style="width: 40px; height: 40px; margin-bottom: 0.75rem; border-radius: 50%; background: rgba(34,197,94,0.2); display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                            </svg>
                        </div>
                        <h3 style="font-size: 0.875rem; margin-bottom: 0.25rem;">Мастер</h3>
                        <p style="font-size: 0.75rem; color: #6b7280;">1000+ очков</p>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- История игр -->
        <div style="padding: 0 1rem 1rem;">
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">История игр</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${appData.userGameHistory.slice(0, 5).map(game => {
                    const gameDate = new Date(game.game_date);
                    const isWin = game.place === 1;
                    return `
                        <div class="list-card" style="display: flex; align-items: center; gap: 0.75rem; border: 1px solid #374151;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(${isWin ? '34,197,94' : '239,68,68'},0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isWin ? '#22c55e' : '#ef4444'}" stroke-width="2">
                                    ${isWin 
                                        ? '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'
                                        : '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'
                                    }
                                </svg>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.875rem; margin-bottom: 0.125rem;">${isWin ? 'Победа' : `Место: ${game.place}`}</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Игра #${game.game_number} • +${game.points} очков</div>
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280; flex-shrink: 0;">
                                ${Math.floor((new Date() - gameDate) / (1000 * 60 * 60 * 24))}д
                            </div>
                        </div>
                    `;
                }).join('') || '<div class="list-card" style="text-align: center; color: #6b7280;">История пуста</div>'}
            </div>
        </div>
    `;
}

function showProfileMenu() {
    // Здесь можно добавить меню профиля
    showAlert('Меню профиля - в разработке');
}

// ============================================
// АДМИН-ПАНЕЛЬ
// ============================================

async function loadAdminPanel() {
    console.log('👑 Загрузка админ-панели');
    
    const container = document.getElementById('adminContent');
    if (!container) return;

    try {
        const stats = await API.getStats();
        
        container.innerHTML = `
            <div style="padding: 1rem;">
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Панель администратора</h2>
                
                <!-- Статистика -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div class="list-card" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.totalUsers || 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Пользователей</div>
                    </div>
                    <div class="list-card" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.totalTournaments || 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Турниров</div>
                    </div>
                    <div class="list-card" style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.activeGames || 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Активных игр</div>
                    </div>
                </div>

                <!-- Действия -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <button class="btn-primary" onclick="showCreateTournamentModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Создать турнир
                    </button>
                    <button class="btn-primary" onclick="showCreateGameModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                        Создать игру
                    </button>
                    <button style="width: 100%; background: rgba(255,255,255,0.1); border: none; border-radius: 0.75rem; padding: 0.875rem; color: white; cursor: pointer; font-size: 1rem;" onclick="showUsersManagement()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        Управление пользователями
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки админ-панели:', error);
        container.innerHTML = '<div class="list-card" style="margin: 1rem;">Ошибка загрузки</div>';
    }
}

function showCreateTournamentModal() {
    const modal = document.getElementById('createTournamentModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        // Создаём модал динамически
        const modalHTML = `
            <div class="modal active" id="createTournamentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Создать турнир</h3>
                        <button class="modal-close" onclick="closeCreateTournamentModal()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Название турнира</label>
                            <input type="text" id="adminTournamentName" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #374151; background: var(--bg-tertiary); color: white; font-size: 1rem;" placeholder="Введите название">
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.875rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Описание</label>
                            <textarea id="adminTournamentDescription" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #374151; background: var(--bg-tertiary); color: white; font-size: 1rem; min-height: 100px;" placeholder="Опишите турнир"></textarea>
                        </div>
                        <button class="btn-primary" onclick="createTournamentFromAdmin()">Создать</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    vibrate();
}

function closeCreateTournamentModal() {
    const modal = document.getElementById('createTournamentModal');
    if (modal) modal.remove();
}

async function createTournamentFromAdmin() {
    const name = document.getElementById('adminTournamentName').value.trim();
    const description = document.getElementById('adminTournamentDescription').value.trim();
    
    if (!name) {
        showAlert('Введите название турнира');
        return;
    }
    
    try {
        await API.createBigTournament({
            name,
            description,
            startDate: new Date().toISOString(),
            topPlayersCount: 20
        });
        
        showAlert('Турнир создан успешно!');
        closeCreateTournamentModal();
        await loadTournaments();
        await loadAdminPanel();
    } catch (error) {
        console.error('Ошибка создания турнира:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

function showCreateGameModal() {
    showAlert('Создание игры - откройте полную админ-панель на desktop');
}

async function showUsersManagement() {
    try {
        const users = await API.getUsers();
        
        const modalHTML = `
            <div class="modal active" id="usersModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Пользователи (${users.length})</h3>
                        <button class="modal-close" onclick="document.getElementById('usersModal').remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                        ${users.map(user => `
                            <div class="list-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div>
                                    <div style="font-size: 0.875rem;">${user.game_nickname}</div>
                                    <div style="font-size: 0.75rem; color: #6b7280;">@${user.telegram_username || 'no_username'}</div>
                                </div>
                                <div style="font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 999px; background: ${user.role === 'admin' ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)'}; color: ${user.role === 'admin' ? '#fbbf24' : 'white'};">
                                    ${user.role === 'admin' ? 'Админ' : 'Игрок'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        vibrate();
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        showAlert('Ошибка загрузки пользователей');
    }
}

// ============================================
// УТИЛИТЫ
// ============================================

function showAlert(message) {
    console.log('🔔 Alert:', message);
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================
// ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

// Закрытие модальных окон по клику вне их
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.remove();
    }
});

console.log('✅ Script loaded successfully');
