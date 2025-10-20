// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Проверка, что приложение запущено в Telegram
if (!tg) {
    console.warn('⚠️ Telegram WebApp не найден, работаем в режиме браузера');
}

// Конфигурация API
const API_BASE = 'https://poker-club-server-1.onrender.com/api';

// Проверка доступности API
async function checkApiConnection() {
    try {
        console.log('🔍 Проверяю подключение к API...');
        const response = await fetch(`${API_BASE}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ API доступен, статус:', response.status);
            return true;
        } else {
            console.error('❌ API недоступен, статус:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка подключения к API:', error);
        return false;
    }
}

// API объект для взаимодействия с сервером
const API = {
    async getUsers() {
        try {
            console.log('🔍 Запрос к API:', `${API_BASE}/users`);
            const response = await fetch(`${API_BASE}/users`);
            console.log('📡 Ответ сервера:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('✅ Данные получены:', data);
            return data;
        } catch (error) {
            console.error('❌ Ошибка API getUsers:', error);
            throw new Error(`Ошибка подключения к серверу: ${error.message}`);
        }
    },

    async getUserByTelegramId(telegramId) {
        const response = await fetch(`${API_BASE}/users/telegram/${telegramId}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Ошибка загрузки пользователя');
        return await response.json();
    },

    async createUser(userData) {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка создания пользователя');
        }
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

    async getTournaments() {
        const response = await fetch(`${API_BASE}/big-tournaments`);
        if (!response.ok) throw new Error('Ошибка загрузки турниров');
        return await response.json();
    },

    async createTournament(tournamentData) {
        const response = await fetch(`${API_BASE}/big-tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        if (!response.ok) throw new Error('Ошибка создания турнира');
        return await response.json();
    },

    async joinTournament(tournamentId, userId) {
        const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка присоединения к турниру');
        }
        return await response.json();
    },

    async updateTournamentStatus(tournamentId, status) {
        const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Ошибка обновления статуса турнира');
        return await response.json();
    },

    async getStats() {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (!response.ok) throw new Error('Ошибка загрузки статистики');
        return await response.json();
    },

    // ============================================
    // API ДЛЯ ИГР И ТУРНИРОВ V2.0
    // ============================================

    // Большие турниры
    async getBigTournaments() {
        try {
            console.log('🔍 Запрос к API:', `${API_BASE}/big-tournaments`);
            const response = await fetch(`${API_BASE}/big-tournaments`);
            console.log('📡 Ответ сервера:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('✅ Турниры получены:', data);
            return data;
        } catch (error) {
            console.error('❌ Ошибка API getBigTournaments:', error);
            throw new Error(`Ошибка загрузки турниров: ${error.message}`);
        }
    },

    async getActiveTournaments() {
        const response = await fetch(`${API_BASE}/big-tournaments/active`);
        if (!response.ok) throw new Error('Ошибка загрузки активных турниров');
        return await response.json();
    },

    async createBigTournament(tournamentData) {
        const response = await fetch(`${API_BASE}/big-tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        if (!response.ok) throw new Error('Ошибка создания турнира');
        return await response.json();
    },

    // Игры
    async getGames(tournamentId = null) {
        try {
            const url = tournamentId ? `${API_BASE}/games?tournamentId=${tournamentId}` : `${API_BASE}/games`;
            console.log('🔍 Запрос к API:', url);
            const response = await fetch(url);
            console.log('📡 Ответ сервера:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('✅ Игры получены:', data);
            return data;
        } catch (error) {
            console.error('❌ Ошибка API getGames:', error);
            throw new Error(`Ошибка загрузки игр: ${error.message}`);
        }
    },

    async getGame(gameId) {
        const response = await fetch(`${API_BASE}/games/${gameId}`);
        if (!response.ok) throw new Error('Ошибка загрузки игры');
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
        const response = await fetch(`${API_BASE}/games/${gameId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка регистрации на игру');
        }
        return await response.json();
    },

    async cancelGameRegistration(gameId, userId) {
        const response = await fetch(`${API_BASE}/games/${gameId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Ошибка отмены регистрации');
        }
        return await response.json();
    },

    async markGamePayment(gameId, userId, isPaid) {
        const response = await fetch(`${API_BASE}/games/${gameId}/mark-paid`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isPaid })
        });
        if (!response.ok) throw new Error('Ошибка обновления статуса оплаты');
        return await response.json();
    },

    // Результаты игр
    async saveGameResults(gameId, results) {
        const response = await fetch(`${API_BASE}/games/${gameId}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results })
        });
        if (!response.ok) throw new Error('Ошибка сохранения результатов');
        return await response.json();
    },

    async getGameResults(gameId) {
        const response = await fetch(`${API_BASE}/games/${gameId}/results`);
        if (!response.ok) throw new Error('Ошибка загрузки результатов');
        return await response.json();
    },

    // Турнирная таблица
    async getTournamentStandings(tournamentId) {
        const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/standings`);
        if (!response.ok) throw new Error('Ошибка загрузки турнирной таблицы');
        return await response.json();
    },

    async getMyTournamentStanding(tournamentId, userId) {
        const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/my-standing/${userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки моей позиции');
        return await response.json();
    },

    // История игр
    async getUserGameHistory(userId, tournamentId = null) {
        const url = tournamentId ? 
            `${API_BASE}/users/${userId}/game-history?tournamentId=${tournamentId}` : 
            `${API_BASE}/users/${userId}/game-history`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки истории игр');
        return await response.json();
    }
};

// Данные приложения
let appData = {
    user: null,
    currentUser: null,
    isAdmin: false,
    isLoggedIn: false,
    stats: {
        totalWins: 0,
        totalGames: 0,
        currentRank: 1,
        points: 0
    },
    tournaments: [],
    rating: [],
    achievements: [],
    registeredUsers: [],
    tournamentParticipants: {},
    selectedAvatar: null
};

// ID администратора
const ADMIN_TELEGRAM_ID = 609464085;

// Инициализация приложения
async function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
        appData.user = tg.initDataUnsafe.user;
        console.log('👤 Пользователь Telegram:', appData.user);
    } else {
        console.warn('⚠️ Telegram WebApp не найден, работаем в режиме браузера');
    }
    
    await initializeData();
    setupEventListeners();
    await checkAuthentication();
    console.log("✅ Poker Club Mini App инициализирован");
}

// Инициализация данных
async function initializeData() {
    try {
        console.log('🚀 Начинаю инициализацию данных...');
        console.log('🌐 API_BASE:', API_BASE);
        
        // Проверяем подключение к API
        const apiAvailable = await checkApiConnection();
        if (!apiAvailable) {
            console.warn('⚠️ API недоступен, работаем в офлайн режиме');
            showAlert('Сервер временно недоступен. Некоторые функции могут не работать.');
        }
        
        // Инициализируем пустые массивы
        appData.registeredUsers = [];
        appData.tournaments = [];
        
        console.log('✅ Данные инициализированы (загрузка по требованию)');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showAlert(`Ошибка инициализации: ${error.message}`);
    }
}

// Проверка авторизации
async function checkAuthentication() {
    try {
        if (!appData.user) {
            showLoginModal();
            return;
        }

        const telegramId = appData.user.id.toString();
        
        // Проверяем, есть ли пользователь на сервере
        const user = await API.getUserByTelegramId(telegramId);
        
        if (user) {
            appData.currentUser = user;
            appData.isLoggedIn = true;
            appData.isAdmin = parseInt(telegramId) === ADMIN_TELEGRAM_ID;
            loadAllData();
            updateUserInterface();
        } else {
            showLoginModal();
        }
    } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        showLoginModal();
    }
}

// Показать модальное окно входа
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    const adminBtn = document.getElementById('adminLoginBtn');
    
    if (appData.user && appData.user.id === ADMIN_TELEGRAM_ID) {
        adminBtn.style.display = 'block';
    } else {
        adminBtn.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Вход как пользователь
async function loginAsUser() {
    closeModal('loginModal');
    
    try {
        const user = await API.getUserByTelegramId(appData.user.id);
        
        if (user) {
            appData.currentUser = user;
            appData.isLoggedIn = true;
            appData.isAdmin = false;
            updateUserInterface();
            loadAllData();
        } else {
            showRegistrationModal();
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showAlert('Ошибка входа в систему');
    }
}

// Вход как администратор
async function loginAsAdmin() {
    closeModal('loginModal');
    
    try {
        const user = await API.getUserByTelegramId(appData.user.id);
        
        if (user) {
            appData.currentUser = user;
            appData.isLoggedIn = true;
            appData.isAdmin = true;
            updateUserInterface();
            loadAllData();
        } else {
            // Создаём админа автоматически
            const adminUser = {
                telegramId: appData.user.id,
                telegramName: appData.user.first_name,
                telegramUsername: appData.user.username || null,
                gameNickname: 'Администратор',
                preferredGame: 'mixed',
                avatar: '👑',
                telegramAvatarUrl: null
            };
            
            const newUser = await API.createUser(adminUser);
            appData.currentUser = newUser;
            appData.isLoggedIn = true;
            appData.isAdmin = true;
            
            await initializeData();
            updateUserInterface();
            loadAllData();
        }
    } catch (error) {
        console.error('Ошибка входа админа:', error);
        showAlert('Ошибка входа в систему');
    }
}

// Показать модальное окно регистрации
function showRegistrationModal() {
    closeModal('loginModal');
    document.getElementById('registrationModal').style.display = 'block';
}

// Регистрация пользователя
async function registerUser() {
    const nickname = document.getElementById('gameNickname').value.trim();
    const preferredGame = document.getElementById('preferredGame').value;
    
    if (!nickname) {
        showAlert('Введите игровой никнейм!');
        return;
    }
    
    try {
        const userData = {
            telegramId: appData.user.id,
            telegramName: appData.user.first_name,
            telegramUsername: appData.user.username || null,
            gameNickname: nickname,
            preferredGame: preferredGame,
            avatar: '👤',
            telegramAvatarUrl: appData.user.photo_url || null
        };
        
        const newUser = await API.createUser(userData);
        
        appData.currentUser = newUser;
        appData.isLoggedIn = true;
        appData.isAdmin = false;
        
        await initializeData();
        
        closeModal('registrationModal');
        updateUserInterface();
        loadAllData();
        showAlert(`Добро пожаловать в Poker Club, ${nickname}! 🎉`);
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showAlert(error.message || 'Ошибка регистрации');
    }
}

// Загрузка всех данных
async function loadAllData() {
    await initializeData(); // Перезагружаем с сервера
    loadUserData();
    loadTournaments();
    loadRating();
    loadAchievements();
    loadRegisteredUsers();
}

// Загрузка данных пользователя
function loadUserData() {
    if (appData.currentUser) {
        document.getElementById('userName').textContent = appData.currentUser.gameNickname;
        document.getElementById('userRank').textContent = getRankName(appData.currentUser.stats?.currentRank || 1);
        document.getElementById('profileName').textContent = appData.currentUser.gameNickname;
        document.getElementById('profileRank').textContent = `Ранг: ${getRankName(appData.currentUser.stats?.currentRank || 1)}`;
        document.getElementById('userNickname').textContent = appData.currentUser.gameNickname;
        document.getElementById('profileNickname').style.display = 'block';
        
        // Обновляем аватарку
        const profileAvatarEl = document.getElementById('profileAvatar');
        const userAvatarEl = document.getElementById('userAvatar');
        
        if (appData.currentUser.avatar === 'custom' && (appData.currentUser.customAvatarUrl || appData.currentUser.telegramAvatarUrl)) {
            const avatarUrl = appData.currentUser.customAvatarUrl || appData.currentUser.telegramAvatarUrl;
            profileAvatarEl.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            userAvatarEl.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            const avatar = appData.currentUser.avatar || '👤';
            profileAvatarEl.textContent = avatar;
            userAvatarEl.textContent = avatar;
        }
        
        // Обновляем статистику
        const stats = appData.currentUser.stats || {};
        document.getElementById('totalWins').textContent = stats.totalWins || 0;
        document.getElementById('totalGames').textContent = stats.totalGames || 0;
        document.getElementById('currentRank').textContent = stats.currentRank || 1;
        document.getElementById('profileGames').textContent = stats.totalGames || 0;
        document.getElementById('profileWins').textContent = stats.totalWins || 0;
        document.getElementById('profilePoints').textContent = stats.points || 0;
        
        const winRate = stats.totalGames > 0 
            ? Math.round((stats.totalWins / stats.totalGames) * 100)
            : 0;
        document.getElementById('profileWinRate').textContent = `${winRate}%`;
    }
}

// Загрузка турниров
async function loadTournaments() {
    try {
        console.log('🏆 Загружаю турниры с сервера...');
        appData.tournaments = await API.getBigTournaments();
        console.log('✅ Турниры загружены:', appData.tournaments.length);
        
        updateTournamentStatuses();
        renderTournaments();
    } catch (error) {
        console.error('❌ Ошибка загрузки турниров:', error);
        showAlert(`Ошибка загрузки турниров: ${error.message}`);
    }
}

// Обновление статусов турниров
function updateTournamentStatuses() {
    const now = new Date();
    
    appData.tournaments.forEach(tournament => {
        const tournamentDate = new Date(tournament.date);
        
        if (tournament.status === 'upcoming' && now >= tournamentDate) {
            tournament.status = 'active';
        }
    });
}

// Загрузка рейтинга
function loadRating() {
    // Сортируем пользователей по очкам
    const sortedUsers = [...appData.registeredUsers].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));
    appData.rating = sortedUsers.slice(0, 10).map((user, index) => ({
        rank: index + 1,
        name: user.gameNickname,
        points: user.stats?.points || 0,
        avatar: index === 0 ? "👑" : index === 1 ? "🥇" : index === 2 ? "🥈" : "⭐"
    }));
    renderRating();
}

// Загрузка достижений
function loadAchievements() {
    const stats = appData.currentUser?.stats || {};
    const totalGames = stats.totalGames || 0;
    const totalWins = stats.totalWins || 0;
    const points = stats.points || 0;
    
    appData.achievements = [
        // Достижения за победы
        { id: 1, name: "Первая победа", desc: "Выиграть первую игру", icon: "🏆", unlocked: totalWins >= 1 },
        { id: 2, name: "Победитель", desc: "Выиграть 5 игр", icon: "🥇", unlocked: totalWins >= 5 },
        { id: 3, name: "Стратег", desc: "Выиграть 10 игр", icon: "🧠", unlocked: totalWins >= 10 },
        { id: 4, name: "Мастер игры", desc: "Выиграть 25 игр", icon: "⭐", unlocked: totalWins >= 25 },
        { id: 5, name: "Легенда покера", desc: "Выиграть 50 игр", icon: "👑", unlocked: totalWins >= 50 },
        
        // Достижения за активность
        { id: 6, name: "Новичок", desc: "Сыграть первую игру", icon: "🎯", unlocked: totalGames >= 1 },
        { id: 7, name: "Любитель", desc: "Сыграть 10 игр", icon: "🎮", unlocked: totalGames >= 10 },
        { id: 8, name: "Настойчивый", desc: "Сыграть 25 игр", icon: "💪", unlocked: totalGames >= 25 },
        { id: 9, name: "Профессионал", desc: "Сыграть 50 игр", icon: "🎪", unlocked: totalGames >= 50 },
        { id: 10, name: "Ветеран", desc: "Сыграть 100 игр", icon: "🎖️", unlocked: totalGames >= 100 },
        
        // Достижения за очки
        { id: 11, name: "Первые очки", desc: "Набрать 100 очков", icon: "💎", unlocked: points >= 100 },
        { id: 12, name: "Богач", desc: "Набрать 500 очков", icon: "💰", unlocked: points >= 500 },
        { id: 13, name: "Миллионер", desc: "Набрать 1000 очков", icon: "💵", unlocked: points >= 1000 },
        { id: 14, name: "Магнат", desc: "Набрать 5000 очков", icon: "🏰", unlocked: points >= 5000 },
        
        // Специальные достижения
        { id: 15, name: "Социальный", desc: "Присоединиться к 5 турнирам", icon: "🤝", unlocked: false },
        { id: 16, name: "Быстрый старт", desc: "Выиграть первую игру за 1 час после регистрации", icon: "⚡", unlocked: false },
        { id: 17, name: "Удача новичка", desc: "Выиграть первые 3 игры подряд", icon: "🍀", unlocked: false },
        { id: 18, name: "Непобедимый", desc: "Выиграть 10 игр подряд", icon: "🔥", unlocked: false },
        { id: 19, name: "Король турниров", desc: "Занять 1 место в 3 турнирах", icon: "🎭", unlocked: false },
        { id: 20, name: "Мастер блефа", desc: "Выиграть игру с минимальной рукой", icon: "🃏", unlocked: false }
    ];
    renderAchievements();
}

// Загрузка зарегистрированных пользователей
async function loadRegisteredUsers() {
    if (appData.isAdmin) {
        try {
            // Загружаем пользователей
            appData.registeredUsers = await API.getUsers();
            
            // Загружаем статистику
            const stats = await API.getStats();
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalTournaments').textContent = stats.totalTournaments || 0;
            document.getElementById('activeGames').textContent = stats.activeGames || 0;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
}

// Обновление интерфейса
function updateUserInterface() {
    // Показываем/скрываем админ-функции
    const addTournamentBtn = document.getElementById('addTournamentBtn');
    if (addTournamentBtn) {
        addTournamentBtn.style.display = appData.isAdmin ? 'block' : 'none';
    }
    
    // Обновляем навигацию
    updateNavigation();
}

// Обновление навигации
function updateNavigation() {
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (appData.isAdmin && !document.querySelector('[data-tab="admin"]')) {
        // Добавляем админ-таб
        const adminTab = document.createElement('button');
        adminTab.className = 'nav-item';
        adminTab.setAttribute('data-tab', 'admin');
        adminTab.innerHTML = '<i class="fas fa-crown"></i><span>Админ</span>';
        adminTab.addEventListener('click', function() {
            switchTab('admin');
        });
        bottomNav.appendChild(adminTab);
    }
}

// Отображение турниров
function renderTournaments(tournaments = appData.tournaments) {
    const container = document.getElementById('tournamentsList');
    if (!container) return;
    
    if (tournaments.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">Турниров пока нет</p>';
        return;
    }
    
    container.innerHTML = tournaments.map(tournament => {
        const participantsCount = tournament.participants ? tournament.participants.length : 0;
        const isParticipant = tournament.participants && tournament.participants.some(p => p.id === appData.currentUser?.id);
        
        return `
            <div class="tournament-card">
                <div class="tournament-header">
                    <h3>${tournament.name}</h3>
                    <span class="tournament-status ${tournament.status}">
                        ${getStatusText(tournament.status)}
                    </span>
                </div>
                <div class="tournament-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatDate(tournament.date)}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${participantsCount}/${tournament.max_players} игроков</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        <span>Приз: ${tournament.prize} очков</span>
                    </div>
                </div>
                <div class="tournament-actions">
                    <button class="btn-participants" onclick="showTournamentParticipants(${tournament.id})">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="btn-join" onclick="joinTournament(${tournament.id})" ${isParticipant ? 'disabled' : ''}>
                        ${isParticipant ? 'Участвую' : getJoinButtonText(tournament.status)}
                    </button>
                </div>
                ${appData.isAdmin && tournament.status === 'active' ? `
                <div class="tournament-management">
                    <button class="btn-finish" onclick="finishTournament(${tournament.id})">
                        <i class="fas fa-stop"></i>
                        Завершить турнир
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Отображение рейтинга
function renderRating() {
    const container = document.getElementById('ratingList');
    if (!container) return;
    
    if (appData.rating.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">Рейтинг пуст</p>';
        return;
    }
    
    container.innerHTML = appData.rating.map(player => `
        <div class="rating-item" onclick="showUserProfile('${player.name}')">
            <div class="rank">${player.rank}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-stats">${player.points} очков</div>
            </div>
            <div class="player-avatar">${player.avatar}</div>
        </div>
    `).join('');
}

// Отображение достижений
function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    if (!appData.achievements || appData.achievements.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #7f8c8d;">Достижения загружаются...</p>';
        return;
    }
    
    container.innerHTML = appData.achievements.map(achievement => `
        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        </div>
    `).join('');
}

// Присоединение к турниру
async function joinTournament(tournamentId) {
    try {
        if (!appData.currentUser) {
            showAlert('Необходимо войти в систему');
            return;
        }
        
        await API.joinTournament(tournamentId, appData.currentUser.id);
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        
        renderTournaments();
        
        const tournament = appData.tournaments.find(t => t.id === tournamentId);
        showAlert(`Вы присоединились к турниру "${tournament.name}"!`);
        
        // Добавляем активность
        addActivity('🎯', `Вы зарегистрировались на турнир "${tournament.name}"`);
        
        vibrate();
    } catch (error) {
        console.error('Ошибка присоединения к турниру:', error);
        showAlert(error.message || 'Ошибка присоединения к турниру');
    }
}

// Показать участников турнира
async function showTournamentParticipants(tournamentId) {
    // Перезагружаем турниры с сервера
    await initializeData();
    
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const participants = tournament.participants || [];
    const container = document.getElementById('participantsList');
    
    if (participants.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #7f8c8d;">Участников пока нет</p>';
    } else {
        container.innerHTML = participants.map((participant, index) => {
            const avatar = participant.avatar || participant.nickname.charAt(0).toUpperCase();
            return `
                <div class="participant-item" onclick="showUserProfile('${participant.nickname}')">
                    <div class="user-avatar-small">${avatar}</div>
                    <div class="user-info-small">
                        <div class="user-name-small">${participant.nickname}</div>
                        <div class="user-stats-small">Участник с ${formatDate(participant.joinDate)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('participantsModal').style.display = 'block';
}

// Показать профиль пользователя
function showUserProfile(nickname) {
    const user = appData.registeredUsers.find(u => u.gameNickname === nickname);
    if (!user) return;
    
    const container = document.getElementById('userProfileDetails');
    const stats = user.stats || {};
    const winRate = stats.totalGames > 0 
        ? Math.round((stats.totalWins / stats.totalGames) * 100)
        : 0;
    
    const avatar = user.avatar || user.gameNickname.charAt(0).toUpperCase();
    
    container.innerHTML = `
        <div class="user-profile-header">
            <div class="user-avatar-large">${avatar}</div>
            <div class="user-info-large">
                <h3>${user.gameNickname}</h3>
                <p>Ранг: ${getRankName(stats.currentRank || 1)}</p>
            </div>
        </div>
        <div class="user-stats-details">
            <div class="stat-row">
                <span>Игр сыграно:</span>
                <span>${stats.totalGames || 0}</span>
            </div>
            <div class="stat-row">
                <span>Побед:</span>
                <span>${stats.totalWins || 0}</span>
            </div>
            <div class="stat-row">
                <span>Процент побед:</span>
                <span>${winRate}%</span>
            </div>
            <div class="stat-row">
                <span>Очков:</span>
                <span>${stats.points || 0}</span>
            </div>
            <div class="stat-row">
                <span>Предпочитаемая игра:</span>
                <span>${getGameTypeName(user.preferredGame)}</span>
            </div>
            ${appData.isAdmin ? `
            <div class="user-details">
                <div class="user-detail-item">
                    <span class="user-detail-label">Telegram ID:</span>
                    <span class="user-detail-value">${user.telegramId}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Telegram Username:</span>
                    <span class="user-detail-value">@${user.telegramUsername || 'не указан'}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Дата регистрации:</span>
                    <span class="user-detail-value">${formatDate(user.registrationDate)}</span>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('userProfileModal').style.display = 'block';
}

// Админ-функции
function showAddTournamentModal() {
    if (!appData.isAdmin) return;
    document.getElementById('addTournamentModal').style.display = 'block';
}

async function createTournament() {
    if (!appData.isAdmin) return;
    
    const name = document.getElementById('tournamentName').value.trim();
    const description = document.getElementById('tournamentDescription').value.trim();
    const duration = parseInt(document.getElementById('tournamentDuration').value) || 2;
    const maxPlayers = parseInt(document.getElementById('tournamentMaxPlayers').value) || 20;
    const gameType = document.getElementById('tournamentGameType').value;
    
    if (!name) {
        showAlert('Введите название турнира!');
        return;
    }
    
    try {
        const tournamentData = {
            name: name,
            description: description,
            startDate: new Date().toISOString(),
            topPlayersCount: 20
        };
        
        await API.createTournament(tournamentData);
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        
        closeModal('addTournamentModal');
        renderTournaments();
        loadRegisteredUsers();
        showAlert('Турнир создан успешно!');
        
        // Очищаем форму
        document.getElementById('tournamentName').value = '';
        document.getElementById('tournamentDate').value = '';
    } catch (error) {
        console.error('Ошибка создания турнира:', error);
        showAlert(error.message || 'Ошибка создания турнира');
    }
}

async function showUsersList() {
    if (!appData.isAdmin) return;
    
    // Перезагружаем данные с сервера
    await initializeData();
    
    const container = document.getElementById('usersList');
    container.innerHTML = appData.registeredUsers.map(user => {
        const avatar = user.avatar || user.gameNickname.charAt(0).toUpperCase();
        const stats = user.stats || {};
        return `
            <div class="user-item" onclick="showUserProfile('${user.gameNickname}')">
                <div class="user-avatar-small">${avatar}</div>
                <div class="user-info-small">
                    <div class="user-name-small">${user.gameNickname}</div>
                    <div class="user-stats-small">
                        ${stats.points || 0} очков • ${stats.totalGames || 0} игр • 
                        Зарегистрирован ${formatDate(user.registrationDate)}
                    </div>
                    <div class="user-details">
                        <div class="user-detail-item">
                            <span class="user-detail-label">Telegram ID:</span>
                            <span class="user-detail-value">${user.telegramId}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('usersListModal').style.display = 'block';
}

function showTournamentsManagement() {
    if (!appData.isAdmin) return;
    switchTab('tournaments');
}

// Утилиты
function getRankName(rank) {
    const ranks = {
        1: 'Новичок', 2: 'Любитель', 3: 'Игрок', 4: 'Эксперт', 5: 'Мастер', 6: 'Гроссмейстер'
    };
    return ranks[rank] || 'Новичок';
}

function getStatusText(status) {
    const statuses = {
        active: 'Активен', upcoming: 'Предстоящий', finished: 'Завершен'
    };
    return statuses[status] || 'Неизвестно';
}

function getJoinButtonText(status) {
    const texts = {
        active: 'Присоединиться', upcoming: 'Зарегистрироваться', finished: 'Завершен'
    };
    return texts[status] || 'Недоступно';
}

function getGameTypeName(type) {
    const types = {
        texas: 'Техасский Холдем', omaha: 'Омаха', stud: 'Студ', mixed: 'Смешанные игры'
    };
    return types[type] || 'Неизвестно';
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

// Модальные окна
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Переключение табов
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    const navItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (navItem) navItem.classList.add('active');
    vibrate();
    
    // Загружаем данные для активной вкладки
    switch(tabName) {
        case 'home':
            loadUserData();
            break;
        case 'games':
            loadGames();
            break;
        case 'tournaments':
            loadTournaments();
            break;
        case 'rating':
            loadRating();
            break;
        case 'profile':
            loadUserData();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

// Выход
function logout() {
    appData.currentUser = null;
    appData.isLoggedIn = false;
    appData.isAdmin = false;
    showLoginModal();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация по табам
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Фильтры турниров
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTournaments(this.getAttribute('data-filter'));
        });
    });
    
    // Быстрые действия
    document.getElementById('joinTournament')?.addEventListener('click', function() {
        switchTab('tournaments');
        vibrate();
    });
    
    document.getElementById('viewRating')?.addEventListener('click', function() {
        switchTab('rating');
        vibrate();
    });
    
    document.getElementById('viewAchievements')?.addEventListener('click', function() {
        switchTab('profile');
        vibrate();
    });
    
    // Обновление турниров
    document.getElementById('refreshTournaments')?.addEventListener('click', async function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 500);
        await initializeData();
        loadTournaments();
        showAlert('Турниры обновлены!');
    });
}

// Фильтрация турниров
function filterTournaments(filter) {
    const tournaments = appData.tournaments;
    let filtered = tournaments;
    
    if (filter !== 'all') {
        filtered = tournaments.filter(t => t.status === filter);
    }
    
    renderTournaments(filtered);
}

// Функция для показа уведомлений
function showAlert(message) {
    console.log('🚨 Alert:', message);
    if (tg && tg.showAlert) {
        tg.showAlert(message);
    } else {
        // Fallback для браузера
        alert(message);
    }
}

// Функция для вибрации
function vibrate() {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция для изменения темы
function applyTheme() {
    const body = document.body;
    const isDark = (tg && tg.colorScheme === 'dark') || body.classList.contains('force-dark-theme');
    
    if (isDark) {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    // Обновляем иконку переключателя
    updateThemeIcon();
}

// Обновить иконку темы
function updateThemeIcon() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    if (themeText) {
        themeText.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
    }
}

// Переключить тему вручную
function toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.remove('force-dark-theme');
        localStorage.setItem('poker_club_theme', 'light');
    } else {
        body.classList.add('dark-theme');
        body.classList.add('force-dark-theme');
        localStorage.setItem('poker_club_theme', 'dark');
    }
    
    updateThemeIcon();
    
    // Добавляем активность
    const themeName = body.classList.contains('dark-theme') ? 'тёмную' : 'светлую';
    addActivity('🎨', `Вы переключились на ${themeName} тему`);
    
    showAlert(`Тема изменена на ${themeName}`);
}

// Функции для работы с аватарками
function showAvatarModal() {
    appData.selectedAvatar = appData.currentUser?.avatar || '👤';
    document.getElementById('avatarPreview').textContent = appData.selectedAvatar;
    document.getElementById('avatarModal').style.display = 'block';
}

function selectEmojiAvatar(emoji) {
    appData.selectedAvatar = emoji;
    document.getElementById('avatarPreview').textContent = emoji;
    
    // Убираем выделение с других опций
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Выделяем выбранную опцию
    event.target.classList.add('selected');
}

function uploadAvatar() {
    // Создаём скрытый input для выбора файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Проверяем размер файла (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Файл слишком большой! Максимум 5MB');
            return;
        }
        
        // Читаем файл как Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            const avatarUrl = event.target.result;
            
            // Показываем превью
            const preview = document.getElementById('avatarPreview');
            preview.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            
            // Сохраняем для использования
            appData.selectedAvatar = 'custom';
            appData.selectedAvatarUrl = avatarUrl;
            
            showAlert('Фото загружено! Нажмите "Сохранить аватарку"');
        };
        reader.readAsDataURL(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

async function saveAvatar() {
    try {
        if (appData.currentUser) {
            // Проверяем тип аватарки
            if (appData.selectedAvatar === 'custom' && appData.selectedAvatarUrl) {
                // Сохраняем custom фото
                appData.currentUser.avatar = 'custom';
                appData.currentUser.customAvatarUrl = appData.selectedAvatarUrl;
                
                await API.updateUser(appData.currentUser.id, { 
                    avatar: 'custom',
                    telegramAvatarUrl: appData.selectedAvatarUrl // Сохраняем URL в БД
                });
            } else {
                // Сохраняем эмодзи
                appData.currentUser.avatar = appData.selectedAvatar;
                
                await API.updateUser(appData.currentUser.id, { avatar: appData.selectedAvatar });
            }
            
            await initializeData();
            
            closeModal('avatarModal');
            loadUserData();
            
            // Добавляем активность
            addActivity('🖼️', 'Вы обновили свою аватарку');
            
            showAlert('Аватарка сохранена!');
        }
    } catch (error) {
        console.error('Ошибка сохранения аватарки:', error);
        showAlert('Ошибка сохранения аватарки');
    }
}

// Функция завершения турнира
async function finishTournament(tournamentId) {
    if (!appData.isAdmin) return;
    
    try {
        await API.updateTournamentStatus(tournamentId, 'finished');
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        
        renderTournaments();
        
        const tournament = appData.tournaments.find(t => t.id === tournamentId);
        showAlert(`Турнир "${tournament.name}" завершен!`);
    } catch (error) {
        console.error('Ошибка завершения турнира:', error);
        showAlert('Ошибка завершения турнира');
    }
}

// Функция для кликабельной кнопки "Все время" в рейтинге
function switchRatingPeriod(period) {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Перезагружаем рейтинг
    loadRating();
}

// Добавить активность в ленту
function addActivity(icon, text) {
    const activityList = document.getElementById('activityList');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.style.animation = 'slideIn 0.4s ease-out';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    activityItem.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-text">${text}</div>
        <div class="activity-time">${timeString}</div>
    `;
    
    // Добавляем в начало списка
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Ограничиваем количество записей
    while (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
}

// Показать активных игроков
async function showActivePlayers() {
    try {
        const users = await API.getUsers();
        const tournaments = await API.getTournaments();
        
        // Находим всех игроков, участвующих в активных турнирах
        const activeTournaments = tournaments.filter(t => t.status === 'active');
        const activePlayerIds = new Set();
        
        activeTournaments.forEach(tournament => {
            tournament.participants.forEach(participant => {
                activePlayerIds.add(participant.id);
            });
        });
        
        const activePlayers = users.filter(user => activePlayerIds.has(user.id));
        
        // Показываем модальное окно со списком
        const modal = document.getElementById('usersListModal');
        const modalTitle = modal.querySelector('.modal-header h2');
        const usersList = document.getElementById('usersList');
        
        modalTitle.textContent = `Активные игроки (${activePlayers.length})`;
        
        if (activePlayers.length === 0) {
            usersList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
                    <p>Нет активных игроков</p>
                    <p style="font-size: 14px; margin-top: 8px;">Игроки появятся здесь, когда присоединятся к турнирам</p>
                </div>
            `;
        } else {
            usersList.innerHTML = activePlayers.map((user, index) => `
                <div class="user-item" onclick="showUserProfile(${user.id})" style="animation: fadeIn 0.3s ease-out ${index * 0.05}s both;">
                    <div class="user-avatar">${user.avatar || user.telegramAvatarUrl || '👤'}</div>
                    <div class="user-info">
                        <div class="user-name">${user.gameNickname || user.telegramName}</div>
                        <div class="user-stats">${user.stats.points} очков</div>
                    </div>
                    <div class="user-rank-badge">
                        <div class="rank-icon">🎯</div>
                        <div class="rank-text">Активен</div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
    } catch (error) {
        console.error('Ошибка загрузки активных игроков:', error);
        showAlert('Ошибка загрузки активных игроков');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    applyTheme();
});

// Обработчик изменения темы
tg.onEvent('themeChanged', applyTheme);

// Обработчик изменения размера окна
tg.onEvent('viewportChanged', function() {
    console.log('Размер окна изменился');
});

// Экспорт функций для глобального использования
window.joinTournament = joinTournament;
window.switchTab = switchTab;
window.filterTournaments = filterTournaments;
window.showTournamentParticipants = showTournamentParticipants;
window.showUserProfile = showUserProfile;
window.showAddTournamentModal = showAddTournamentModal;
window.createTournament = createTournament;
window.showUsersList = showUsersList;
window.showTournamentsManagement = showTournamentsManagement;
window.closeModal = closeModal;
window.loginAsUser = loginAsUser;
window.loginAsAdmin = loginAsAdmin;
window.registerUser = registerUser;
window.logout = logout;
window.showAvatarModal = showAvatarModal;
window.selectEmojiAvatar = selectEmojiAvatar;
window.uploadAvatar = uploadAvatar;
window.saveAvatar = saveAvatar;
window.finishTournament = finishTournament;
window.switchRatingPeriod = switchRatingPeriod;
window.showActivePlayers = showActivePlayers;
window.addActivity = addActivity;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;

// ============================================
// ФУНКЦИИ ДЛЯ ИГР И ТУРНИРОВ V2.0
// ============================================

// Загрузка игр
async function loadGames() {
    try {
        console.log('🎮 Загружаю игры с сервера...');
        const games = await API.getGames();
        console.log('✅ Игры загружены:', games.length);
        displayGames(games);
        loadMyTournamentStanding();
    } catch (error) {
        console.error('❌ Ошибка загрузки игр:', error);
        showAlert('Ошибка загрузки игр: ' + error.message);
    }
}

// Отображение игр
function displayGames(games) {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎮</div>
                <h3>Нет игр</h3>
                <p>Пока нет запланированных игр</p>
            </div>
        `;
        return;
    }

    gamesList.innerHTML = games.map(game => createGameCard(game)).join('');
}

// Создание карточки игры
function createGameCard(game) {
    const gameDate = new Date(game.date);
    const now = new Date();
    const isUpcoming = gameDate > now;
    const isToday = gameDate.toDateString() === now.toDateString();
    
    const statusText = {
        'upcoming': 'Предстоящая',
        'in_progress': 'Идёт сейчас',
        'finished': 'Завершена'
    }[game.status] || 'Неизвестно';

    const statusClass = game.status;

    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-header">
                <div>
                    <div class="game-title">Игра #${game.game_number}</div>
                    <div class="game-tournament">${game.tournament_name || 'Турнир'}</div>
                </div>
                <div class="game-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="game-info">
                <div class="game-info-item">
                    <div class="game-info-icon">📅</div>
                    <div class="game-info-label">Дата</div>
                    <div class="game-info-value">${formatGameDate(gameDate)}</div>
                </div>
                <div class="game-info-item">
                    <div class="game-info-icon">👥</div>
                    <div class="game-info-label">Участники</div>
                    <div class="game-info-value">${game.registeredCount || 0}/${game.max_players}</div>
                </div>
                <div class="game-info-item">
                    <div class="game-info-icon">💰</div>
                    <div class="game-info-label">Buy-in</div>
                    <div class="game-info-value">${game.buyin_amount || 1500}₽</div>
                </div>
                <div class="game-info-item">
                    <div class="game-info-icon">💳</div>
                    <div class="game-info-label">Оплачено</div>
                    <div class="game-info-value">${game.paidCount || 0}</div>
                </div>
            </div>

            <div class="game-participants">
                <div class="participants-avatars" id="participants-${game.id}">
                    <!-- Аватары участников -->
                </div>
                <div class="participants-count">${game.registeredCount || 0} участников</div>
            </div>

            <div class="game-actions">
                ${createGameActions(game)}
            </div>
        </div>
    `;
}

// Создание действий для игры
function createGameActions(game) {
    const gameDate = new Date(game.date);
    const now = new Date();
    const isUpcoming = gameDate > now;
    const isRegistered = game.participants?.some(p => p.id === appData.currentUser?.id);
    const isAdmin = appData.isAdmin;

    let actions = '';

    if (isUpcoming) {
        if (isRegistered) {
            actions += `
                <button class="game-btn danger" onclick="cancelGameRegistration(${game.id})">
                    <i class="fas fa-times"></i>
                    <span>Отменить запись</span>
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

    if (isAdmin) {
        if (game.status === 'upcoming') {
            actions += `
                <button class="game-btn secondary" onclick="showGameDetails(${game.id})">
                    <i class="fas fa-eye"></i>
                    <span>Детали</span>
                </button>
            `;
        }
        
        if (game.status === 'finished') {
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

// Форматирование даты игры
function formatGameDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const gameDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (gameDate.getTime() === today.getTime()) {
        return `Сегодня ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (gameDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
        return `Завтра ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

// Записаться на игру
async function registerForGame(gameId) {
    try {
        if (!appData.currentUser) {
            showAlert('Необходимо войти в систему');
            return;
        }

        await API.registerForGame(gameId, appData.currentUser.id);
        showAlert('Вы успешно записались на игру!');
        addActivity('🎮', 'Вы записались на игру');
        loadGames();
    } catch (error) {
        console.error('Ошибка записи на игру:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Отменить запись на игру
async function cancelGameRegistration(gameId) {
    try {
        if (!appData.currentUser) {
            showAlert('Необходимо войти в систему');
            return;
        }

        const result = await API.cancelGameRegistration(gameId, appData.currentUser.id);
        
        if (result.penalty) {
            showAlert(`Регистрация отменена. Применён штраф -${result.pointsDeducted} очков за позднюю отмену`);
            addActivity('⚠️', `Отмена записи с штрафом -${result.pointsDeducted} очков`);
        } else {
            showAlert('Регистрация успешно отменена');
            addActivity('✅', 'Отмена записи на игру');
        }
        
        loadGames();
    } catch (error) {
        console.error('Ошибка отмены записи:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Показать детали игры
async function showGameDetails(gameId) {
    try {
        const game = await API.getGame(gameId);
        const modal = document.getElementById('gameDetailsModal');
        const title = document.getElementById('gameDetailsTitle');
        const details = document.getElementById('gameDetails');

        title.textContent = `Игра #${game.game_number}`;
        
        details.innerHTML = `
            <div class="game-details-content">
                <div class="game-detail-item">
                    <strong>Турнир:</strong> ${game.tournament_name || 'Не указан'}
                </div>
                <div class="game-detail-item">
                    <strong>Дата:</strong> ${formatGameDate(new Date(game.date))}
                </div>
                <div class="game-detail-item">
                    <strong>Участники:</strong> ${game.registeredCount || 0}/${game.max_players}
                </div>
                <div class="game-detail-item">
                    <strong>Buy-in:</strong> ${game.buyin_amount || 1500}₽
                </div>
                <div class="game-detail-item">
                    <strong>Оплачено:</strong> ${game.paidCount || 0}
                </div>
                
                ${game.participants && game.participants.length > 0 ? `
                    <div class="participants-section">
                        <h4>Участники:</h4>
                        <div class="participants-list">
                            ${game.participants.map(p => `
                                <div class="participant-item">
                                    <div class="participant-avatar">${p.avatar}</div>
                                    <div class="participant-name">${p.game_nickname}</div>
                                    <div class="participant-status ${p.is_paid ? 'paid' : 'unpaid'}">
                                        ${p.is_paid ? '✅ Оплачено' : '❌ Не оплачено'}
                                    </div>
                                    ${appData.isAdmin ? `
                                        <button class="payment-btn" onclick="togglePayment(${gameId}, ${p.id}, ${!p.is_paid})">
                                            ${p.is_paid ? 'Отменить оплату' : 'Отметить оплату'}
                                        </button>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка загрузки деталей игры:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Переключить статус оплаты
async function togglePayment(gameId, userId, isPaid) {
    try {
        await API.markGamePayment(gameId, userId, isPaid);
        showAlert(`Статус оплаты обновлён`);
        showGameDetails(gameId); // Обновляем детали
    } catch (error) {
        console.error('Ошибка обновления оплаты:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Показать результаты игры
async function showGameResults(gameId) {
    try {
        const results = await API.getGameResults(gameId);
        const modal = document.getElementById('gameResultsModal');
        const form = document.getElementById('resultsForm');

        form.innerHTML = `
            <h3>Результаты игры</h3>
            <div class="results-list">
                ${results.map((result, index) => `
                    <div class="result-item">
                        <div class="result-avatar">${result.avatar}</div>
                        <div class="result-name">${result.game_nickname}</div>
                        <div class="result-place">
                            <span>Место:</span>
                            <input type="number" value="${result.place}" min="1" max="30" 
                                   onchange="updateResultPoints(${result.id}, this.value)">
                        </div>
                        <div class="result-points">${result.points_earned} очков</div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Обновить очки при изменении места
function updateResultPoints(resultId, place) {
    const points = calculatePoints(parseInt(place));
    const resultItem = event.target.closest('.result-item');
    const pointsElement = resultItem.querySelector('.result-points');
    pointsElement.textContent = `${points} очков`;
}

// Расчёт очков по месту
function calculatePoints(place) {
    const pointsSystem = {
        1: 300, 2: 240, 3: 195, 4: 150, 5: 150,
        6: 90, 7: 90, 8: 90, 9: 90, 10: 90
    };
    return pointsSystem[place] || 30;
}

// Загрузить мою позицию в турнире
async function loadMyTournamentStanding() {
    try {
        if (!appData.currentUser) return;

        const tournaments = await API.getActiveTournaments();
        if (tournaments.length === 0) return;

        const tournament = tournaments[0]; // Берём первый активный турнир
        const standing = await API.getMyTournamentStanding(tournament.id, appData.currentUser.id);
        
        const container = document.getElementById('myTournamentStanding');
        if (!container) return;

        document.getElementById('myPosition').textContent = standing.position || '-';
        document.getElementById('myPoints').textContent = standing.totalPoints || 0;
        document.getElementById('myGames').textContent = standing.gamesPlayed || 0;
        
        const statusElement = document.getElementById('myStatus');
        if (standing.inGrandFinal) {
            statusElement.innerHTML = '<span class="status-badge">✅ В финале</span>';
        } else {
            const pointsToTop20 = standing.pointsToTop20 || 0;
            statusElement.innerHTML = `<span class="status-badge">❌ Нужно ${pointsToTop20} очков до топ-20</span>`;
        }

        container.style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки позиции:', error);
    }
}

// Показать турнирную таблицу
async function showTournamentStandings(tournamentId) {
    try {
        const standings = await API.getTournamentStandings(tournamentId);
        const modal = document.getElementById('tournamentStandingsModal');
        const title = document.getElementById('standingsTitle');
        const list = document.getElementById('standingsList');

        title.textContent = 'Турнирная таблица';
        
        list.innerHTML = standings.map((standing, index) => `
            <div class="standings-item ${index < 3 ? 'top3' : index < 20 ? 'top20' : ''}">
                <div class="standings-rank">${standing.position}</div>
                <div class="standings-player">
                    <div class="standings-avatar">${standing.avatar}</div>
                    <div class="standings-name">${standing.game_nickname}</div>
                </div>
                <div class="standings-stats">
                    <div class="standings-points">${standing.total_points} очков</div>
                    <div class="standings-games">${standing.games_played} игр</div>
                </div>
            </div>
        `).join('');

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка загрузки таблицы:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Создать игру (админ)
async function showAddGameModal() {
    try {
        const tournaments = await API.getActiveTournaments();
        const select = document.getElementById('gameTournament');
        
        select.innerHTML = tournaments.map(t => 
            `<option value="${t.id}">${t.name}</option>`
        ).join('');

        const modal = document.getElementById('addGameModal');
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Создать игру
async function createGame() {
    try {
        const tournamentId = document.getElementById('gameTournament').value;
        const gameNumber = document.getElementById('gameNumber').value;
        const date = document.getElementById('gameDate').value;
        const maxPlayers = document.getElementById('gameMaxPlayers').value;
        const buyin = document.getElementById('gameBuyin').value;

        if (!tournamentId || !gameNumber || !date) {
            showAlert('Заполните все обязательные поля');
            return;
        }

        await API.createGame({
            tournamentId: parseInt(tournamentId),
            gameNumber: parseInt(gameNumber),
            date: new Date(date).toISOString(),
            maxPlayers: parseInt(maxPlayers),
            buyinAmount: parseInt(buyin)
        });

        showAlert('Игра создана успешно!');
        closeModal('addGameModal');
        loadGames();
    } catch (error) {
        console.error('Ошибка создания игры:', error);
        showAlert('Ошибка: ' + error.message);
    }
}

// Экспорт функций для использования в других скриптах
window.TelegramApp = {
    showAlert,
    vibrate,
    tg,
    appData
};

// Экспорт новых функций для игр
window.registerForGame = registerForGame;
window.cancelGameRegistration = cancelGameRegistration;
window.showGameDetails = showGameDetails;
window.togglePayment = togglePayment;
window.showGameResults = showGameResults;
window.showTournamentStandings = showTournamentStandings;
window.showAddGameModal = showAddGameModal;
window.createGame = createGame;
window.loadGames = loadGames;