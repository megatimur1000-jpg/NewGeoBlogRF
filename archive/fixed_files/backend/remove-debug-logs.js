const fs = require('fs');
const path = require('path');

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Пропускаем node_modules, dist, logs
      if (file !== 'node_modules' && file !== 'dist' && file !== 'logs' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Функция для удаления console.log из файла
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
// SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original: // SONAR-AUTO-FIX (javascript:S1854): original: // SONAR-AUTO-FIX (javascript:S1481): original:     let originalContent = content;
    
    // Удаляем различные типы console.log, но оставляем критические ошибки
    const patterns = [
      // console.log(...) - удаляем все
      /console\.log\([^)]*\);?\s*\n?/g,
      // console.warn(...) - удаляем все
      /console\.warn\([^)]*\);?\s*\n?/g,
      // console.error(...) - оставляем только критические
      /console\.error\([^)]*\);?\s*\n?(?!.*critical|.*fatal|.*error.*critical|.*server.*error)/g,
      // console.debug(...)
      /console\.debug\([^)]*\);?\s*\n?/g,
      // console.info(...)
      /console\.info\([^)]*\);?\s*\n?/g,
      // console.trace(...)
      /console\.trace\([^)]*\);?\s*\n?/g,
      // console.table(...)
      /console\.table\([^)]*\);?\s*\n?/g,
      // console.group(...)
      /console\.group\([^)]*\);?\s*\n?/g,
      // console.groupEnd(...)
      /console\.groupEnd\([^)]*\);?\s*\n?/g,
      // console.time(...)
      /console\.time\([^)]*\);?\s*\n?/g,
      // console.timeEnd(...)
      /console\.timeEnd\([^)]*\);?\s*\n?/g,
      // console.count(...)
      /console\.count\([^)]*\);?\s*\n?/g,
      // console.clear(...)
      /console\.clear\([^)]*\);?\s*\n?/g,
    ];
    
    let hasChanges = false;
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    // Удаляем пустые строки, оставшиеся после удаления console.log
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Очищен файл: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Ошибка при обработке файла ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🔍 Поиск файлов с отладочными логами в backend...');
  
  const srcDir = path.join(__dirname);
  const extensions = ['.js', '.ts', '.mjs'];
  
  const files = findFiles(srcDir, extensions);
  console.log(`📁 Найдено ${files.length} файлов для проверки`);
  
  let cleanedFiles = 0;
  let totalFiles = files.length;
  
  files.forEach(file => {
    if (removeConsoleLogs(file)) {
      cleanedFiles++;
    }
  });
  
  console.log(`\n📊 Результаты очистки backend:`);
  console.log(`   Всего файлов: ${totalFiles}`);
  console.log(`   Очищено файлов: ${cleanedFiles}`);
  console.log(`   Без изменений: ${totalFiles - cleanedFiles}`);
  
  if (cleanedFiles > 0) {
    console.log(`\n✅ Успешно удалены отладочные логи из ${cleanedFiles} файлов!`);
  } else {
    console.log(`\n✅ Отладочные логи не найдены или уже удалены.`);
  }
}

// Запуск
main();



