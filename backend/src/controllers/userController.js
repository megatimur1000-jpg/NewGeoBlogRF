import pool from '../../db.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import smsService from '../services/smsService.js';
import { pool as smsPool } from '../database/smsCodes.js';
import { checkSMSSendLimits, logSMSTry } from '../services/smsLimiter.js';

// Обновляем функцию register
export const register = async (req, res) => {
  const { 
    email, username, password, first_name, last_name, avatar_url, bio, phone 
  } = req.body;

  try {
    // Проверяем, существует ли пользователь (email, username или phone)
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 OR phone = $3',
      [email, username, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Пользователь с таким email, username или номером телефона уже существует' 
      });
    }

    // Проверяем лимиты на отправку SMS
    const limitsCheck = await checkSMSSendLimits(phone);
    if (!limitsCheck.allowed) {
      await logSMSTry(phone, 'verification', false, `Лимит превышен: ${limitsCheck.message}`);
      return res.status(429).json({ 
        message: limitsCheck.message,
        retryAfter: limitsCheck.limit
      });
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Генерируем SMS-код для верификации
    const verificationCode = smsService.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Сохраняем SMS-код в базу
    await smsPool.query(
      'INSERT INTO sms_codes (phone, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [phone, verificationCode, 'verification', expiresAt]
    );

    // Отправляем SMS и логируем результат
    try {
      await smsService.sendVerificationCode(phone, verificationCode);
      await logSMSTry(phone, 'verification', true);
    } catch (smsError) {
      await logSMSTry(phone, 'verification', false, smsError.message);
      throw smsError;
    }

    // Создаем пользователя с всеми полями (но не активируем до верификации)
    const result = await pool.query(
      `INSERT INTO users (
        email, username, password_hash, role, 
        first_name, last_name, avatar_url, bio, phone,
        is_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, 'registered', $4, $5, $6, $7, $8, false, false, NOW(), NOW()) 
      RETURNING id, email, username, role, first_name, last_name, avatar_url, bio, phone, created_at`,
      [email, username, hashedPassword, first_name, last_name, avatar_url, bio, phone]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Пользователь зарегистрирован. Проверьте SMS для подтверждения номера телефона.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        phone: user.phone,
        created_at: user.created_at,
        is_verified: false
      },
      requiresVerification: true
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при регистрации' 
    });
  }
};

// Получение профиля пользователя (полная версия)
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, role, first_name, last_name, avatar_url, bio,
              is_verified, is_active, created_at, updated_at, last_login, 
              subscription_expires_at, settings, analytics_opt_out
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({
      user: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка сервера при получении профиля' 
    });
  }
};

// Обновление аватара пользователя
export const updateAvatar = async (req, res) => {
  const { avatar_url } = req.body;
  
  if (!avatar_url) {
    return res.status(400).json({ 
      message: 'URL аватара обязателен' 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET avatar_url = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, email, username, role, first_name, last_name, avatar_url, bio, created_at, updated_at`,
      [avatar_url, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({
      message: 'Аватар успешно обновлен',
      user: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении аватара' 
    });
  }
};

// Авторизация пользователя (валидация теперь в middleware)
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Ищем пользователя
    const result = await pool.query(
      'SELECT id, email, username, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    const user = result.rows[0];
    // Проверяем пароль
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Генерируем JWT токен
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Успешная авторизация',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка сервера при авторизации' 
    });
  }
};

// Верификация SMS-кода
export const verifySMS = async (req, res) => {
  const { phone, code } = req.body;

  try {
    // Проверяем SMS-код
    const smsResult = await smsPool.query(
      `SELECT id FROM sms_codes 
       WHERE phone = $1 AND code = $2 AND type = 'verification' 
       AND expires_at > NOW() AND used = FALSE`,
      [phone, code]
    );

    if (smsResult.rows.length === 0) {
      return res.status(400).json({
        message: 'Неверный или устаревший код подтверждения'
      });
    }

    // Помечаем код как использованный
    await smsPool.query(
      'UPDATE sms_codes SET used = TRUE WHERE id = $1',
      [smsResult.rows[0].id]
    );

    // Активируем пользователя
    const userResult = await pool.query(
      `UPDATE users 
       SET is_verified = TRUE, is_active = TRUE, updated_at = NOW()
       WHERE phone = $1 
       RETURNING id, email, username, role, first_name, last_name, avatar_url, bio, phone, created_at`,
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    const user = userResult.rows[0];
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Номер телефона успешно подтвержден',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        phone: user.phone,
        created_at: user.created_at,
        is_verified: true
      },
      token
    });

  } catch (error) {
    console.error('Ошибка верификации SMS:', error);
    res.status(500).json({
      message: 'Ошибка сервера при верификации SMS'
    });
  }
};

// Повторная отправка SMS-кода
export const resendSMS = async (req, res) => {
  const { phone } = req.body;

  try {
    // Проверяем лимиты на отправку SMS
    const limitsCheck = await checkSMSSendLimits(phone);
    if (!limitsCheck.allowed) {
      await logSMSTry(phone, 'verification', false, `Лимит превышен при повторной отправке: ${limitsCheck.message}`);
      return res.status(429).json({
        message: limitsCheck.message,
        retryAfter: limitsCheck.limit
      });
    }

    // Проверяем, существует ли пользователь с таким телефоном
    const userResult = await pool.query(
      'SELECT id, is_verified FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Пользователь с таким номером телефона не найден'
      });
    }

    if (userResult.rows[0].is_verified) {
      return res.status(400).json({
        message: 'Номер телефона уже подтвержден'
      });
    }

    // Генерируем новый SMS-код
    const verificationCode = smsService.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Удаляем старые коды для этого телефона
    await smsPool.query(
      'DELETE FROM sms_codes WHERE phone = $1 AND type = $2',
      [phone, 'verification']
    );

    // Сохраняем новый код
    await smsPool.query(
      'INSERT INTO sms_codes (phone, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [phone, verificationCode, 'verification', expiresAt]
    );

    // Отправляем SMS и логируем результат
    try {
      await smsService.sendVerificationCode(phone, verificationCode);
      await logSMSTry(phone, 'verification', true);
      res.json({
        message: 'SMS-код отправлен повторно'
      });
    } catch (smsError) {
      await logSMSTry(phone, 'verification', false, smsError.message);
      throw smsError;
    }

  } catch (error) {
    console.error('Ошибка повторной отправки SMS:', error);
    res.status(500).json({
      message: 'Ошибка сервера при повторной отправке SMS'
    });
  }
};

// Восстановление пароля через SMS
export const requestPasswordReset = async (req, res) => {
  const { phone } = req.body;

  try {
    // Проверяем лимиты на отправку SMS
    const limitsCheck = await checkSMSSendLimits(phone);
    if (!limitsCheck.allowed) {
      await logSMSTry(phone, 'password_reset', false, `Лимит превышен при восстановлении: ${limitsCheck.message}`);
      return res.status(429).json({
        message: limitsCheck.message,
        retryAfter: limitsCheck.limit
      });
    }

    // Проверяем, существует ли пользователь с таким телефоном
    const userResult = await pool.query(
      'SELECT id FROM users WHERE phone = $1 AND is_verified = TRUE',
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Пользователь с таким номером телефона не найден или не подтвержден'
      });
    }

    // Генерируем SMS-код для восстановления
    const resetCode = smsService.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    // Удаляем старые коды восстановления для этого телефона
    await smsPool.query(
      'DELETE FROM sms_codes WHERE phone = $1 AND type = $2',
      [phone, 'password_reset']
    );

    // Сохраняем новый код
    await smsPool.query(
      'INSERT INTO sms_codes (phone, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [phone, resetCode, 'password_reset', expiresAt]
    );

    // Отправляем SMS и логируем результат
    try {
      await smsService.sendPasswordResetCode(phone, resetCode);
      await logSMSTry(phone, 'password_reset', true);
      res.json({
        message: 'SMS-код для восстановления пароля отправлен'
      });
    } catch (smsError) {
      await logSMSTry(phone, 'password_reset', false, smsError.message);
      throw smsError;
    }

  } catch (error) {
    console.error('Ошибка запроса восстановления пароля:', error);
    res.status(500).json({
      message: 'Ошибка сервера при запросе восстановления пароля'
    });
  }
};

// Подтверждение восстановления пароля
export const confirmPasswordReset = async (req, res) => {
  const { phone, code, newPassword } = req.body;

  try {
    // Проверяем SMS-код
    const smsResult = await smsPool.query(
      `SELECT id FROM sms_codes 
       WHERE phone = $1 AND code = $2 AND type = 'password_reset' 
       AND expires_at > NOW() AND used = FALSE`,
      [phone, code]
    );

    if (smsResult.rows.length === 0) {
      return res.status(400).json({
        message: 'Неверный или устаревший код восстановления'
      });
    }

    // Помечаем код как использованный
    await smsPool.query(
      'UPDATE sms_codes SET used = TRUE WHERE id = $1',
      [smsResult.rows[0].id]
    );

    // Обновляем пароль
    const hashedPassword = await hashPassword(newPassword);
    const userResult = await pool.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW()
       WHERE phone = $2 AND is_verified = TRUE
       RETURNING id, email, username, role`,
      [hashedPassword, phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    const user = userResult.rows[0];
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Пароль успешно изменен',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Ошибка подтверждения восстановления пароля:', error);
    res.status(500).json({
      message: 'Ошибка сервера при подтверждении восстановления пароля'
    });
  }
};
// Обновление профиля пользователя (валидация теперь в middleware)
export const updateProfile = async (req, res) => {
  const { username, email, currentPassword, newPassword, analytics_opt_out } = req.body;

  try {
    // Если меняем пароль, проверяем текущий
    if (newPassword && currentPassword) {
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Пользователь не найден' 
        });
      }

      const isValidPassword = await comparePassword(currentPassword, userResult.rows[0].password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          message: 'Неверный текущий пароль' 
        });
      }
    }

    // Проверяем, не занят ли username другим пользователем
    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ 
          message: 'Пользователь с таким username уже существует' 
        });
      }
    }

    // Обновляем профиль
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updateFields.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (newPassword) {
      const hashedPassword = await hashPassword(newPassword);
      updateFields.push(`password_hash = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (typeof analytics_opt_out === 'boolean') {
      updateFields.push(`analytics_opt_out = $${paramCount}`);
      values.push(analytics_opt_out);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        message: 'Нет данных для обновления' 
      });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING id, email, username, role, updated_at, analytics_opt_out`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({
      message: 'Профиль успешно обновлен',
      user: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка сервера при обновлении профиля' 
    });
  }
};