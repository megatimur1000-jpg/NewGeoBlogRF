const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем production сборку...');

try {
  // 1. Очистка предыдущей сборки
  console.log('🧹 Очистка предыдущей сборки...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 2. Установка зависимостей
  console.log('📦 Установка зависимостей...');
  execSync('npm ci --production=false', { stdio: 'inherit' });

  // 3. TypeScript проверка
  console.log('🔍 Проверка TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });

  // 4. Линтинг
  console.log('🔧 Проверка линтера...');
  execSync('npx eslint src --ext .ts,.tsx --max-warnings 0', { stdio: 'inherit' });

  // 5. Сборка
  console.log('🏗️ Сборка приложения...');
  execSync('npm run build', { stdio: 'inherit' });

  // 6. Проверка размера бандла
  console.log('📊 Анализ размера бандла...');
  const distPath = path.join(__dirname, 'dist');
  const files = fs.readdirSync(distPath, { recursive: true });
  
  let totalSize = 0;
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.statSync(filePath).isFile()) {
      totalSize += fs.statSync(filePath).size;
    }
  });

  console.log(`📦 Общий размер сборки: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // 7. Создание production манифеста
  const manifest = {
    name: 'Best Site',
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    buildSize: totalSize,
    environment: 'production'
  };

  fs.writeFileSync(
    path.join(distPath, 'build-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✅ Production сборка завершена успешно!');
  console.log('📁 Файлы сборки находятся в папке dist/');
  console.log('🚀 Готово к деплою!');

} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
}
