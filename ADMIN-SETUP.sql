-- SQL скрипт для настройки администратора
-- Выполните этот скрипт в вашей PostgreSQL базе данных на Render.com

-- 1. Установить роль 'admin' для пользователя с Telegram ID 609464085
UPDATE users 
SET role = 'admin' 
WHERE telegram_id = '609464085';

-- 2. Проверить, что изменения применились
SELECT 
    id,
    telegram_id,
    game_nickname,
    role,
    created_at
FROM users 
WHERE telegram_id = '609464085';

-- 3. Если пользователя ещё нет в базе, он будет создан автоматически при первом входе
-- Но вы можете создать его вручную:
-- INSERT INTO users (telegram_id, telegram_username, game_nickname, role, avatar_url)
-- VALUES ('609464085', 'YOUR_USERNAME', 'YOUR_NICKNAME', 'admin', '')
-- ON CONFLICT (telegram_id) DO UPDATE SET role = 'admin';

-- Готово! Теперь вы администратор.

