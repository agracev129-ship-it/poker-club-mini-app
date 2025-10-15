// Конфигурация API
const API_BASE = 'http://localhost:3000/api';

// API объект для взаимодействия с сервером
const API = {
    // Получить всех пользователей
    async getUsers() {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        return await response.json();
    },

    // Получить пользователя по Telegram ID
    async getUserByTelegramId(telegramId) {
        const response = await fetch(`${API_BASE}/users/telegram/${telegramId}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Ошибка загрузки пользователя');
        return await response.json();
    },

    // Создать пользователя
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

    // Обновить пользователя
    async updateUser(userId, userData) {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Ошибка обновления пользователя');
        return await response.json();
    },

    // Получить все турниры
    async getTournaments() {
        const response = await fetch(`${API_BASE}/tournaments`);
        if (!response.ok) throw new Error('Ошибка загрузки турниров');
        return await response.json();
    },

    // Создать турнир
    async createTournament(tournamentData) {
        const response = await fetch(`${API_BASE}/tournaments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        if (!response.ok) throw new Error('Ошибка создания турнира');
        return await response.json();
    },

    // Присоединиться к турниру
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

    // Обновить статус турнира
    async updateTournamentStatus(tournamentId, status) {
        const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Ошибка обновления статуса турнира');
        return await response.json();
    },

    // Получить статистику
    async getStats() {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (!response.ok) throw new Error('Ошибка загрузки статистики');
        return await response.json();
    }
};

// Глобальные переменные
let appData = {
    registeredUsers: [],
    tournaments: [],
    currentUser: null,
    isAdmin: false
};

// ID администратора (замени на свой Telegram ID)
const ADMIN_TELEGRAM_ID = "609464085";

// Утилиты для работы с localStorage
const Storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
        }
    },

    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
            return defaultValue;
        }
    }
};

// Инициализация приложения
async function initApp() {
    try {
        // Инициализируем Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }

        // Загружаем данные
        await initializeData();
        
        // Проверяем аутентификацию
        await checkAuthentication();
        
        // Загружаем интерфейс
        loadUserData();
        loadTournaments();
        loadRating();
        
        console.log('Приложение инициализировано');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showError('Ошибка загрузки приложения');
    }
}

// Инициализация данных
async function initializeData() {
    try {
        // Загружаем пользователей с сервера
        appData.registeredUsers = await API.getUsers();
        
        // Загружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        
        // Сохраняем в localStorage для офлайн доступа
        Storage.save('registeredUsers', appData.registeredUsers);
        Storage.save('tournaments', appData.tournaments);
        
        console.log('Данные загружены с сервера');
    } catch (error) {
        console.error('Ошибка загрузки данных с сервера:', error);
        
        // Fallback на localStorage
        appData.registeredUsers = Storage.load('registeredUsers', []);
        appData.tournaments = Storage.load('tournaments', []);
        
        console.log('Используем данные из localStorage');
    }
}

// Проверка аутентификации
async function checkAuthentication() {
    try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (!telegramUser) {
            showLoginModal();
            return;
        }

        const telegramId = telegramUser.id.toString();
        
        // Проверяем, есть ли пользователь на сервере
        const user = await API.getUserByTelegramId(telegramId);
        
        if (user) {
            // Пользователь найден
            appData.currentUser = user;
            appData.isAdmin = telegramId === ADMIN_TELEGRAM_ID;
            
            // Обновляем данные пользователя из Telegram
            if (telegramUser.first_name || telegramUser.last_name) {
                const telegramName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim();
                if (telegramName !== user.telegramName) {
                    await API.updateUser(user.id, { telegramName });
                    user.telegramName = telegramName;
                }
            }
            
            if (telegramUser.username && telegramUser.username !== user.telegramUsername) {
                await API.updateUser(user.id, { telegramUsername: telegramUser.username });
                user.telegramUsername = telegramUser.username;
            }
            
            Storage.save('currentUser', appData.currentUser);
            Storage.save('isAdmin', appData.isAdmin);
        } else {
            // Пользователь не найден - показываем регистрацию
            showRegistrationModal();
        }
    } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        showLoginModal();
    }
}

// Показать модальное окно входа
function showLoginModal() {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegramId = telegramUser?.id?.toString();
    
    // Показываем кнопку админа только для владельца
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.style.display = telegramId === ADMIN_TELEGRAM_ID ? 'block' : 'none';
    }
    
    showModal('loginModal');
}

// Показать модальное окно регистрации
function showRegistrationModal() {
    // Пытаемся получить данные из Telegram
    requestTelegramData();
    showModal('registrationModal');
}

// Запрос данных из Telegram
function requestTelegramData() {
    try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (telegramUser) {
            // Пытаемся получить аватар из Telegram
            if (telegramUser.photo_url) {
                console.log('Telegram avatar URL:', telegramUser.photo_url);
            }
            
            // Пытаемся запросить доступ к контактам
            if (window.Telegram?.WebApp?.requestContact) {
                // Это можно использовать для получения дополнительных данных
                console.log('Telegram contact request available');
            }
        }
    } catch (error) {
        console.error('Ошибка получения данных Telegram:', error);
    }
}

// Регистрация пользователя
async function registerUser() {
    try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (!telegramUser) {
            showError('Ошибка: данные Telegram недоступны');
            return;
        }

        const gameNickname = document.getElementById('gameNickname').value.trim();
        const preferredGame = document.getElementById('preferredGame').value;
        
        if (!gameNickname) {
            showError('Введите игровой никнейм');
            return;
        }

        const userData = {
            telegramId: telegramUser.id,
            telegramName: `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim(),
            telegramUsername: telegramUser.username || null,
            gameNickname: gameNickname,
            preferredGame: preferredGame,
            avatar: '👤',
            telegramAvatarUrl: telegramUser.photo_url || null
        };

        // Создаем пользователя на сервере
        const newUser = await API.createUser(userData);
        
        appData.currentUser = newUser;
        appData.isAdmin = telegramUser.id.toString() === ADMIN_TELEGRAM_ID;
        
        // Сохраняем в localStorage
        Storage.save('currentUser', appData.currentUser);
        Storage.save('isAdmin', appData.isAdmin);
        
        // Перезагружаем данные с сервера
        await initializeData();
        
        closeModal('registrationModal');
        loadUserData();
        loadTournaments();
        loadRating();
        
        showSuccess('Регистрация успешна!');
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showError(error.message || 'Ошибка регистрации');
    }
}

// Вход как пользователь
async function loginAsUser() {
    try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (!telegramUser) {
            showError('Ошибка: данные Telegram недоступны');
            return;
        }

        const telegramId = telegramUser.id.toString();
        const user = await API.getUserByTelegramId(telegramId);
        
        if (user) {
            appData.currentUser = user;
            appData.isAdmin = telegramId === ADMIN_TELEGRAM_ID;
            
            Storage.save('currentUser', appData.currentUser);
            Storage.save('isAdmin', appData.isAdmin);
            
            closeModal('loginModal');
            loadUserData();
            loadTournaments();
            loadRating();
        } else {
            showRegistrationModal();
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showError('Ошибка входа в систему');
    }
}

// Вход как администратор
async function loginAsAdmin() {
    try {
        const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        if (!telegramUser) {
            showError('Ошибка: данные Telegram недоступны');
            return;
        }

        const telegramId = telegramUser.id.toString();
        
        if (telegramId !== ADMIN_TELEGRAM_ID) {
            showError('Доступ запрещен');
            return;
        }

        const user = await API.getUserByTelegramId(telegramId);
        
        if (user) {
            appData.currentUser = user;
            appData.isAdmin = true;
            
            Storage.save('currentUser', appData.currentUser);
            Storage.save('isAdmin', appData.isAdmin);
            
            closeModal('loginModal');
            loadUserData();
            loadTournaments();
            loadRating();
        } else {
            showRegistrationModal();
        }
    } catch (error) {
        console.error('Ошибка входа админа:', error);
        showError('Ошибка входа в систему');
    }
}

// Загрузка данных пользователя
function loadUserData() {
    if (!appData.currentUser) return;

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileNickname = document.getElementById('profileNickname');
    const profileStats = document.getElementById('profileStats');

    if (userAvatar) {
        if (appData.currentUser.avatar === 'telegram' && appData.currentUser.telegramAvatarUrl) {
            userAvatar.textContent = '📷';
        } else {
            userAvatar.textContent = appData.currentUser.avatar || '👤';
        }
    }

    if (userName) {
        userName.textContent = appData.currentUser.gameNickname || 'Гость';
    }

    if (profileAvatar) {
        if (appData.currentUser.avatar === 'telegram' && appData.currentUser.telegramAvatarUrl) {
            profileAvatar.textContent = '📷';
        } else {
            profileAvatar.textContent = appData.currentUser.avatar || '👤';
        }
    }

    if (profileNickname) {
        profileNickname.textContent = appData.currentUser.gameNickname || 'Гость';
    }

    if (profileStats) {
        const stats = appData.currentUser.stats || {};
        const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;
        profileStats.textContent = `Побед: ${stats.totalWins || 0} | Игр: ${stats.totalGames || 0} | Винрейт: ${winRate}% | Очки: ${stats.points || 0}`;
    }

    // Показываем/скрываем админ панель
    const adminPanel = document.getElementById('adminPanel');
    const addTournamentBtn = document.getElementById('addTournamentBtn');
    
    if (adminPanel) {
        adminPanel.style.display = appData.isAdmin ? 'block' : 'none';
    }
    
    if (addTournamentBtn) {
        addTournamentBtn.style.display = appData.isAdmin ? 'block' : 'none';
    }

    // Загружаем статистику для админа
    if (appData.isAdmin) {
        loadRegisteredUsers();
    }
}

// Загрузка турниров
async function loadTournaments() {
    try {
        // Обновляем статусы турниров
        updateTournamentStatuses();
        
        // Рендерим турниры
        renderTournaments();
    } catch (error) {
        console.error('Ошибка загрузки турниров:', error);
    }
}

// Обновление статусов турниров
function updateTournamentStatuses() {
    const now = new Date();
    
    appData.tournaments.forEach(tournament => {
        const tournamentDate = new Date(tournament.date);
        
        if (tournament.status === 'upcoming' && tournamentDate <= now) {
            tournament.status = 'active';
        }
    });
}

// Рендеринг турниров
function renderTournaments() {
    const tournamentsList = document.getElementById('tournamentsList');
    if (!tournamentsList) return;

    if (appData.tournaments.length === 0) {
        tournamentsList.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color); padding: 20px;">Турниры не найдены</p>';
        return;
    }

    tournamentsList.innerHTML = appData.tournaments.map(tournament => {
        const tournamentDate = new Date(tournament.date);
        const isParticipant = tournament.participants?.some(p => p.id === appData.currentUser?.id);
        const isFull = tournament.participants?.length >= tournament.max_players;
        
        return `
            <div class="tournament-card">
                <div class="tournament-header">
                    <div class="tournament-info">
                        <h3>${tournament.name}</h3>
                        <div class="tournament-date">${tournamentDate.toLocaleString('ru-RU')}</div>
                    </div>
                    <div class="tournament-status ${tournament.status}">${getStatusText(tournament.status)}</div>
                </div>
                
                <div class="tournament-details">
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Участники</div>
                        <div class="tournament-detail-value">${tournament.participants?.length || 0}/${tournament.max_players}</div>
                    </div>
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Приз</div>
                        <div class="tournament-detail-value">${tournament.prize} очков</div>
                    </div>
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Тип</div>
                        <div class="tournament-detail-value">${getGameTypeText(tournament.type)}</div>
                    </div>
                </div>
                
                <div class="tournament-actions">
                    <button class="btn-participants" onclick="showTournamentParticipants(${tournament.id})" title="Участники">
                        👥
                    </button>
                    ${getTournamentButton(tournament, isParticipant, isFull)}
                    ${appData.isAdmin && tournament.status === 'active' ? 
                        `<button class="tournament-btn" onclick="finishTournament(${tournament.id})">Завершить турнир</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Получить текст статуса
function getStatusText(status) {
    const statusTexts = {
        'upcoming': 'Предстоящий',
        'active': 'Активный',
        'finished': 'Завершен'
    };
    return statusTexts[status] || status;
}

// Получить текст типа игры
function getGameTypeText(type) {
    const typeTexts = {
        'texas_holdem': 'Texas Hold\'em',
        'omaha': 'Omaha',
        'seven_card_stud': 'Seven Card Stud',
        'five_card_draw': 'Five Card Draw'
    };
    return typeTexts[type] || type;
}

// Получить кнопку турнира
function getTournamentButton(tournament, isParticipant, isFull) {
    if (tournament.status === 'finished') {
        return '<button class="tournament-btn" disabled>Завершен</button>';
    }
    
    if (isParticipant) {
        return '<button class="tournament-btn" disabled>Участвуете</button>';
    }
    
    if (isFull) {
        return '<button class="tournament-btn" disabled>Заполнен</button>';
    }
    
    if (tournament.status === 'upcoming') {
        return `<button class="tournament-btn primary" onclick="joinTournament(${tournament.id})">Присоединиться</button>`;
    }
    
    return '<button class="tournament-btn" disabled>Недоступно</button>';
}

// Присоединение к турниру
async function joinTournament(tournamentId) {
    try {
        if (!appData.currentUser) {
            showError('Необходимо войти в систему');
            return;
        }

        await API.joinTournament(tournamentId, appData.currentUser.id);
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        Storage.save('tournaments', appData.tournaments);
        
        renderTournaments();
        showSuccess('Вы присоединились к турниру!');
        
    } catch (error) {
        console.error('Ошибка присоединения к турниру:', error);
        showError(error.message || 'Ошибка присоединения к турниру');
    }
}

// Показать участников турнира
function showTournamentParticipants(tournamentId) {
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const participantsList = document.getElementById('participantsList');
    if (!participantsList) return;

    if (!tournament.participants || tournament.participants.length === 0) {
        participantsList.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color); padding: 20px;">Участники не найдены</p>';
    } else {
        participantsList.innerHTML = tournament.participants.map(participant => `
            <div class="participant-item" onclick="showUserProfile('${participant.nickname}')">
                <div class="participant-avatar">
                    ${participant.avatar === 'telegram' && participant.telegramAvatarUrl ? '📷' : (participant.avatar || '👤')}
                </div>
                <div class="participant-info">
                    <div class="participant-nickname">${participant.nickname}</div>
                    <div class="participant-join-date">Присоединился: ${new Date(participant.joinDate).toLocaleString('ru-RU')}</div>
                </div>
            </div>
        `).join('');
    }

    showModal('participantsModal');
}

// Показать профиль пользователя
function showUserProfile(nickname) {
    const user = appData.registeredUsers.find(u => u.gameNickname === nickname);
    if (!user) return;

    const userProfileContent = document.getElementById('userProfileContent');
    if (!userProfileContent) return;

    const stats = user.stats || {};
    const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;
    const rank = getRankName(stats.points || 0);

    userProfileContent.innerHTML = `
        <div class="user-profile-avatar">
            ${user.avatar === 'telegram' && user.telegramAvatarUrl ? '📷' : (user.avatar || '👤')}
        </div>
        <div class="user-profile-info">
            <h4>${user.gameNickname}</h4>
            <p>${user.telegramName || 'Имя не указано'}</p>
            ${user.telegramUsername ? `<p>@${user.telegramUsername}</p>` : ''}
            ${appData.isAdmin ? `<p><strong>Telegram ID:</strong> ${user.telegramId}</p>` : ''}
        </div>
        <div class="user-profile-stats">
            <div class="user-profile-stat">
                <span class="user-profile-stat-value">${stats.totalWins || 0}</span>
                <span class="user-profile-stat-label">Побед</span>
            </div>
            <div class="user-profile-stat">
                <span class="user-profile-stat-value">${stats.totalGames || 0}</span>
                <span class="user-profile-stat-label">Игр</span>
            </div>
            <div class="user-profile-stat">
                <span class="user-profile-stat-value">${winRate}%</span>
                <span class="user-profile-stat-label">Винрейт</span>
            </div>
            <div class="user-profile-stat">
                <span class="user-profile-stat-value">${stats.points || 0}</span>
                <span class="user-profile-stat-label">Очки</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 16px;">
            <strong>Ранг:</strong> ${rank}
        </div>
    `;

    showModal('userProfileModal');
}

// Показать всех пользователей (для админа)
async function showAllUsers() {
    try {
        const allUsersList = document.getElementById('allUsersList');
        if (!allUsersList) return;

        // Сортируем пользователей по очкам
        const sortedUsers = [...appData.registeredUsers].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));

        if (sortedUsers.length === 0) {
            allUsersList.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color); padding: 20px;">Пользователи не найдены</p>';
        } else {
            allUsersList.innerHTML = sortedUsers.map((user, index) => {
                const stats = user.stats || {};
                const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;
                const rank = getRankName(stats.points || 0);

                return `
                    <div class="user-item" onclick="showUserProfile('${user.gameNickname}')">
                        <div class="user-rank-badge">#${index + 1}</div>
                        <div class="user-avatar-small">
                            ${user.avatar === 'telegram' && user.telegramAvatarUrl ? '📷' : (user.avatar || '👤')}
                        </div>
                        <div class="user-info">
                            <div class="user-nickname">${user.gameNickname}</div>
                            <div class="user-stats">${stats.totalWins || 0} побед, ${stats.totalGames || 0} игр (${winRate}%), ${rank}</div>
                            ${appData.isAdmin ? `<div style="font-size: 10px; color: var(--tg-theme-hint-color);">ID: ${user.telegramId}</div>` : ''}
                        </div>
                        <div class="user-points">${stats.points || 0}</div>
                    </div>
                `;
            }).join('');
        }

        showModal('allUsersModal');
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        showError('Ошибка загрузки списка пользователей');
    }
}

// Создание турнира
async function createTournament() {
    try {
        const name = document.getElementById('tournamentName').value.trim();
        const date = document.getElementById('tournamentDate').value;
        const duration = parseInt(document.getElementById('tournamentDuration').value);
        const maxPlayers = parseInt(document.getElementById('tournamentMaxPlayers').value);
        const prize = parseInt(document.getElementById('tournamentPrize').value);
        const type = document.getElementById('tournamentType').value;

        if (!name || !date) {
            showError('Заполните все обязательные поля');
            return;
        }

        const tournamentData = {
            name,
            date,
            duration,
            maxPlayers,
            prize,
            type
        };

        await API.createTournament(tournamentData);
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        Storage.save('tournaments', appData.tournaments);
        
        closeModal('addTournamentModal');
        renderTournaments();
        showSuccess('Турнир создан!');
        
        // Очищаем форму
        document.getElementById('addTournamentForm').reset();
        
    } catch (error) {
        console.error('Ошибка создания турнира:', error);
        showError(error.message || 'Ошибка создания турнира');
    }
}

// Завершение турнира
async function finishTournament(tournamentId) {
    try {
        if (!appData.isAdmin) {
            showError('Доступ запрещен');
            return;
        }

        await API.updateTournamentStatus(tournamentId, 'finished');
        
        // Перезагружаем турниры с сервера
        appData.tournaments = await API.getTournaments();
        Storage.save('tournaments', appData.tournaments);
        
        renderTournaments();
        showSuccess('Турнир завершен!');
        
    } catch (error) {
        console.error('Ошибка завершения турнира:', error);
        showError('Ошибка завершения турнира');
    }
}

// Загрузка рейтинга
function loadRating() {
    const ratingList = document.getElementById('ratingList');
    if (!ratingList) return;

    // Сортируем пользователей по очкам
    const sortedUsers = [...appData.registeredUsers].sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));

    if (sortedUsers.length === 0) {
        ratingList.innerHTML = '<p style="text-align: center; color: var(--tg-theme-hint-color); padding: 20px;">Рейтинг пуст</p>';
        return;
    }

    ratingList.innerHTML = sortedUsers.map((user, index) => {
        const stats = user.stats || {};
        const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

        return `
            <div class="rating-item" onclick="showUserProfile('${user.gameNickname}')">
                <div class="rating-position">${index + 1}</div>
                <div class="rating-avatar">
                    ${user.avatar === 'telegram' && user.telegramAvatarUrl ? '📷' : (user.avatar || '👤')}
                </div>
                <div class="rating-info">
                    <div class="rating-nickname">${user.gameNickname}</div>
                    <div class="rating-stats">${stats.totalWins || 0} побед, ${stats.totalGames || 0} игр (${winRate}%)</div>
                </div>
                <div class="rating-points">${stats.points || 0}</div>
            </div>
        `;
    }).join('');
}

// Переключение периода рейтинга
function switchRatingPeriod(period) {
    // Обновляем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Здесь можно добавить логику фильтрации по периоду
    loadRating();
}

// Получить название ранга
function getRankName(points) {
    if (points >= 10000) return 'Легенда';
    if (points >= 5000) return 'Мастер';
    if (points >= 2000) return 'Эксперт';
    if (points >= 1000) return 'Профессионал';
    if (points >= 500) return 'Продвинутый';
    if (points >= 100) return 'Опытный';
    if (points >= 50) return 'Начинающий';
    return 'Новичок';
}

// Загрузка статистики для админа
async function loadRegisteredUsers() {
    try {
        const stats = await API.getStats();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalTournaments').textContent = stats.totalTournaments || 0;
        document.getElementById('activeGames').textContent = stats.activeGames || 0;
        
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Показать модальное окно
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

// Закрыть модальное окно
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Показать модальное окно добавления турнира
function showAddTournamentModal() {
    if (!appData.isAdmin) {
        showError('Доступ запрещен');
        return;
    }
    showModal('addTournamentModal');
}

// Показать модальное окно выбора аватарки
function showAvatarModal() {
    showModal('avatarModal');
}

// Выбрать эмодзи аватарку
function selectEmojiAvatar(emoji) {
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Сохраняем выбранную аватарку
    window.selectedAvatar = emoji;
}

// Загрузить аватарку
function uploadAvatar() {
    // Здесь можно добавить логику загрузки фото
    showError('Загрузка фото пока не реализована');
}

// Сохранить аватарку
async function saveAvatar() {
    try {
        if (!window.selectedAvatar) {
            showError('Выберите аватарку');
            return;
        }

        if (!appData.currentUser) {
            showError('Необходимо войти в систему');
            return;
        }

        await API.updateUser(appData.currentUser.id, { avatar: window.selectedAvatar });
        
        appData.currentUser.avatar = window.selectedAvatar;
        Storage.save('currentUser', appData.currentUser);
        
        closeModal('avatarModal');
        loadUserData();
        showSuccess('Аватарка обновлена!');
        
    } catch (error) {
        console.error('Ошибка сохранения аватарки:', error);
        showError('Ошибка сохранения аватарки');
    }
}

// Показать модальное окно редактирования профиля
function showEditProfileModal() {
    if (!appData.currentUser) return;
    
    document.getElementById('editGameNickname').value = appData.currentUser.gameNickname || '';
    document.getElementById('editPreferredGame').value = appData.currentUser.preferredGame || 'texas_holdem';
    
    showModal('editProfileModal');
}

// Редактирование профиля
async function editProfile() {
    try {
        const gameNickname = document.getElementById('editGameNickname').value.trim();
        const preferredGame = document.getElementById('editPreferredGame').value;

        if (!gameNickname) {
            showError('Введите игровой никнейм');
            return;
        }

        if (!appData.currentUser) {
            showError('Необходимо войти в систему');
            return;
        }

        await API.updateUser(appData.currentUser.id, { 
            gameNickname, 
            preferredGame 
        });
        
        appData.currentUser.gameNickname = gameNickname;
        appData.currentUser.preferredGame = preferredGame;
        Storage.save('currentUser', appData.currentUser);
        
        closeModal('editProfileModal');
        loadUserData();
        showSuccess('Профиль обновлен!');
        
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        showError(error.message || 'Ошибка обновления профиля');
    }
}

// Показать профиль пользователя (клик по аватару)
function showUserProfile() {
    if (!appData.currentUser) {
        showLoginModal();
        return;
    }
    
    showUserProfile(appData.currentUser.gameNickname);
}

// Переключение вкладок
function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс с кнопок навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Активируем соответствующую кнопку навигации
    const selectedBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Загружаем данные для вкладки
    if (tabName === 'tournaments') {
        loadTournaments();
    } else if (tabName === 'rating') {
        loadRating();
    } else if (tabName === 'profile') {
        loadUserData();
    }
}

// Показать ошибку
function showError(message) {
    if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

// Показать успех
function showSuccess(message) {
    if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

// Обработчики форм
document.addEventListener('DOMContentLoaded', function() {
    // Форма регистрации
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });
    }

    // Форма создания турнира
    const addTournamentForm = document.getElementById('addTournamentForm');
    if (addTournamentForm) {
        addTournamentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createTournament();
        });
    }

    // Форма редактирования профиля
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            editProfile();
        });
    }

    // Закрытие модальных окон по клику вне их
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
});

// Устаревшие функции (для совместимости)
function forceDataSync() {
    showSuccess('Данные синхронизированы с сервером!');
}

function createDemoData() {
    showError('Демо-данные создаются автоматически на сервере');
}

function showUsersList() {
    showAllUsers();
}

// Экспорт функций для глобального доступа
window.showTab = showTab;
window.showModal = showModal;
window.closeModal = closeModal;
window.showAddTournamentModal = showAddTournamentModal;
window.showTournamentParticipants = showTournamentParticipants;
window.joinTournament = joinTournament;
window.finishTournament = finishTournament;
window.showUserProfile = showUserProfile;
window.showAllUsers = showAllUsers;
window.showAvatarModal = showAvatarModal;
window.selectEmojiAvatar = selectEmojiAvatar;
window.uploadAvatar = uploadAvatar;
window.saveAvatar = saveAvatar;
window.showEditProfileModal = showEditProfileModal;
window.switchRatingPeriod = switchRatingPeriod;
window.loginAsUser = loginAsUser;
window.loginAsAdmin = loginAsAdmin;
window.registerUser = registerUser;
window.createTournament = createTournament;
window.editProfile = editProfile;
window.forceDataSync = forceDataSync;
window.createDemoData = createDemoData;
window.showUsersList = showUsersList;

// Инициализация приложения
initApp();