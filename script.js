// Глобальные переменные
let appData = {
    registeredUsers: [],
    tournaments: [],
    currentUser: null,
    isAdmin: false
};

// ID администратора
const ADMIN_TELEGRAM_ID = "609464085";

// Telegram Cloud Storage для синхронизации данных
const TelegramStorage = {
    // Сохранить данные в Telegram Cloud Storage
    async save(key, data) {
        try {
            const dataStr = JSON.stringify(data);
            if (window.Telegram?.WebApp?.CloudStorage) {
                await new Promise((resolve, reject) => {
                    window.Telegram.WebApp.CloudStorage.setItem(key, dataStr, (error, success) => {
                        if (error) reject(error);
                        else resolve(success);
                    });
                });
                console.log(`Saved to Telegram Cloud: ${key}`);
            }
        } catch (error) {
            console.error('Error saving to Telegram Cloud:', error);
        }
    },

    // Загрузить данные из Telegram Cloud Storage
    async load(key, defaultValue = null) {
        try {
            if (window.Telegram?.WebApp?.CloudStorage) {
                return await new Promise((resolve) => {
                    window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                        if (error || !value) {
                            resolve(defaultValue);
                        } else {
                            try {
                                resolve(JSON.parse(value));
                            } catch (e) {
                                resolve(defaultValue);
                            }
                        }
                    });
                });
            }
            return defaultValue;
        } catch (error) {
            console.error('Error loading from Telegram Cloud:', error);
            return defaultValue;
        }
    },

    // Получить все ключи
    async getKeys() {
        try {
            if (window.Telegram?.WebApp?.CloudStorage) {
                return await new Promise((resolve) => {
                    window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
                        if (error) resolve([]);
                        else resolve(keys || []);
                    });
                });
            }
            return [];
        } catch (error) {
            console.error('Error getting keys:', error);
            return [];
        }
    }
};

// Утилита для работы с общими данными
const SharedData = {
    // Загрузить всех пользователей
    async loadUsers() {
        const keys = await TelegramStorage.getKeys();
        const userKeys = keys.filter(k => k.startsWith('user_'));
        const users = [];
        
        for (const key of userKeys) {
            const user = await TelegramStorage.load(key);
            if (user) users.push(user);
        }
        
        return users;
    },

    // Сохранить пользователя
    async saveUser(user) {
        await TelegramStorage.save(`user_${user.telegramId}`, user);
        console.log('User saved:', user.gameNickname);
    },

    // Получить пользователя по Telegram ID
    async getUserByTelegramId(telegramId) {
        return await TelegramStorage.load(`user_${telegramId}`);
    },

    // Загрузить все турниры
    async loadTournaments() {
        const keys = await TelegramStorage.getKeys();
        const tournamentKeys = keys.filter(k => k.startsWith('tournament_'));
        const tournaments = [];
        
        for (const key of tournamentKeys) {
            const tournament = await TelegramStorage.load(key);
            if (tournament) tournaments.push(tournament);
        }
        
        return tournaments.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // Сохранить турнир
    async saveTournament(tournament) {
        await TelegramStorage.save(`tournament_${tournament.id}`, tournament);
        console.log('Tournament saved:', tournament.name);
    },

    // Получить турнир по ID
    async getTournamentById(tournamentId) {
        return await TelegramStorage.load(`tournament_${tournamentId}`);
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
        // Загружаем пользователей
        appData.registeredUsers = await SharedData.loadUsers();
        
        // Загружаем турниры
        appData.tournaments = await SharedData.loadTournaments();
        
        console.log('Данные загружены:', {
            users: appData.registeredUsers.length,
            tournaments: appData.tournaments.length
        });
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        appData.registeredUsers = [];
        appData.tournaments = [];
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
        
        // Проверяем, есть ли пользователь
        const user = await SharedData.getUserByTelegramId(telegramId);
        
        if (user) {
            // Пользователь найден
            appData.currentUser = user;
            appData.isAdmin = telegramId === ADMIN_TELEGRAM_ID;
            
            // Обновляем данные пользователя из Telegram
            let updated = false;
            const telegramName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim();
            if (telegramName && telegramName !== user.telegramName) {
                user.telegramName = telegramName;
                updated = true;
            }
            
            if (telegramUser.username && telegramUser.username !== user.telegramUsername) {
                user.telegramUsername = telegramUser.username;
                updated = true;
            }
            
            if (updated) {
                await SharedData.saveUser(user);
                appData.currentUser = user;
            }
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
    showModal('registrationModal');
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

        // Проверяем уникальность никнейма
        const existingUser = appData.registeredUsers.find(u => u.gameNickname === gameNickname);
        if (existingUser) {
            showError('Этот никнейм уже занят');
            return;
        }

        const newUser = {
            id: Date.now(),
            telegramId: telegramUser.id,
            telegramName: `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim(),
            telegramUsername: telegramUser.username || null,
            gameNickname: gameNickname,
            preferredGame: preferredGame,
            avatar: '👤',
            telegramAvatarUrl: telegramUser.photo_url || null,
            stats: {
                totalWins: 0,
                totalGames: 0,
                points: 0,
                currentRank: 1
            },
            registrationDate: new Date().toISOString()
        };

        // Сохраняем пользователя
        await SharedData.saveUser(newUser);
        
        appData.currentUser = newUser;
        appData.isAdmin = telegramUser.id.toString() === ADMIN_TELEGRAM_ID;
        
        // Перезагружаем данные
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
        const user = await SharedData.getUserByTelegramId(telegramId);
        
        if (user) {
            appData.currentUser = user;
            appData.isAdmin = telegramId === ADMIN_TELEGRAM_ID;
            
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

        const user = await SharedData.getUserByTelegramId(telegramId);
        
        if (user) {
            appData.currentUser = user;
            appData.isAdmin = true;
            
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
        userAvatar.textContent = appData.currentUser.avatar || '👤';
    }

    if (userName) {
        userName.textContent = appData.currentUser.gameNickname || 'Гость';
    }

    if (profileAvatar) {
        profileAvatar.textContent = appData.currentUser.avatar || '👤';
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
        const isParticipant = tournament.participants?.some(p => p.telegramId === appData.currentUser?.telegramId);
        const isFull = tournament.participants?.length >= tournament.maxPlayers;
        
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
                        <div class="tournament-detail-value">${tournament.participants?.length || 0}/${tournament.maxPlayers}</div>
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

        const tournament = await SharedData.getTournamentById(tournamentId);
        if (!tournament) {
            showError('Турнир не найден');
            return;
        }

        if (!tournament.participants) {
            tournament.participants = [];
        }

        // Проверяем, не участвует ли уже
        const alreadyJoined = tournament.participants.some(p => p.telegramId === appData.currentUser.telegramId);
        if (alreadyJoined) {
            showError('Вы уже участвуете в этом турнире');
            return;
        }

        // Проверяем, не заполнен ли турнир
        if (tournament.participants.length >= tournament.maxPlayers) {
            showError('Турнир заполнен');
            return;
        }

        // Добавляем участника
        tournament.participants.push({
            id: appData.currentUser.id,
            telegramId: appData.currentUser.telegramId,
            nickname: appData.currentUser.gameNickname,
            avatar: appData.currentUser.avatar,
            joinDate: new Date().toISOString()
        });

        // Сохраняем турнир
        await SharedData.saveTournament(tournament);
        
        // Перезагружаем турниры
        await initializeData();
        
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
                    ${participant.avatar || '👤'}
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
            ${user.avatar || '👤'}
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
                            ${user.avatar || '👤'}
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

        const newTournament = {
            id: Date.now(),
            name,
            date,
            duration,
            maxPlayers,
            prize,
            type,
            status: 'upcoming',
            participants: []
        };

        // Сохраняем турнир
        await SharedData.saveTournament(newTournament);
        
        // Перезагружаем турниры
        await initializeData();
        
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

        const tournament = await SharedData.getTournamentById(tournamentId);
        if (!tournament) {
            showError('Турнир не найден');
            return;
        }

        tournament.status = 'finished';
        
        // Сохраняем турнир
        await SharedData.saveTournament(tournament);
        
        // Перезагружаем турниры
        await initializeData();
        
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
                    ${user.avatar || '👤'}
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
function loadRegisteredUsers() {
    document.getElementById('totalUsers').textContent = appData.registeredUsers.length || 0;
    document.getElementById('totalTournaments').textContent = appData.tournaments.length || 0;
    const activeGames = appData.tournaments.filter(t => t.status === 'active').length;
    document.getElementById('activeGames').textContent = activeGames;
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

        appData.currentUser.avatar = window.selectedAvatar;
        
        // Сохраняем пользователя
        await SharedData.saveUser(appData.currentUser);
        
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

        appData.currentUser.gameNickname = gameNickname;
        appData.currentUser.preferredGame = preferredGame;
        
        // Сохраняем пользователя
        await SharedData.saveUser(appData.currentUser);
        
        closeModal('editProfileModal');
        loadUserData();
        showSuccess('Профиль обновлен!');
        
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        showError(error.message || 'Ошибка обновления профиля');
    }
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
    initializeData().then(() => {
        showSuccess('Данные синхронизированы!');
        loadTournaments();
        loadRating();
        loadUserData();
    });
}

function createDemoData() {
    showError('Демо-данные создаются автоматически');
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
