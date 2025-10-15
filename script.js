// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Данные приложения
let appData = {
    user: null,
    stats: {
        totalWins: 0,
        totalGames: 0,
        currentRank: 1,
        points: 0
    },
    tournaments: [],
    rating: [],
    achievements: []
};

// Инициализация приложения
function initApp() {
    // Расширяем приложение на весь экран
    tg.expand();
    
    // Включаем кнопку закрытия
    tg.enableClosingConfirmation();
    
    // Получаем данные пользователя
    appData.user = tg.initDataUnsafe.user;
    
    // Инициализируем данные
    initializeData();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Загружаем данные
    loadUserData();
    loadTournaments();
    loadRating();
    loadAchievements();
    
    console.log("Poker Club Mini App инициализирован");
    console.log("Данные пользователя:", appData.user);
}

// Инициализация данных
function initializeData() {
    // Загружаем сохраненные данные из localStorage
    const savedStats = localStorage.getItem('pokerClub_stats');
    if (savedStats) {
        appData.stats = { ...appData.stats, ...JSON.parse(savedStats) };
    }
    
    // Обновляем отображение статистики
    updateStatsDisplay();
    updateUserProfile();
}

// Загрузка данных пользователя
function loadUserData() {
    if (appData.user) {
        document.getElementById('userName').textContent = appData.user.first_name || 'Игрок';
        document.getElementById('userRank').textContent = getRankName(appData.stats.currentRank);
        document.getElementById('profileName').textContent = appData.user.first_name || 'Игрок';
        document.getElementById('profileRank').textContent = `Ранг: ${getRankName(appData.stats.currentRank)}`;
    }
}

// Загрузка турниров
function loadTournaments() {
    // Генерируем тестовые турниры
    appData.tournaments = [
        {
            id: 1,
            name: "Ежедневный турнир",
            status: "active",
            time: "19:00 - 21:00",
            players: "12/20",
            prize: "100 очков",
            type: "daily"
        },
        {
            id: 2,
            name: "Турнир выходного дня",
            status: "upcoming",
            time: "20:00 - 23:00",
            players: "0/50",
            prize: "500 очков",
            type: "weekend"
        },
        {
            id: 3,
            name: "Быстрый турнир",
            status: "finished",
            time: "18:00 - 19:00",
            players: "15/15",
            prize: "50 очков",
            type: "quick"
        }
    ];
    
    renderTournaments();
}

// Загрузка рейтинга
function loadRating() {
    // Генерируем тестовый рейтинг
    appData.rating = [
        { rank: 1, name: "Алексей П.", points: 2450, avatar: "👑" },
        { rank: 2, name: "Мария К.", points: 2380, avatar: "🥇" },
        { rank: 3, name: "Дмитрий С.", points: 2200, avatar: "🥈" },
        { rank: 4, name: "Анна В.", points: 2150, avatar: "🥉" },
        { rank: 5, name: "Сергей М.", points: 2000, avatar: "⭐" }
    ];
    
    renderRating();
}

// Загрузка достижений
function loadAchievements() {
    appData.achievements = [
        { id: 1, name: "Первая победа", desc: "Выиграть первую игру", icon: "🏆", unlocked: false },
        { id: 2, name: "Стратег", desc: "Выиграть 10 игр", icon: "🧠", unlocked: false },
        { id: 3, name: "Чемпион", desc: "Занять 1 место в турнире", icon: "👑", unlocked: false },
        { id: 4, name: "Настойчивый", desc: "Сыграть 50 игр", icon: "💪", unlocked: false }
    ];
    
    renderAchievements();
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
    
    // Периоды рейтинга
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Здесь можно добавить логику смены периода
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

// Переключение табов
function switchTab(tabName) {
    // Скрываем все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс с навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Показываем выбранный таб
    document.getElementById(tabName).classList.add('active');
    
    // Активируем соответствующую кнопку навигации
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Вибрация при переключении
    vibrate();
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

// Отображение турниров
function renderTournaments(tournaments = appData.tournaments) {
    const container = document.getElementById('tournamentsList');
    if (!container) return;
    
    container.innerHTML = tournaments.map(tournament => `
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
                    <span>${tournament.time}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>${tournament.players} игроков</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-trophy"></i>
                    <span>Приз: ${tournament.prize}</span>
                </div>
            </div>
            <button class="btn-join" onclick="joinTournament(${tournament.id})">
                ${tournament.status === 'active' ? 'Присоединиться' : 
                  tournament.status === 'upcoming' ? 'Зарегистрироваться' : 'Завершен'}
            </button>
        </div>
    `).join('');
}

// Отображение рейтинга
function renderRating() {
    const container = document.getElementById('ratingList');
    if (!container) return;
    
    container.innerHTML = appData.rating.map(player => `
        <div class="rating-item">
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

// Обновление статистики
function updateStatsDisplay() {
    document.getElementById('totalWins').textContent = appData.stats.totalWins;
    document.getElementById('totalGames').textContent = appData.stats.totalGames;
    document.getElementById('currentRank').textContent = appData.stats.currentRank;
}

// Обновление профиля пользователя
function updateUserProfile() {
    if (appData.user) {
        document.getElementById('userName').textContent = appData.user.first_name || 'Игрок';
        document.getElementById('userRank').textContent = getRankName(appData.stats.currentRank);
    }
}

// Получение названия ранга
function getRankName(rank) {
    const ranks = {
        1: 'Новичок',
        2: 'Любитель',
        3: 'Игрок',
        4: 'Эксперт',
        5: 'Мастер',
        6: 'Гроссмейстер'
    };
    return ranks[rank] || 'Новичок';
}

// Получение текста статуса
function getStatusText(status) {
    const statuses = {
        active: 'Активен',
        upcoming: 'Предстоящий',
        finished: 'Завершен'
    };
    return statuses[status] || 'Неизвестно';
}

// Присоединение к турниру
function joinTournament(tournamentId) {
    const tournament = appData.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    if (tournament.status === 'active') {
        showAlert(`Вы присоединились к турниру "${tournament.name}"!`);
        vibrate();
    } else if (tournament.status === 'upcoming') {
        showAlert(`Вы зарегистрированы на турнир "${tournament.name}"!`);
        vibrate();
    } else {
        showAlert('Этот турнир уже завершен');
    }
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

// Сохранение данных
function saveData() {
    localStorage.setItem('pokerClub_stats', JSON.stringify(appData.stats));
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

// Сохранение данных при закрытии
window.addEventListener('beforeunload', saveData);

// Экспорт функций для глобального использования
window.joinTournament = joinTournament;
window.switchTab = switchTab;
window.filterTournaments = filterTournaments;

// Экспорт функций для использования в других скриптах
window.TelegramApp = {
    showAlert,
    vibrate,
    tg,
    appData
};
