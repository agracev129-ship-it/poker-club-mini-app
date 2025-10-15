// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

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

// ID администратора (замени на свой Telegram ID)
const ADMIN_TELEGRAM_ID = 609464085; // Твой Telegram ID

// Система хранения данных
const Storage = {
    save: (key, data) => {
        localStorage.setItem(`pokerClub_${key}`, JSON.stringify(data));
    },
    load: (key, defaultValue = null) => {
        const data = localStorage.getItem(`pokerClub_${key}`);
        return data ? JSON.parse(data) : defaultValue;
    },
    remove: (key) => {
        localStorage.removeItem(`pokerClub_${key}`);
    }
};

// Инициализация приложения
function initApp() {
    tg.expand();
    tg.enableClosingConfirmation();
    appData.user = tg.initDataUnsafe.user;
    initializeData();
    setupEventListeners();
    checkAuthentication();
    console.log("Poker Club Mini App инициализирован");
}

// Проверка авторизации
function checkAuthentication() {
    const currentUser = Storage.load('currentUser');
    
    if (currentUser) {
        appData.currentUser = currentUser;
        appData.isLoggedIn = true;
        appData.isAdmin = currentUser.telegramId === ADMIN_TELEGRAM_ID;
        loadAllData();
        updateUserInterface();
    } else {
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
function loginAsUser() {
    closeModal('loginModal');
    const existingUser = findUserByTelegramId(appData.user.id);
    
    if (existingUser) {
        appData.currentUser = existingUser;
        appData.isLoggedIn = true;
        appData.isAdmin = false;
        Storage.save('currentUser', appData.currentUser);
        updateUserInterface();
        loadAllData();
    } else {
        showRegistrationModal();
    }
}

// Вход как администратор
function loginAsAdmin() {
    closeModal('loginModal');
    
    appData.currentUser = {
        telegramId: appData.user.id,
        telegramName: appData.user.first_name,
        gameNickname: 'Администратор',
        preferredGame: 'mixed',
        isAdmin: true,
        stats: { totalWins: 0, totalGames: 0, currentRank: 6, points: 9999 }
    };
    
    appData.isLoggedIn = true;
    appData.isAdmin = true;
    Storage.save('currentUser', appData.currentUser);
    updateUserInterface();
    loadAllData();
}

// Показать модальное окно регистрации
function showRegistrationModal() {
    closeModal('loginModal');
    
    // Запрашиваем доступ к контактам и аватарке
    requestTelegramData();
    
    document.getElementById('registrationModal').style.display = 'block';
}

// Запрос данных из Telegram
function requestTelegramData() {
    if (tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Пытаемся получить аватарку из Telegram
        if (user.photo_url) {
            // Если есть URL аватарки, сохраняем его
            appData.telegramAvatar = user.photo_url;
            console.log('Telegram avatar URL:', user.photo_url);
        }
        
        // Запрашиваем доступ к контактам (если доступно)
        if (tg.requestContact) {
            tg.requestContact();
        }
        
        console.log('Telegram user data:', user);
    }
}

// Регистрация пользователя
function registerUser() {
    const nickname = document.getElementById('gameNickname').value.trim();
    const preferredGame = document.getElementById('preferredGame').value;
    
    if (!nickname) {
        showAlert('Введите игровой никнейм!');
        return;
    }
    
    if (isNicknameTaken(nickname)) {
        showAlert('Этот никнейм уже занят!');
        return;
    }
    
    const newUser = {
        telegramId: appData.user.id,
        telegramName: appData.user.first_name,
        telegramUsername: appData.user.username,
        gameNickname: nickname,
        preferredGame: preferredGame,
        isAdmin: false,
        stats: { totalWins: 0, totalGames: 0, currentRank: 1, points: 0 },
        registrationDate: new Date().toISOString(),
        avatar: appData.telegramAvatar ? 'telegram' : '👤', // Сохраняем флаг аватарки из Telegram
        telegramAvatarUrl: appData.telegramAvatar || null
    };
    
    appData.registeredUsers.push(newUser);
    Storage.save('registeredUsers', appData.registeredUsers);
    
    appData.currentUser = newUser;
    appData.isLoggedIn = true;
    appData.isAdmin = false;
    Storage.save('currentUser', appData.currentUser);
    
    closeModal('registrationModal');
    updateUserInterface();
    loadAllData();
    showAlert(`Добро пожаловать в Poker Club, ${nickname}! 🎉`);
    
    // Обновляем рейтинг после регистрации
    setTimeout(() => {
        loadRating();
    }, 500);
}

// Поиск пользователя по Telegram ID
function findUserByTelegramId(telegramId) {
    return appData.registeredUsers.find(user => user.telegramId === telegramId);
}

// Проверка занятости никнейма
function isNicknameTaken(nickname) {
    return appData.registeredUsers.some(user => 
        user.gameNickname.toLowerCase() === nickname.toLowerCase()
    );
}

// Загрузка всех данных
function loadAllData() {
    loadUserData();
    loadTournaments();
    loadRating();
    loadAchievements();
    loadRegisteredUsers();
}

// Инициализация данных
function initializeData() {
    appData.registeredUsers = Storage.load('registeredUsers', []);
    appData.tournaments = Storage.load('tournaments', []);
    appData.tournamentParticipants = Storage.load('tournamentParticipants', {});
    
    if (appData.tournaments.length === 0) {
        createDefaultTournaments();
    }
}

// Создание турниров по умолчанию
function createDefaultTournaments() {
    appData.tournaments = [
        {
            id: 1,
            name: "Ежедневный турнир",
            status: "active",
            date: new Date().toISOString(),
            duration: 2,
            maxPlayers: 20,
            prize: 100,
            type: "texas",
            participants: []
        },
        {
            id: 2,
            name: "Турнир выходного дня",
            status: "upcoming",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration: 3,
            maxPlayers: 50,
            prize: 500,
            type: "mixed",
            participants: []
        }
    ];
    Storage.save('tournaments', appData.tournaments);
}

// Загрузка данных пользователя
function loadUserData() {
    if (appData.currentUser) {
        document.getElementById('userName').textContent = appData.currentUser.gameNickname;
        document.getElementById('userRank').textContent = getRankName(appData.currentUser.stats.currentRank);
        document.getElementById('profileName').textContent = appData.currentUser.gameNickname;
        document.getElementById('profileRank').textContent = `Ранг: ${getRankName(appData.currentUser.stats.currentRank)}`;
        document.getElementById('userNickname').textContent = appData.currentUser.gameNickname;
        document.getElementById('profileNickname').style.display = 'block';
        
        // Обновляем аватарку
        let avatar = appData.currentUser.avatar || '👤';
        
        // Если аватарка из Telegram, показываем специальный символ
        if (avatar === 'telegram' && appData.currentUser.telegramAvatarUrl) {
            avatar = '📷'; // Символ камеры для аватарки из Telegram
        }
        
        document.getElementById('profileAvatar').textContent = avatar;
        document.getElementById('userAvatar').textContent = avatar;
        
        // Обновляем статистику
        document.getElementById('totalWins').textContent = appData.currentUser.stats.totalWins;
        document.getElementById('totalGames').textContent = appData.currentUser.stats.totalGames;
        document.getElementById('currentRank').textContent = appData.currentUser.stats.currentRank;
        document.getElementById('profileGames').textContent = appData.currentUser.stats.totalGames;
        document.getElementById('profileWins').textContent = appData.currentUser.stats.totalWins;
        document.getElementById('profilePoints').textContent = appData.currentUser.stats.points;
        
        const winRate = appData.currentUser.stats.totalGames > 0 
            ? Math.round((appData.currentUser.stats.totalWins / appData.currentUser.stats.totalGames) * 100)
            : 0;
        document.getElementById('profileWinRate').textContent = `${winRate}%`;
    }
}

// Загрузка турниров
function loadTournaments() {
    updateTournamentStatuses();
    renderTournaments();
}

// Обновление статусов турниров
function updateTournamentStatuses() {
    const now = new Date();
    
    appData.tournaments.forEach(tournament => {
        const tournamentDate = new Date(tournament.date);
        const endDate = new Date(tournamentDate.getTime() + tournament.duration * 60 * 60 * 1000);
        
        if (tournament.status === 'upcoming' && now >= tournamentDate) {
            tournament.status = 'active';
        } else if (tournament.status === 'active' && now >= endDate) {
            // Турнир автоматически не завершается, только админ может его завершить
        }
    });
    
    Storage.save('tournaments', appData.tournaments);
}

// Загрузка рейтинга
function loadRating() {
    // Сортируем пользователей по очкам
    const sortedUsers = [...appData.registeredUsers].sort((a, b) => b.stats.points - a.stats.points);
    appData.rating = sortedUsers.slice(0, 10).map((user, index) => ({
        rank: index + 1,
        name: user.gameNickname,
        points: user.stats.points,
        avatar: index === 0 ? "👑" : index === 1 ? "🥇" : index === 2 ? "🥈" : "⭐"
    }));
    renderRating();
}

// Загрузка достижений
function loadAchievements() {
    appData.achievements = [
        { id: 1, name: "Первая победа", desc: "Выиграть первую игру", icon: "🏆", unlocked: appData.currentUser?.stats.totalWins > 0 },
        { id: 2, name: "Стратег", desc: "Выиграть 10 игр", icon: "🧠", unlocked: appData.currentUser?.stats.totalWins >= 10 },
        { id: 3, name: "Чемпион", desc: "Занять 1 место в турнире", icon: "👑", unlocked: false },
        { id: 4, name: "Настойчивый", desc: "Сыграть 50 игр", icon: "💪", unlocked: appData.currentUser?.stats.totalGames >= 50 }
    ];
    renderAchievements();
}

// Загрузка зарегистрированных пользователей
function loadRegisteredUsers() {
    if (appData.isAdmin) {
        const totalUsers = appData.registeredUsers.length;
        const totalTournaments = appData.tournaments.length;
        const activeGames = appData.tournaments.filter(t => t.status === 'active').length;
        
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalTournaments').textContent = totalTournaments;
        document.getElementById('activeGames').textContent = activeGames;
        
        console.log('Admin stats updated:', { totalUsers, totalTournaments, activeGames });
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
    
    if (appData.isAdmin) {
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
    
    container.innerHTML = tournaments.map(tournament => {
        const participantsCount = tournament.participants ? tournament.participants.length : 0;
        const isParticipant = tournament.participants && tournament.participants.some(p => p.telegramId === appData.currentUser?.telegramId);
        
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
                        <span>${participantsCount}/${tournament.maxPlayers} игроков</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        <span>Приз: ${tournament.prize} очков</span>
                    </div>
                </div>
                <div class="tournament-actions">
                    <button class="btn-join" onclick="joinTournament(${tournament.id})" ${isParticipant ? 'disabled' : ''}>
                        ${isParticipant ? 'Участвую' : getJoinButtonText(tournament.status)}
                    </button>
                    <button class="btn-participants" onclick="showTournamentParticipants(${tournament.id})">
                        <i class="fas fa-users"></i>
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
function joinTournament(tournamentId) {
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    if (tournament.status !== 'active' && tournament.status !== 'upcoming') {
        showAlert('Этот турнир уже завершен');
        return;
    }
    
    if (!tournament.participants) {
        tournament.participants = [];
    }
    
    const isAlreadyParticipant = tournament.participants.some(p => p.telegramId === appData.currentUser.telegramId);
    if (isAlreadyParticipant) {
        showAlert('Вы уже участвуете в этом турнире!');
        return;
    }
    
    if (tournament.participants.length >= tournament.maxPlayers) {
        showAlert('Турнир заполнен!');
        return;
    }
    
    tournament.participants.push({
        telegramId: appData.currentUser.telegramId,
        nickname: appData.currentUser.gameNickname,
        joinDate: new Date().toISOString(),
        avatar: appData.currentUser.avatar,
        telegramAvatarUrl: appData.currentUser.telegramAvatarUrl
    });
    
    Storage.save('tournaments', appData.tournaments);
    renderTournaments();
    showAlert(`Вы присоединились к турниру "${tournament.name}"!`);
    vibrate();
}

// Показать участников турнира
function showTournamentParticipants(tournamentId) {
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const participants = tournament.participants || [];
    const container = document.getElementById('participantsList');
    
    container.innerHTML = participants.map((participant, index) => {
        let avatar = participant.avatar || participant.nickname.charAt(0).toUpperCase();
        
        // Если аватарка из Telegram, показываем специальный символ
        if (avatar === 'telegram' && participant.telegramAvatarUrl) {
            avatar = '📷';
        }
        
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
    
    document.getElementById('participantsModal').style.display = 'block';
}

// Показать профиль пользователя
function showUserProfile(nickname) {
    const user = appData.registeredUsers.find(u => u.gameNickname === nickname);
    if (!user) return;
    
    const container = document.getElementById('userProfileDetails');
    const winRate = user.stats.totalGames > 0 
        ? Math.round((user.stats.totalWins / user.stats.totalGames) * 100)
        : 0;
    
    let avatar = user.avatar || user.gameNickname.charAt(0).toUpperCase();
    
    // Если аватарка из Telegram, показываем специальный символ
    if (avatar === 'telegram' && user.telegramAvatarUrl) {
        avatar = '📷';
    }
    
    container.innerHTML = `
        <div class="user-profile-header">
            <div class="user-avatar-large">${avatar}</div>
            <div class="user-info-large">
                <h3>${user.gameNickname}</h3>
                <p>Ранг: ${getRankName(user.stats.currentRank)}</p>
            </div>
        </div>
        <div class="user-stats-details">
            <div class="stat-row">
                <span>Игр сыграно:</span>
                <span>${user.stats.totalGames}</span>
            </div>
            <div class="stat-row">
                <span>Побед:</span>
                <span>${user.stats.totalWins}</span>
            </div>
            <div class="stat-row">
                <span>Процент побед:</span>
                <span>${winRate}%</span>
            </div>
            <div class="stat-row">
                <span>Очков:</span>
                <span>${user.stats.points}</span>
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
                    <span class="user-detail-value">@${appData.user?.username || 'не указан'}</span>
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

function createTournament() {
    if (!appData.isAdmin) return;
    
    const name = document.getElementById('tournamentName').value.trim();
    const date = document.getElementById('tournamentDate').value;
    const duration = parseInt(document.getElementById('tournamentDuration').value);
    const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    const prize = parseInt(document.getElementById('tournamentPrize').value);
    const type = document.getElementById('tournamentType').value;
    
    if (!name || !date) {
        showAlert('Заполните все обязательные поля!');
        return;
    }
    
    const newTournament = {
        id: Date.now(),
        name: name,
        status: 'upcoming',
        date: new Date(date).toISOString(),
        duration: duration,
        maxPlayers: maxPlayers,
        prize: prize,
        type: type,
        participants: []
    };
    
    appData.tournaments.push(newTournament);
    Storage.save('tournaments', appData.tournaments);
    
    closeModal('addTournamentModal');
    renderTournaments();
    loadRegisteredUsers();
    showAlert('Турнир создан успешно!');
    
    // Очищаем форму
    document.getElementById('tournamentName').value = '';
    document.getElementById('tournamentDate').value = '';
}

function showUsersList() {
    if (!appData.isAdmin) return;
    
    const container = document.getElementById('usersList');
    container.innerHTML = appData.registeredUsers.map(user => {
        const avatar = user.avatar || user.gameNickname.charAt(0).toUpperCase();
        return `
            <div class="user-item" onclick="showUserProfile('${user.gameNickname}')">
                <div class="user-avatar-small">${avatar}</div>
                <div class="user-info-small">
                    <div class="user-name-small">${user.gameNickname}</div>
                    <div class="user-stats-small">
                        ${user.stats.points} очков • ${user.stats.totalGames} игр • 
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

// Показать всех пользователей с рейтингом
function showAllUsers() {
    if (!appData.isAdmin) return;
    
    // Сортируем пользователей по рейтингу
    const sortedUsers = [...appData.registeredUsers].sort((a, b) => b.stats.points - a.stats.points);
    
    const container = document.getElementById('usersList');
    container.innerHTML = sortedUsers.map((user, index) => {
        let avatar = user.avatar || user.gameNickname.charAt(0).toUpperCase();
        
        // Если аватарка из Telegram, показываем специальный символ
        if (avatar === 'telegram' && user.telegramAvatarUrl) {
            avatar = '📷';
        }
        
        const winRate = user.stats.totalGames > 0 
            ? Math.round((user.stats.totalWins / user.stats.totalGames) * 100)
            : 0;
            
        return `
            <div class="user-item" onclick="showUserProfile('${user.gameNickname}')">
                <div class="user-rank-badge">${index + 1}</div>
                <div class="user-avatar-small">${avatar}</div>
                <div class="user-info-small">
                    <div class="user-name-small">${user.gameNickname}</div>
                    <div class="user-stats-small">
                        <strong>${user.stats.points} очков</strong> • ${user.stats.totalGames} игр • ${winRate}% побед
                    </div>
                    <div class="user-details">
                        <div class="user-detail-item">
                            <span class="user-detail-label">Ранг:</span>
                            <span class="user-detail-value">${getRankName(user.stats.currentRank)}</span>
                        </div>
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
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    vibrate();
}

// Выход
function logout() {
    Storage.remove('currentUser');
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
    document.getElementById('refreshTournaments')?.addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 500);
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
    tg.showAlert(message);
    console.log('Alert:', message);
}

// Функция для вибрации
function vibrate() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция для изменения темы
function applyTheme() {
    const body = document.body;
    
    if (tg.colorScheme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
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
    // В реальном приложении здесь была бы загрузка файла
    showAlert('Функция загрузки фото будет добавлена в следующих версиях');
}

function saveAvatar() {
    if (appData.currentUser) {
        appData.currentUser.avatar = appData.selectedAvatar;
        Storage.save('currentUser', appData.currentUser);
        
        // Обновляем пользователя в списке
        const userIndex = appData.registeredUsers.findIndex(u => u.telegramId === appData.currentUser.telegramId);
        if (userIndex !== -1) {
            appData.registeredUsers[userIndex].avatar = appData.selectedAvatar;
            Storage.save('registeredUsers', appData.registeredUsers);
        }
        
        closeModal('avatarModal');
        loadUserData();
        showAlert('Аватарка сохранена!');
    }
}

// Функция завершения турнира
function finishTournament(tournamentId) {
    if (!appData.isAdmin) return;
    
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    tournament.status = 'finished';
    Storage.save('tournaments', appData.tournaments);
    renderTournaments();
    showAlert(`Турнир "${tournament.name}" завершен!`);
}

// Функция для кликабельной кнопки "Все время" в рейтинге
function switchRatingPeriod(period) {
    // Здесь можно добавить логику смены периода рейтинга
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Перезагружаем рейтинг
    loadRating();
}

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
window.showAllUsers = showAllUsers;

// Экспорт функций для использования в других скриптах
window.TelegramApp = {
    showAlert,
    vibrate,
    tg,
    appData
};
