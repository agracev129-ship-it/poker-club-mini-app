// ============================================
// POKER CLUB MINI APP - NEW DESIGN
// ============================================

const tg = window.Telegram?.WebApp || {};
const API_BASE = 'https://poker-club-server-1.onrender.com/api';

// Данные приложения
const appData = {
    currentUser: null,
    isAdmin: false,
    registeredUsers: [],
    tournaments: [],
    games: []
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
}

async function loadTabData(tabName) {
    try {
        switch(tabName) {
            case 'home':
                await loadHomeData();
                break;
            case 'games':
                await loadGames();
                break;
            case 'tournaments':
                await loadTournaments();
                break;
            case 'rating':
                await loadRating();
                break;
            case 'profile':
                await loadProfile();
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
// ЗАГРУЗКА ДАННЫХ ГЛАВНОЙ СТРАНИЦЫ
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

async function loadGames() {
    try {
        appData.games = await API.getGames();
        displayGames();
    } catch (error) {
        console.error('Ошибка загрузки игр:', error);
    }
}

function displayGames() {
    const container = document.getElementById('gamesList');
    if (!container) return;

    if (appData.games.length === 0) {
        container.innerHTML = '<div class="list-card">Игры не найдены</div>';
        return;
    }

    container.innerHTML = appData.games.map(game => `
        <div class="list-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600;">Игра #${game.game_number}</div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        ${new Date(game.date).toLocaleString('ru-RU')}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">Статус</div>
                    <div style="color: ${getStatusColor(game.status)};">${getStatusText(game.status)}</div>
                </div>
            </div>
            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                <div style="flex: 1;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Участники</div>
                    <div>${game.current_players || 0}/${game.max_players}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Взнос</div>
                    <div>${game.buyin_amount}₽</div>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'upcoming': '#fbbf24',
        'in_progress': '#10b981',
        'finished': '#6b7280'
    };
    return colors[status] || '#6b7280';
}

function getStatusText(status) {
    const texts = {
        'upcoming': 'Предстоящая',
        'in_progress': 'Идёт',
        'finished': 'Завершена'
    };
    return texts[status] || status;
}

// ============================================
// ТУРНИРЫ
// ============================================

async function loadTournaments() {
    try {
        appData.tournaments = await API.getBigTournaments();
        displayTournaments();
    } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
    }
}

function displayTournaments() {
    const container = document.getElementById('tournamentsList');
    if (!container) return;

    if (appData.tournaments.length === 0) {
        container.innerHTML = '<div class="list-card">Турниры не найдены</div>';
        return;
    }

    container.innerHTML = appData.tournaments.map(tournament => `
        <div class="list-card">
            <div style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">
                ${tournament.name}
            </div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                ${tournament.description || 'Описание отсутствует'}
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.875rem;">
                <div>
                    <span style="color: var(--text-secondary);">Старт:</span> 
                    ${new Date(tournament.start_date).toLocaleDateString('ru-RU')}
                </div>
                <div>
                    <span style="color: var(--text-secondary);">Топ:</span> 
                    ${tournament.top_players_count}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// РЕЙТИНГ
// ============================================

async function loadRating() {
    const container = document.getElementById('ratingList');
    if (!container) return;

    if (appData.tournaments.length === 0) {
        await loadTournaments();
    }

    if (appData.tournaments.length === 0) {
        container.innerHTML = '<div class="list-card">Нет активных турниров</div>';
        return;
    }

    try {
        const standings = await API.getTournamentStandings(appData.tournaments[0].id);
        displayRating(standings);
    } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error);
        container.innerHTML = '<div class="list-card">Ошибка загрузки рейтинга</div>';
    }
}

function displayRating(standings) {
    const container = document.getElementById('ratingList');
    if (!container) return;

    if (standings.length === 0) {
        container.innerHTML = '<div class="list-card">Рейтинг пуст</div>';
        return;
    }

    container.innerHTML = standings.map((standing, index) => `
        <div class="list-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: ${index < 3 ? 'var(--accent-red)' : 'var(--text-secondary)'};">
                        #${index + 1}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${standing.user_name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${standing.games_played} игр
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.25rem; font-weight: 700;">${standing.total_points}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">очков</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// ПРОФИЛЬ
// ============================================

async function loadProfile() {
    const container = document.getElementById('profileContent');
    if (!container) return;

    if (!appData.currentUser) {
        container.innerHTML = '<div class="list-card">Пользователь не авторизован</div>';
        return;
    }

    container.innerHTML = `
        <div class="list-card" style="text-align: center;">
            <img src="${appData.currentUser.avatar_url || 'https://via.placeholder.com/100'}" 
                 alt="Avatar" 
                 style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 1rem; border: 3px solid var(--accent-red);">
            <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                ${appData.currentUser.game_nickname}
            </div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                @${appData.currentUser.telegram_username || 'username'}
            </div>
        </div>

        <div class="list-card">
            <div style="font-weight: 600; margin-bottom: 1rem;">Статистика</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700;">0</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Игр</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700;">0</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Побед</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700;">0</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Очков</div>
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
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700;">${stats.totalUsers || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Пользователей</div>
                </div>
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700;">${stats.totalTournaments || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Турниров</div>
                </div>
                <div class="list-card" style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: 700;">${stats.activeGames || 0}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Активных игр</div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
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

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================

function showCreateTournamentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Создать турнир</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
            <form id="createTournamentForm">
                <div class="form-group">
                    <label class="form-label">Название</label>
                    <input type="text" class="form-input" id="tournamentName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="form-textarea" id="tournamentDescription"></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Создать</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('createTournamentForm').onsubmit = async (e) => {
        e.preventDefault();
        await createTournament();
        modal.remove();
    };
}

async function createTournament() {
    try {
        const name = document.getElementById('tournamentName').value.trim();
        const description = document.getElementById('tournamentDescription').value.trim();

        if (!name) {
            showAlert('Введите название турнира!');
            return;
        }

        await API.createBigTournament({
            name,
            description,
            startDate: new Date().toISOString(),
            topPlayersCount: 20
        });

        showAlert('Турнир создан!');
        await loadTournaments();
        await loadAdminPanel();
    } catch (error) {
        showAlert(`Ошибка: ${error.message}`);
    }
}

function showCreateGameModal() {
    showAlert('Функция создания игры в разработке');
}

// ============================================
// УТИЛИТЫ
// ============================================

function showAlert(message) {
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

async function init() {
    console.log('🚀 Инициализация приложения...');

    // Инициализация Telegram WebApp
    if (tg.ready) {
        tg.ready();
        tg.expand();
    }

    // Проверяем авторизацию
    const telegramUser = tg.initDataUnsafe?.user;
    if (telegramUser) {
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
    }

    // Загружаем начальные данные
    await loadHomeData();
    await loadTournaments();
    
    console.log('✅ Приложение готово!');
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

