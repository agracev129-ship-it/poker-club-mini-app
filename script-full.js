// ============================================
// POKER CLUB MINI APP - ПОЛНАЯ ВЕРСИЯ V3.0
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
    selectedTournamentId: null
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
        if (tg && tg.expand) {
            try {
                tg.ready();
                tg.expand();
                tg.enableClosingConfirmation();
            } catch (e) {
                console.warn('Telegram API недоступен:', e);
            }
        }

        // Применяем тему
        applyTheme();

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
            showLoginModal();
            return;
        }

        console.log('👤 Telegram пользователь:', user);

        // Проверяем, есть ли пользователь в БД
        const existingUser = await API.getUserByTelegramId(user.id);

        if (existingUser) {
            appData.currentUser = existingUser;
            // Проверяем права админа: роль admin, ваш ID или nickname admin
            appData.isAdmin = existingUser.role === 'admin' || 
                             existingUser.telegram_id === '609464085' || 
                             existingUser.gameNickname === 'admin';
            console.log('✅ Пользователь найден:', existingUser.gameNickname, 'Admin:', appData.isAdmin);
            await loadInitialData();
        } else {
            console.log('📝 Пользователь не найден, показываем регистрацию');
            showRegistrationModal();
        }
    } catch (error) {
        console.error('❌ Ошибка авторизации:', error);
        showLoginModal();
    }
}

async function loadInitialData() {
    try {
        console.log('📦 Загрузка начальных данных...');
        await loadUserData();
        updateNavigation();
        console.log('✅ Начальные данные загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
    }
}

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================

async function loadUserData() {
    try {
        if (!appData.currentUser) return;

        console.log('👤 Загрузка данных пользователя...');

        // Обновляем UI
        const elements = {
            userName: document.getElementById('userName'),
            userRank: document.getElementById('userRank'),
            profileName: document.getElementById('profileName'),
            userAvatar: document.getElementById('userAvatar'),
            profileAvatar: document.getElementById('profileAvatar')
        };

        if (elements.userName) elements.userName.textContent = appData.currentUser.gameNickname;
        if (elements.userRank) elements.userRank.textContent = 'Игрок';
        if (elements.profileName) elements.profileName.textContent = appData.currentUser.gameNickname;

        const avatar = appData.currentUser.avatar || '👤';
        if (elements.userAvatar) elements.userAvatar.textContent = avatar;
        if (elements.profileAvatar) elements.profileAvatar.textContent = avatar;

        console.log('✅ Данные пользователя загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
}

async function loadTournaments() {
    try {
        console.log('🏆 Загрузка турниров...');
        appData.tournaments = await API.getBigTournaments();
        renderTournaments();
        console.log('✅ Турниры загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки турниров:', error);
        showAlert('Ошибка загрузки турниров: ' + error.message);
    }
}

async function loadGames(tournamentId = null) {
    try {
        console.log('🎮 Загрузка игр...');
        appData.games = await API.getGames(tournamentId);
        displayGames(appData.games);
        renderCalendar();
        await loadMyTournamentStanding();
        console.log('✅ Игры загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки игр:', error);
        showAlert('Ошибка загрузки игр: ' + error.message);
    }
}

async function loadAllUsers() {
    try {
        console.log('👥 Загрузка пользователей...');
        appData.registeredUsers = await API.getUsers();
        console.log('✅ Пользователи загружены:', appData.registeredUsers.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки пользователей:', error);
    }
}

async function loadAdminData() {
    try {
        if (!appData.isAdmin) return;

        console.log('👑 Загрузка данных админа...');
        
        // Загружаем пользователей
        await loadAllUsers();
        
        // Загружаем статистику
        const stats = await API.getStats();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalTournaments').textContent = stats.totalTournaments || 0;
        document.getElementById('activeGames').textContent = stats.activeGames || 0;
        
        console.log('✅ Данные админа загружены');
    } catch (error) {
        console.error('❌ Ошибка загрузки данных админа:', error);
    }
}

// ============================================
// ТУРНИРЫ
// ============================================

function renderTournaments() {
    const container = document.getElementById('tournamentsList');
    if (!container) return;

    if (appData.tournaments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
                <p>Турниров пока нет</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appData.tournaments.map(tournament => `
        <div class="tournament-card">
            <div class="tournament-header">
                <h3>${tournament.name}</h3>
                <span class="tournament-status ${tournament.status}">${getStatusText(tournament.status)}</span>
            </div>
            <div class="tournament-info">
                <p>${tournament.description || 'Турнир покерного клуба'}</p>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Начало: ${formatDate(tournament.start_date)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-trophy"></i>
                    <span>Топ-${tournament.top_players_count} в финал</span>
                </div>
            </div>
            <div class="tournament-actions">
                <button class="btn-join" onclick="selectTournament(${tournament.id})">
                    <i class="fas fa-eye"></i>
                    <span>Посмотреть</span>
                </button>
                ${appData.isAdmin ? `
                    <button class="btn-secondary" onclick="showTournamentStandings(${tournament.id})">
                        <i class="fas fa-list"></i>
                        <span>Таблица</span>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function createTournament() {
    if (!appData.isAdmin) return;

    const name = document.getElementById('tournamentName').value.trim();
    const description = document.getElementById('tournamentDescription').value.trim();

    if (!name) {
        showAlert('Введите название турнира!');
        return;
    }

    try {
        const tournamentData = {
            name,
            description,
            startDate: new Date().toISOString(),
            topPlayersCount: 20
        };

        console.log('📤 Создание турнира:', tournamentData);

        await API.createBigTournament(tournamentData);
        
        showAlert('Турнир создан успешно!');
        closeModal('addTournamentModal');
        
        // Перезагружаем турниры
        await loadTournaments();
        
        // Очищаем форму
        document.getElementById('tournamentName').value = '';
        document.getElementById('tournamentDescription').value = '';
    } catch (error) {
        console.error('❌ Ошибка создания турнира:', error);
        showAlert('Ошибка создания турнира: ' + error.message);
    }
}

function selectTournament(tournamentId) {
    appData.selectedTournamentId = tournamentId;
    switchTab('games');
    loadGames(tournamentId);
}

// ============================================
// ИГРЫ
// ============================================

function displayGames(games) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    if (games.length === 0) {
        gamesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
                <p>Игр пока нет</p>
            </div>
        `;
        return;
    }

    gamesList.innerHTML = games.map(game => createGameCard(game)).join('');
}

function createGameCard(game) {
    const gameDate = new Date(game.date);
    const participantsCount = game.participants?.length || 0;
    const isRegistered = game.participants?.some(p => p.user_id === appData.currentUser?.id);

    return `
        <div class="game-card">
            <div class="game-header">
                <h4>Игра #${game.game_number}</h4>
                <span class="game-status ${game.status}">${getGameStatusText(game.status)}</span>
            </div>
            <div class="game-info">
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(game.date)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${participantsCount}/${game.max_players} участников</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-money-bill"></i>
                    <span>Взнос: ${game.buyin_amount} ₽</span>
                </div>
            </div>
            <div class="game-actions">
                ${createGameActions(game, isRegistered)}
            </div>
        </div>
    `;
}

function createGameActions(game, isRegistered) {
    const now = new Date();
    const gameDate = new Date(game.date);
    const isUpcoming = gameDate > now && game.status === 'upcoming';

    let actions = '';

    if (isUpcoming) {
        if (isRegistered) {
            actions += `
                <button class="game-btn danger" onclick="cancelGameRegistration(${game.id})">
                    <i class="fas fa-times"></i>
                    <span>Отменить</span>
                </button>
            `;
        } else {
            actions += `
                <button class="game-btn primary" onclick="registerForGame(${game.id})">
                    <i class="fas fa-plus"></i>
                    <span>Записаться</span>
                </button>
            `;
        }
    }

    if (appData.isAdmin) {
        actions += `
            <button class="game-btn secondary" onclick="showGameDetails(${game.id})">
                <i class="fas fa-eye"></i>
                <span>Детали</span>
            </button>
        `;
        
        if (game.status === 'finished' || game.status === 'in_progress') {
            actions += `
                <button class="game-btn secondary" onclick="showGameResults(${game.id})">
                    <i class="fas fa-trophy"></i>
                    <span>Результаты</span>
                </button>
            `;
        }
    }

    return actions;
}

// Регистрация на игру
async function registerForGame(gameId) {
    try {
        await API.registerForGame(gameId, appData.currentUser.id);
        showAlert('Вы успешно записались на игру!');
        await loadGames(appData.selectedTournamentId);
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Отмена регистрации
async function cancelGameRegistration(gameId) {
    try {
        await API.cancelGameRegistration(gameId, appData.currentUser.id);
        showAlert('Регистрация отменена');
        await loadGames(appData.selectedTournamentId);
    } catch (error) {
        console.error('❌ Ошибка отмены:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// ============================================
// КАЛЕНДАРЬ ИГР
// ============================================

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Получаем первый и последний день месяца
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Дни недели
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    let html = '<div class="calendar-header">';
    daysOfWeek.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    html += '</div><div class="calendar-days">';
    
    // Пустые ячейки до первого дня
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Дни месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const hasGame = appData.games.some(game => {
            const gameDate = new Date(game.date);
            return gameDate.getDate() === day && 
                   gameDate.getMonth() === currentMonth && 
                   gameDate.getFullYear() === currentYear;
        });
        
        const isToday = day === now.getDate();
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (hasGame) classes.push('has-game');
        
        html += `<div class="${classes.join(' ')}">${day}</div>`;
    }
    
    html += '</div>';
    calendarGrid.innerHTML = html;
}

// ============================================
// ТУРНИРНАЯ ТАБЛИЦА
// ============================================

async function showTournamentStandings(tournamentId) {
    try {
        const standings = await API.getTournamentStandings(tournamentId);
        const modal = document.getElementById('tournamentStandingsModal');
        const list = document.getElementById('standingsList');
        
        if (standings.length === 0) {
            list.innerHTML = '<p style="text-align: center; padding: 40px;">Нет данных</p>';
        } else {
            list.innerHTML = standings.map((standing, index) => `
                <div class="standing-item ${index < 20 ? 'qualified' : ''}">
                    <div class="standing-position">${index + 1}</div>
                    <div class="standing-info">
                        <div class="standing-name">${standing.game_nickname}</div>
                        <div class="standing-stats">
                            ${standing.total_points} очков • ${standing.games_played} игр
                        </div>
                    </div>
                    ${index < 20 ? '<div class="qualified-badge">✓ В финале</div>' : ''}
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('❌ Ошибка загрузки таблицы:', error);
        showAlert('Ошибка загрузки таблицы');
    }
}

async function loadMyTournamentStanding() {
    if (!appData.selectedTournamentId || !appData.currentUser) return;
    
    try {
        const standings = await API.getTournamentStandings(appData.selectedTournamentId);
        const myStanding = standings.find(s => s.user_id === appData.currentUser.id);
        const myPosition = standings.findIndex(s => s.user_id === appData.currentUser.id) + 1;
        
        const container = document.getElementById('myTournamentStanding');
        if (!container) return;
        
        if (myStanding) {
            container.style.display = 'block';
            document.getElementById('myPosition').textContent = myPosition;
            document.getElementById('myPoints').textContent = myStanding.total_points;
            document.getElementById('myGames').textContent = myStanding.games_played;
            
            const statusBadge = document.getElementById('myStatus');
            if (myPosition <= 20) {
                statusBadge.innerHTML = '<span class="status-badge success">✅ В финале</span>';
            } else {
                statusBadge.innerHTML = '<span class="status-badge">❌ Не в финале</span>';
            }
        } else {
            container.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки позиции:', error);
    }
}

// ============================================
// АДМИНКА
// ============================================

async function showUsersList() {
    if (!appData.isAdmin) return;
    
    try {
        await loadAllUsers();
        
        const modal = document.getElementById('usersListModal');
        const list = document.getElementById('usersList');
        const title = modal.querySelector('.modal-header h2');
        
        title.textContent = `Все пользователи (${appData.registeredUsers.length})`;
        
        if (appData.registeredUsers.length === 0) {
            list.innerHTML = '<p style="text-align: center; padding: 40px;">Нет пользователей</p>';
        } else {
            list.innerHTML = appData.registeredUsers.map(user => `
                <div class="user-item">
                    <div class="user-avatar-small">${user.avatar || '👤'}</div>
                    <div class="user-info-small">
                        <div class="user-name-small">${user.game_nickname}</div>
                        <div class="user-stats-small">Telegram ID: ${user.telegram_id}</div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('❌ Ошибка загрузки пользователей:', error);
        showAlert('Ошибка загрузки пользователей');
    }
}

function showAddTournamentModal() {
    if (!appData.isAdmin) return;
    document.getElementById('addTournamentModal').style.display = 'block';
}

async function showGameDetails(gameId) {
    if (!appData.isAdmin) return;
    
    try {
        const game = appData.games.find(g => g.id === gameId);
        if (!game) return;
        
        const modal = document.getElementById('gameDetailsModal');
        const details = document.getElementById('gameDetails');
        const title = document.getElementById('gameDetailsTitle');
        
        title.textContent = `Игра #${game.game_number}`;
        
        // Получаем участников
        const participants = game.participants || [];
        
        details.innerHTML = `
            <div class="game-info-block">
                <h3>Информация об игре</h3>
                <p><strong>Дата:</strong> ${formatDate(game.date)}</p>
                <p><strong>Взнос:</strong> ${game.buyin_amount} ₽</p>
                <p><strong>Участников:</strong> ${participants.length}/${game.max_players}</p>
            </div>
            <div class="participants-block">
                <h3>Участники (${participants.length})</h3>
                <div class="participants-list">
                    ${participants.length === 0 ? '<p>Нет участников</p>' : participants.map(p => `
                        <div class="participant-item">
                            <span>${p.game_nickname}</span>
                            <label>
                                <input type="checkbox" 
                                       ${p.is_paid ? 'checked' : ''} 
                                       onchange="togglePayment(${gameId}, ${p.user_id}, this.checked)">
                                Оплачено
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${game.status === 'upcoming' ? `
                <button class="btn-primary" onclick="startGame(${gameId})">
                    <i class="fas fa-play"></i>
                    <span>Начать игру</span>
                </button>
            ` : ''}
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('❌ Ошибка загрузки деталей:', error);
        showAlert('Ошибка загрузки деталей игры');
    }
}

async function showGameResults(gameId) {
    if (!appData.isAdmin) return;
    
    try {
        const game = appData.games.find(g => g.id === gameId);
        if (!game) return;
        
        const modal = document.getElementById('gameResultsModal');
        const form = document.getElementById('resultsForm');
        
        // Получаем участников, которые оплатили
        const participants = game.participants?.filter(p => p.is_paid) || [];
        
        if (participants.length === 0) {
            showAlert('Нет участников, которые оплатили взнос');
            return;
        }
        
        form.innerHTML = `
            <h3>Игра #${game.game_number}</h3>
            <p>Введите места участников:</p>
            <div class="results-list">
                ${participants.map((p, index) => `
                    <div class="result-item">
                        <span class="player-name">${p.game_nickname}</span>
                        <select id="place_${p.user_id}" class="place-select">
                            <option value="">Выберите место</option>
                            ${Array.from({length: participants.length}, (_, i) => `
                                <option value="${i + 1}">${i + 1} место</option>
                            `).join('')}
                        </select>
                        <span class="points" id="points_${p.user_id}">0 очков</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Добавляем обработчики для автоматического расчета очков
        participants.forEach(p => {
            const select = document.getElementById(`place_${p.user_id}`);
            if (select) {
                select.addEventListener('change', function() {
                    updateResultPoints(p.user_id, this.value);
                });
            }
        });
        
        modal.style.display = 'block';
        
        // Сохраняем gameId для использования при сохранении
        modal.dataset.gameId = gameId;
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка отображения формы результатов');
    }
}

function updateResultPoints(userId, place) {
    const pointsSpan = document.getElementById(`points_${userId}`);
    if (!pointsSpan) return;
    
    const points = calculatePoints(parseInt(place));
    pointsSpan.textContent = `${points} очков`;
}

function calculatePoints(place) {
    const POINTS_SYSTEM = {
        1: 300,
        2: 240,
        3: 195,
        4: 150,
        5: 150,
        6: 90,
        7: 90,
        8: 90,
        9: 90,
        10: 90
    };
    
    return POINTS_SYSTEM[place] || 30; // 11+ место = 30 очков
}

async function saveGameResults() {
    try {
        const modal = document.getElementById('gameResultsModal');
        const gameId = parseInt(modal.dataset.gameId);
        
        if (!gameId) {
            showAlert('Ошибка: не найден ID игры');
            return;
        }
        
        const game = appData.games.find(g => g.id === gameId);
        const participants = game.participants?.filter(p => p.is_paid) || [];
        
        // Собираем результаты
        const results = [];
        const usedPlaces = new Set();
        
        for (const p of participants) {
            const placeSelect = document.getElementById(`place_${p.user_id}`);
            if (!placeSelect || !placeSelect.value) {
                showAlert(`Не указано место для ${p.game_nickname}`);
                return;
            }
            
            const place = parseInt(placeSelect.value);
            
            if (usedPlaces.has(place)) {
                showAlert(`Место ${place} уже занято!`);
                return;
            }
            
            usedPlaces.add(place);
            
            results.push({
                userId: p.user_id,
                place: place,
                points: calculatePoints(place)
            });
        }
        
        // Отправляем результаты на сервер
        await API.saveGameResults(gameId, results);
        
        showAlert('Результаты сохранены успешно!');
        closeModal('gameResultsModal');
        
        // Перезагружаем игры
        await loadGames(appData.selectedTournamentId);
        
    } catch (error) {
        console.error('❌ Ошибка сохранения результатов:', error);
        showAlert('Ошибка сохранения результатов: ' + error.message);
    }
}

async function togglePayment(gameId, userId, isPaid) {
    try {
        await API.markGamePayment(gameId, userId, isPaid);
        showAlert(isPaid ? 'Оплата отмечена' : 'Оплата снята');
    } catch (error) {
        console.error('❌ Ошибка обновления оплаты:', error);
        showAlert('Ошибка обновления оплаты');
    }
}

async function startGame(gameId) {
    try {
        // Обновляем статус игры на "in_progress"
        await API.updateGameStatus(gameId, 'in_progress');
        showAlert('Игра начата!');
        closeModal('gameDetailsModal');
        await loadGames(appData.selectedTournamentId);
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showAlert('Ошибка начала игры');
    }
}

// ============================================
// РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ
// ============================================

async function registerUser() {
    const gameNickname = document.getElementById('gameNickname').value.trim();
    const preferredGame = document.getElementById('preferredGame').value;

    if (!gameNickname) {
        showAlert('Введите никнейм!');
        return;
    }

    try {
        const user = tg.initDataUnsafe?.user || { id: Date.now(), first_name: 'Test User' };
        
        const userData = {
            telegramId: user.id,
            telegramName: user.first_name,
            telegramUsername: user.username || '',
            gameNickname: gameNickname,
            preferredGame: preferredGame
        };

        const newUser = await API.createUser(userData);
        appData.currentUser = newUser;
        appData.isAdmin = gameNickname === 'admin';

        closeModal('registrationModal');
        await loadInitialData();
        showAlert('Регистрация успешна!');
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        showAlert('Ошибка регистрации: ' + error.message);
    }
}

function loginAsUser() {
    closeModal('loginModal');
    showRegistrationModal();
}

function loginAsAdmin() {
    appData.isAdmin = true;
    appData.currentUser = { 
        id: 1, 
        telegram_id: '609464085',
        gameNickname: 'Devans', 
        avatar: '👑',
        role: 'admin'
    };
    closeModal('loginModal');
    loadInitialData();
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegistrationModal() {
    closeModal('loginModal');
    document.getElementById('registrationModal').style.display = 'block';
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ТАБОВ
// ============================================

async function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item, .nav-tab').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(el => {
        el.classList.add('active');
    });
    
    vibrate();
    
    // Загружаем данные для активной вкладки
    switch(tabName) {
        case 'home':
            await loadUserData();
            break;
        case 'games':
            await loadGames(appData.selectedTournamentId);
            break;
        case 'tournaments':
            await loadTournaments();
            break;
        case 'admin':
            await loadAdminData();
            break;
    }
}

// ============================================
// УТИЛИТЫ
// ============================================

function showAlert(message) {
    console.log('🔔', message);
    if (tg && tg.showAlert) {
        try {
            tg.showAlert(message);
        } catch (e) {
            alert(message);
        }
    } else {
        alert(message);
    }
}

function vibrate() {
    if (tg && tg.HapticFeedback) {
        try {
            tg.HapticFeedback.impactOccurred('light');
        } catch (e) {
            // Ignore
        }
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statuses = {
        active: 'Активен',
        upcoming: 'Предстоящий',
        finished: 'Завершён'
    };
    return statuses[status] || status;
}

function getGameStatusText(status) {
    const statuses = {
        upcoming: 'Предстоящая',
        in_progress: 'Идёт сейчас',
        finished: 'Завершена',
        cancelled: 'Отменена'
    };
    return statuses[status] || status;
}

function updateNavigation() {
    const adminTab = document.querySelector('[data-tab="admin"]');
    if (adminTab) {
        adminTab.style.display = appData.isAdmin ? 'flex' : 'none';
    }
}

function applyTheme() {
    if (tg && tg.themeParams) {
        document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
        document.body.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#3498db');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();

    // Навигация
    document.querySelectorAll('.nav-item, .nav-tab').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
});

// ============================================
// ЭКСПОРТ ФУНКЦИЙ
// ============================================

window.switchTab = switchTab;
window.createTournament = createTournament;
window.selectTournament = selectTournament;
window.registerForGame = registerForGame;
window.cancelGameRegistration = cancelGameRegistration;
window.showTournamentStandings = showTournamentStandings;
window.showUsersList = showUsersList;
window.showAddTournamentModal = showAddTournamentModal;
window.showGameDetails = showGameDetails;
window.showGameResults = showGameResults;
window.saveGameResults = saveGameResults;
window.togglePayment = togglePayment;
window.startGame = startGame;
window.registerUser = registerUser;
window.loginAsUser = loginAsUser;
window.loginAsAdmin = loginAsAdmin;
window.closeModal = closeModal;

