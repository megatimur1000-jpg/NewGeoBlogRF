import React from 'react';
import { FaFileContract, FaShieldAlt, FaUsers, FaExclamationTriangle, FaGavel } from 'react-icons/fa';

const UserAgreement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaFileContract className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Пользовательское соглашение</h1>
              <p className="text-gray-600 mt-2">Horizon Explorer - Ваш путеводитель в мир открытий</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-sm text-blue-800">
              <strong>Дата последнего обновления:</strong> 14 сентября 2025 года
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Настоящее соглашение регулирует использование платформы Horizon Explorer
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaUsers className="text-xl text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-800">1. Общие положения</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                администрацией платформы Horizon Explorer (далее — «Платформа») и пользователями 
                (далее — «Пользователь») при использовании сервиса.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Используя Платформу, вы подтверждаете, что прочитали, поняли и согласны соблюдать 
                условия настоящего Соглашения.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-xl text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">2. Описание сервиса</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Horizon Explorer — это интерактивная платформа для создания, планирования и 
                обмена маршрутами путешествий, включающая:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Интерактивные карты с возможностью создания меток</li>
                <li>Планировщик маршрутов с интеграцией событий</li>
                <li>Систему блогов для публикации путевых заметок</li>
                <li>Календарь событий и активностей</li>
                <li>Социальные функции: чаты, лента активности, друзья</li>
                <li>Систему модерации и безопасности</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-xl text-orange-600" />
              <h2 className="text-2xl font-semibold text-gray-800">3. Права и обязанности пользователей</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Права пользователей:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Создавать и публиковать контент в соответствии с правилами</li>
                <li>Использовать все функции платформы в рамках лицензии</li>
                <li>Обращаться в службу поддержки</li>
                <li>Удалять свой аккаунт и данные</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Обязанности пользователей:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Предоставлять достоверную информацию при регистрации</li>
                <li>Соблюдать правила использования платформы</li>
                <li>Не нарушать права других пользователей</li>
                <li>Не размещать запрещенный контент</li>
                <li>Соблюдать законодательство РФ</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <FaGavel className="text-xl text-red-600" />
              <h2 className="text-2xl font-semibold text-gray-800">4. Запрещенный контент</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                На платформе запрещено размещение следующего контента:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Материалы, нарушающие законодательство РФ</li>
                <li>Контент, содержащий ненормативную лексику или оскорбления</li>
                <li>Материалы, нарушающие авторские права</li>
                <li>Спам, реклама без согласования</li>
                <li>Информация о военных объектах или частных территориях</li>
                <li>Персональные данные третьих лиц без согласия</li>
                <li>Контент, пропагандирующий насилие или экстремизм</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Интеллектуальная собственность</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Пользователи сохраняют права на созданный ими контент, но предоставляют 
                платформе неисключительную лицензию на его использование для функционирования сервиса.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Платформа и все её элементы (дизайн, код, функциональность) являются 
                интеллектуальной собственностью администрации.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Ответственность и ограничения</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Платформа предоставляется «как есть». Администрация не несет ответственности за:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Точность информации, размещенной пользователями</li>
                <li>Временные технические сбои</li>
                <li>Действия третьих лиц</li>
                <li>Ущерб от использования платформы</li>
              </ul>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Модерация и блокировки</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Администрация оставляет за собой право:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                <li>Модерировать контент пользователей</li>
                <li>Удалять нарушающий правила контент</li>
                <li>Временно или постоянно блокировать аккаунты</li>
                <li>Предупреждать пользователей о нарушениях</li>
              </ul>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Изменения соглашения</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Администрация может изменять условия настоящего Соглашения. 
                Пользователи будут уведомлены об изменениях через платформу.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Продолжение использования платформы после изменений означает 
                согласие с новыми условиями.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Контакты</h2>
            <p className="text-blue-100 leading-relaxed">
              По вопросам, связанным с настоящим Соглашением, обращайтесь:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> support@horizon-explorer.com</p>
              <p><strong>Телефон:</strong> +7 (XXX) XXX-XX-XX</p>
              <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
