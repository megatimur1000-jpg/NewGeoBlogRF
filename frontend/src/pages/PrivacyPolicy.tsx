import React from 'react';
import { FaLock, FaDatabase, FaUserShield, FaEye, FaTrash, FaDownload } from 'react-icons/fa';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <FaLock className="text-2xl text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Политика конфиденциальности</h1>
              <p className="text-gray-600 mt-2">Защита ваших персональных данных</p>
            </div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="text-sm text-green-800">
              <strong>Дата последнего обновления:</strong> 14 сентября 2025 года
            </p>
            <p className="text-sm text-green-700 mt-1">
              Настоящая политика описывает, как мы собираем, используем и защищаем ваши данные
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaDatabase className="text-xl text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">1. Какие данные мы собираем</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.1 Персональные данные:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Имя пользователя и email при регистрации</li>
                <li>Пароль (в зашифрованном виде)</li>
                <li>Аватар и настройки профиля</li>
                <li>Дата регистрации и последней активности</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.2 Данные активности:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Созданные метки и их координаты</li>
                <li>Планируемые маршруты</li>
                <li>Публикации в блогах</li>
                <li>События в календаре</li>
                <li>Сообщения в чатах</li>
                <li>Лента активности</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.3 Технические данные:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>IP-адрес и информация о браузере</li>
                <li>Время посещения и действия на сайте</li>
                <li>Cookies и локальное хранилище</li>
                <li>Данные о производительности</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaEye className="text-xl text-purple-600" />
              <h2 className="text-2xl font-semibold text-gray-800">2. Как мы используем ваши данные</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Основные цели:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Предоставление функциональности платформы</li>
                <li>Персонализация пользовательского опыта</li>
                <li>Обеспечение безопасности и модерации</li>
                <li>Улучшение качества сервиса</li>
                <li>Техническая поддержка пользователей</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Аналитика и улучшения:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Анализ использования функций платформы</li>
                <li>Выявление и исправление ошибок</li>
                <li>Оптимизация производительности</li>
                <li>Разработка новых функций</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaUserShield className="text-xl text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-800">3. Защита данных</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Технические меры:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Шифрование данных при передаче (HTTPS)</li>
                <li>Хеширование паролей с солью</li>
                <li>Регулярные резервные копии</li>
                <li>Мониторинг безопасности</li>
                <li>Ограничение доступа к данным</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Организационные меры:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Обучение сотрудников по защите данных</li>
                <li>Политики доступа и безопасности</li>
                <li>Регулярные аудиты безопасности</li>
                <li>Планы реагирования на инциденты</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Передача данных третьим лицам</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Служб геокодирования (Nominatim, Overpass API) для определения мест</li>
                <li>Провайдеров хостинга и облачных сервисов</li>
                <li>Служб аналитики (анонимизированные данные)</li>
                <li>По требованию правоохранительных органов</li>
                <li>При согласии пользователя</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaDownload className="text-xl text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-800">5. Ваши права</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                В соответствии с GDPR и российским законодательством, вы имеете право:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li><strong>Доступ:</strong> Получить копию ваших данных</li>
                <li><strong>Исправление:</strong> Обновить неточные данные</li>
                <li><strong>Удаление:</strong> Удалить ваш аккаунт и данные</li>
                <li><strong>Ограничение:</strong> Ограничить обработку данных</li>
                <li><strong>Портативность:</strong> Экспортировать ваши данные</li>
                <li><strong>Возражение:</strong> Отказаться от обработки</li>
              </ul>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaTrash className="text-xl text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-800">6. Хранение и удаление данных</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Сроки хранения:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Активные аккаунты: до удаления пользователем</li>
                <li>Неактивные аккаунты: 3 года</li>
                <li>Логи безопасности: 1 год</li>
                <li>Резервные копии: 30 дней</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Удаление данных:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Полное удаление при запросе пользователя</li>
                <li>Анонимизация для аналитических целей</li>
                <li>Безопасное удаление с серверов</li>
                <li>Уведомление о завершении процесса</li>
              </ul>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies и отслеживание</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Мы используем cookies для:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Аутентификации пользователей</li>
                <li>Сохранения настроек</li>
                <li>Аналитики использования</li>
                <li>Улучшения производительности</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Вы можете отключить cookies в настройках браузера, но это может 
                ограничить функциональность платформы.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Изменения политики</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Мы можем обновлять настоящую политику конфиденциальности. 
                О существенных изменениях мы уведомим через платформу или email.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Рекомендуем периодически проверять актуальную версию политики.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Контакты по вопросам конфиденциальности</h2>
            <p className="text-green-100 leading-relaxed">
              По вопросам обработки персональных данных обращайтесь:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> privacy@horizon-explorer.com</p>
              <p><strong>DPO (Data Protection Officer):</strong> dpo@horizon-explorer.com</p>
              <p><strong>Телефон:</strong> +7 (XXX) XXX-XX-XX</p>
              <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 1</p>
            </div>
            <div className="mt-6 p-4 bg-green-700 rounded-lg">
              <p className="text-sm">
                <strong>Время ответа:</strong> Мы обязуемся ответить на ваши запросы 
                в течение 30 дней в соответствии с GDPR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
