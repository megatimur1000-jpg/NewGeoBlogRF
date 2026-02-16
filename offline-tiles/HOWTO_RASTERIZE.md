# Инструкция: перенарезка векторных тайлов (PBF) → растровые (PNG)

## Проблема
Ваши MBTiles файлы содержат **векторные тайлы** (формат PBF/MVT), сгенерированные OpenMapTiles или подобным инструментом.
Для отображения через Leaflet нужны **растровые** тайлы (PNG).

## 📋 Предварительный чеклист

Перед началом — выполните этот быстрый чеклист. Он пригодится для контроля на каждом этапе и для быстрого отката.

- [ ] 1. Подготовка: версии, место на диске, резервная копия исходного MBTiles
- [ ] 2. Валидация исходных данных: формат, metadata, bounds/zoom
- [ ] 3. Выбор метода: tileserver‑gl (основной) / Mapnik/MapTiler (резервный)
- [ ] 4. Настройка tileserver‑gl: запустить, проверить стиль (/styles.json)
- [ ] 5. Генерация тайлов: логирование, мониторинг, возможность возобновления
- [ ] 6. Проверка результатов: целостность, формат, случайные проверки
- [ ] 7. Упаковка: создать MBTiles (png) и проверить metadata
- [ ] 8. Интеграция: заменить MBTiles в проекте и тестировать
- [ ] 9. Откат: иметь готовую резервную копию и шаги отката

### 📝 Итоговый чеклист перед финальной версией
- [ ] Остановить Docker контейнер `tileserver` после генерации (если не нужен):
  - `docker stop tileserver && docker rm tileserver`
  - или `docker-compose -f docker-compose.tiles.yml down`
- [ ] Проверить формат исходного MBTiles (ожидаем `pbf`/`mvt` для вектора):
  - `sqlite3 vla.mbtiles "SELECT value FROM metadata WHERE name='format';"`
- [ ] Логирование: убедиться, что `generate_tiles.py` пишет лог в `generate_tiles.log` (встроено в скрипт).
- [ ] Проверить, что `tileserver` успешно запущен и отвечает:
  - `curl -f http://localhost:8080/styles.json` (код 0 → OK)
  - или `docker ps --filter name=tileserver --format "{{.Names}} {{.Status}}"`
- [ ] Предупреждение о потреблении памяти: `tileserver-gl` и массовая выгрузка могут потреблять значительную RAM (рекомендуемо 2–4+ GB для тяжёлых стилей). Мониторьте через `docker stats tileserver` или `htop`.
- [ ] (Опционально) Проверка свободного места: `df -h /path/to/output` или PowerShell `Get-PSDrive -PSProvider FileSystem`.
- [ ] (Опционально) Прогресс‑бар: при желании включите `tqdm` (`pip3 install tqdm`) — скрипт поддерживает это.

---

## 1. Подготовка
- Быстрая проверка версий:
  ```bash
  docker --version; node -v; python3 -V; pip3 -V; sqlite3 --version
  ```
- Проверка свободного места и RAM:
  - Linux/macOS: `df -h /path/to/output`
  - Windows (PowerShell): `Get-PSDrive -PSProvider FileSystem`
- Резервная копия исходного MBTiles:
  ```bash
  cp offline-tiles/vla.mbtiles offline-tiles/vla.mbtiles.bak
  # или PowerShell:
  Copy-Item offline-tiles\vla.mbtiles offline-tiles\vla.mbtiles.bak
  ```
- Рекомендация: оставьте +20% свободного места для временных PNG.

## 2. Валидация исходных данных
- Быстрые проверки metadata и структуры:
  ```bash
  sqlite3 vla.mbtiles "SELECT name,value FROM metadata;"
  sqlite3 vla.mbtiles "SELECT zoom_level, COUNT(*) FROM tiles GROUP BY zoom_level;"
  ```
- Убедиться, что исходный тип — вектор (pbf/mvt). Если `format` отсутствует или указан `pbf`, продолжайте.
- Проверьте `bounds`, `minzoom`/`maxzoom` и скорректируйте область загрузки в скрипте.

## 3. Выбор метода конвертации
- Основной: `tileserver-gl` + массовая выгрузка PNG (используется в этом HOWTO).
- Резервный: Mapnik/TileLive/MapTiler — использовать если стиль не поддерживается tileserver-gl.
- Критерии выбора: совместимость стиля, доступность инфраструктуры, время выполнения.

## 4. Настройка tileserver-gl
- Запуск (пример в документе) и проверка доступных стилей:
  ```bash
  curl http://localhost:8080/styles.json
  ```
- Подставьте точное имя стиля в переменную `STYLE` у скрипта.
- Для продакшена можно настроить `Cache-Control`/gzip/headers в конфигурации сервера.

## 5. Генерация тайлов
- Используйте устойчивый скрипт с retries/timeout и пропуском существующих файлов — позволяет возобновлять процесс. Скрипт теперь поддерживает логирование в `generate_tiles.log`, опциональную проверку свободного места (`CHECK_DISK_SPACE`) и прогресс‑бар (`tqdm`).
- Запуск с логированием и в фоне:
  ```bash
  python3 generate_tiles.py 2>&1 | tee generate_tiles.log
  # или (PowerShell)
  python generate_tiles.py *>&1 | Tee-Object -FilePath generate_tiles.log
  ```
- Установите дополнительные зависимости (если используете прогресс‑бар): `pip3 install requests tqdm`.
- Мониторинг: следите за `generate_tiles.log` и за выводом скрипта (статистика OK/MISSING/ERR).
- Если прервано — перезапустите тот же скрипт (он продолжит, пропуская уже скачанные).

## 6. Проверка результатов
- Проверка metadata MBTiles и формата:
  ```bash
  sqlite3 vla-raster.mbtiles "SELECT name,value FROM metadata;"
  ```
  Ожидаем: `format = png`.
- Подсчёт тайлов по zoom:
  ```bash
  sqlite3 vla-raster.mbtiles "SELECT zoom_level, COUNT(*) FROM tiles GROUP BY zoom_level ORDER BY zoom_level;"
  ```
- Случайная выборка тайлов (проверка HTTP и содержимого):
  ```bash
  curl -f http://localhost:8080/styles/<STYLE>/12/2048/1365.png -o /dev/null
  python3 -c "from PIL import Image; Image.open('path/to/sample.png').verify()"
  ```

## 7. Упаковка в MBTiles
- Собрать MBTiles (mb-util):
  ```bash
  pip3 install mbutil
  mb-util /path/to/output/vla-png /path/to/output/vla-raster.mbtiles --image_format=png --scheme=xyz
  ```
- Проверить/записать metadata (`format`, `bounds`, `minzoom`, `maxzoom`, `center`).

## 8. Интеграция и финальная проверка
- Сделайте бекап текущего mbtiles и замену:
  ```bash
  cp offline-tiles/vla.mbtiles offline-tiles/vla.mbtiles.pre-raster
  cp vla-raster.mbtiles offline-tiles/vla.mbtiles
  ```
- Перезапустите бекенд и проверьте:
  ```bash
  SKIP_DB=true node backend/server.js
  curl http://localhost:3002/api/tiles/vla/metadata | jq .format
  # ожидаем: "png"
  ```
- Проверьте визуально на `http://localhost:3002/test-tiles.html`.

# Post‑run: остановка tileserver (опционально)
Если после генерации вы не хотите держать `tileserver` запущенным — остановите контейнер:
```bash
docker stop tileserver && docker rm tileserver
# или (docker‑compose)
docker-compose -f docker-compose.tiles.yml down
```

## 9. Откат при ошибках
- Откат к предыдущему MBTiles:
  ```bash
  mv offline-tiles/vla.mbtiles.pre-raster offline-tiles/vla.mbtiles
  # или PowerShell:
  Move-Item offline-tiles\vla.mbtiles.pre-raster offline-tiles\vla.mbtiles
  ```
- Перезапустите сервисы и проверьте работоспособность.
- Анализ логов: `generate.log`, системные логи и `tileserver` stdout/stderr.

---

## 🧪 Быстрый тест
- Скачать готовый MBTiles или сгенерировать тестовый (инструкция ниже в файле).
- Копировать MBTiles в `offline-tiles` и запустить бэкенд для проверки.

## Автоматизация и тестирование (systemd / PowerShell / CI)
Ниже — готовые примеры для фоновой генерации, автоматизации на Windows и простого CI‑smoke теста.

### Systemd unit — фоновая генерация (Linux)
Создайте файл `/etc/systemd/system/tiles-generate.service`:

```ini
[Unit]
Description=Generate raster tiles (PBF→PNG)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/tiles
ExecStart=/usr/bin/python3 /srv/tiles/generate_tiles.py
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Команды управления:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tiles-generate.service
sudo journalctl -u tiles-generate.service -f
```

Совет: укажите `User=` с учётом прав доступа к `OUTPUT_DIR` и MBTiles.

### PowerShell‑скрипт‑обёртка для Windows
Файл `generate-tiles.ps1` — запускает генерацию, валидацию и копирует MBTiles в `offline-tiles`:

```powershell
param(
  [string] $OutputMb = "vla-raster.mbtiles",
  [string] $ProjectOffline = "D:\newgeoblogrf\offline-tiles"
)
# Запуск генерации (логируется)
python .\generate_tiles.py 2>&1 | Tee-Object -FilePath generate.log

# Проверка наличия результата
if (-not (Test-Path $OutputMb)) { Write-Error "MBTiles not found: $OutputMb"; exit 1 }

# Проверка metadata.format (если sqlite3 в PATH)
$sqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue
if ($sqlite) {
  $fmt = & sqlite3 $OutputMb "SELECT value FROM metadata WHERE name='format';"
  if ($fmt -ne 'png') { Write-Error "Bad format: $fmt"; exit 2 }
} else {
  # fallback: Python проверка
  python - <<'PY'
import sqlite3
db=sqlite3.connect('" + $OutputMb + "')
cur=db.execute("SELECT value FROM metadata WHERE name='format'")
row=cur.fetchone()
if not row or row[0] != 'png':
    raise SystemExit('format-check-failed')
print('format=png')
PY
}

# Копируем в проект с бэкапом
$dest = Join-Path $ProjectOffline 'vla.mbtiles'
if (Test-Path $dest) { Copy-Item $dest ($dest + '.pre-raster') -Force }
Move-Item -Path $OutputMb -Destination $dest -Force
Write-Output "Deployed: $dest"
```

Запуск (PowerShell):
```powershell
.\generate-tiles.ps1 -OutputMb 'vla-raster.mbtiles' -ProjectOffline 'D:\newgeoblogrf\offline-tiles'
```

### CI smoke‑test — проверка metadata.format == 'png'
Скрипт `check-mbtiles-format.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
MB=$1
fmt=$(sqlite3 "$MB" "SELECT value FROM metadata WHERE name='format';")
if [ "$fmt" != "png" ]; then
  echo "Unexpected format: $fmt" >&2
  exit 1
fi
echo "OK: format=png"
```

Пример GitHub Actions job (`.github/workflows/check-mbtiles.yml`):

```yaml
name: MBTiles smoke
on: [push, pull_request]
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run format check
        run: |
          chmod +x ./scripts/check-mbtiles-format.sh
          ./scripts/check-mbtiles-format.sh offline-tiles/vla.mbtiles
```

---

## Решение: tileserver-gl на Ubuntu


### 1. Установка tileserver-gl

```bash
# Через Docker (рекомендуется)
docker pull maptiler/tileserver-gl

# Пример запуска (Linux / macOS)
docker run --rm -it \
  -v /path/to/your/tiles:/data \
  -p 8080:8080 \
  maptiler/tileserver-gl \
  --file /data/vla.mbtiles

# Пример запуска на Windows (Docker Desktop / PowerShell).
# Можно монтировать путь вида `d:/...` или использовать WSL путь `/mnt/d/...`
docker run --rm -it \
  -v d:/newgeoblogrf/offline-tiles:/data \
  -p 8080:8080 \
  maptiler/tileserver-gl \
  --file /data/vla.mbtiles

# Или (WSL2):
# docker run --rm -it -v /mnt/d/newgeoblogrf/offline-tiles:/data -p 8080:8080 maptiler/tileserver-gl --file /data/vla.mbtiles

# Короткий docker-compose (опционально)
cat > docker-compose.tiles.yml <<'YAML'
version: "3.7"
services:
  tileserver:
    image: maptiler/tileserver-gl
    volumes:
      - ./offline-tiles:/data:ro
    ports:
      - "8080:8080"
    command: ["--file", "/data/vla.mbtiles"]
YAML

# Или через npm (если нет Docker)
npm install -g tileserver-gl
```

### 2. Генерация PNG тайлов из PBF

#### Вариант A: Через Docker + tileserver-gl (рекомендуется)

```bash
# Запуск tileserver-gl с вашим MBTiles
docker run --rm -it \
  -v /path/to/your/tiles:/data \
  -p 8080:8080 \
  maptiler/tileserver-gl \
  --file /data/vla.mbtiles

# После запуска откройте http://localhost:8080 — там будет превью карты
# tileserver-gl автоматически рендерит PNG из PBF
# URL тайлов (пример): http://localhost:8080/styles/basic-preview/{z}/{x}/{y}.png
#
# Проверьте доступные стили и точное имя стиля:
#   curl http://localhost:8080/styles.json
# Используйте полученное имя стиля в переменной `STYLE` в скрипте.
```

#### Вариант B: Массовая генерация PNG через tileserver-gl + скрипт (Оптимизированный)

Этот вариант использует многопоточность для ускорения загрузки в 10-20 раз.

```bash
# 1. Запустите tileserver-gl (если еще не запущен)
docker run -d --name tileserver \
  -v /path/to/tiles:/data \
  -p 8080:8080 \
  maptiler/tileserver-gl \
  --file /data/vla.mbtiles

# 2. Скачайте все тайлы в PNG (Многопоточный скрипт — устойчивый, с retries и таймаутом)
# Требуется: pip3 install requests
python3 << 'EOF'
import os
import math
import time
import sys
import shutil
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# Настройки
TILESERVER = "http://localhost:8080"
STYLE = "basic-preview"  # Проверьте точное имя через /styles.json
OUTPUT_DIR = "/path/to/output/vla-png"
THREADS = 20  # Рекомендация: 10-30 в зависимости от CPU/сети

# Из метаданных вашего MBTiles:
MIN_ZOOM = 4
MAX_ZOOM = 12
# bounds: west, south, east, north
BOUNDS = (35.045065, 54.270611, 48.982268, 57.90209)

# Дополнительные опции
CHECK_DISK_SPACE = False   # включите при желании
MIN_FREE_GB = 5

TIMEOUT = 10
MAX_RETRIES = 3
BACKOFF_FACTOR = 0.3
LOGFILE = 'generate_tiles.log'

# Логирование в файл и на stdout
logging.basicConfig(filename=LOGFILE, level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

# HTTP session с retry
session = requests.Session()
retries = Retry(total=MAX_RETRIES, backoff_factor=BACKOFF_FACTOR,
                status_forcelist=(429, 500, 502, 503, 504), allowed_methods=("GET",))
session.mount('http://', HTTPAdapter(max_retries=retries))

# Опциональная проверка свободного места
def check_disk_space(path, min_free_gb=MIN_FREE_GB):
    try:
        total, used, free = shutil.disk_usage(path)
        free_gb = free / (1024 ** 3)
        logging.info(f"Free space at {path}: {free_gb:.2f} GB")
        return free_gb >= min_free_gb
    except Exception as e:
        logging.warning(f"Disk check failed: {e}")
        return False

# Ожидание готовности tileserver
def wait_for_tileserver(timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = session.get(f"{TILESERVER}/styles.json", timeout=5)
            if r.status_code == 200:
                logging.info('Tileserver доступен')
                return True
        except Exception:
            time.sleep(1)
    logging.error('Tileserver не ответил в течение таймаута')
    return False

# Проверки перед началом
if CHECK_DISK_SPACE and not check_disk_space(OUTPUT_DIR):
    logging.error(f"Недостаточно места в {OUTPUT_DIR} (требуется >= {MIN_FREE_GB} GB)")
    sys.exit(2)

if not wait_for_tileserver(30):
    logging.error('Tileserver не готов — прерывание')
    sys.exit(3) 

def lon2tile(lon, z):
    return int((lon + 180.0) / 360.0 * (1 << z))

def lat2tile(lat, z):
    lat_rad = math.radians(lat)
    return int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * (1 << z))

def download_tile(z, x, y):
    url = f"{TILESERVER}/styles/{STYLE}/{z}/{x}/{y}.png"
    outdir = os.path.join(OUTPUT_DIR, str(z), str(x))
    outfile = os.path.join(outdir, f"{y}.png")

    if os.path.exists(outfile):
        return ("SKIP", z, x, y)

    try:
        os.makedirs(outdir, exist_ok=True)
        resp = session.get(url, timeout=TIMEOUT, stream=True)
        if resp.status_code == 404:
            return ("MISSING", z, x, y)
        resp.raise_for_status()
        with open(outfile, 'wb') as f:
            for chunk in resp.iter_content(4096):
                if chunk:
                    f.write(chunk)
        return ("OK", z, x, y)
    except Exception as e:
        return ("ERR", z, x, y, str(e))

def main():
    tasks = []
    west, south, east, north = BOUNDS

    # Генерация списка задач
    for z in range(MIN_ZOOM, MAX_ZOOM + 1):
        x_min = lon2tile(west, z)
        x_max = lon2tile(east, z)
        y_min = lat2tile(north, z)  # north → меньший y
        y_max = lat2tile(south, z)  # south → больший y

        print(f"Zoom {z}: диапазон X[{x_min}-{x_max}], Y[{y_min}-{y_max}]")

        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tasks.append((z, x, y))

    total_tasks = len(tasks)
    logging.info(f"Всего тайлов для скачивания: {total_tasks}")
    logging.info(f"Запуск загрузки с {THREADS} потоками... (лог: {LOGFILE})")

    stats = {"OK":0, "SKIP":0, "MISSING":0, "ERR":0} 
    with ThreadPoolExecutor(max_workers=THREADS) as executor:
        futures = {executor.submit(download_tile, z, x, y): (z, x, y) for (z, x, y) in tasks}
        for i, future in enumerate(tqdm(as_completed(futures), total=total_tasks, desc='tiles'), 1):
            result = future.result()
            status = result[0]
            stats[status] = stats.get(status, 0) + 1

            # Прогресс и краткая статистика
            if i % 100 == 0 or i == total_tasks:
                logging.info(f"Прогресс: {i}/{total_tasks} — OK:{stats['OK']} SKIP:{stats['SKIP']} MISS:{stats['MISSING']} ERR:{stats['ERR']}")

    logging.info(f"Готово! Статистика: {stats}")

if __name__ == '__main__':
    main()
EOF

# 3. Упаковка обратно в MBTiles (PNG формат)
# Нужен mb-util:
pip3 install mbutil

# Создаём MBTiles из директории тайлов
mb-util /path/to/output/vla-png /path/to/output/vla-raster.mbtiles --image_format=png --scheme=xyz

Примечание: MBTiles в таблице `tiles` использует TMS‑нумерацию `tile_row`. Утилита `mb-util --scheme=xyz` создаёт MBTiles, совместимые с Leaflet/tileserver (XYZ). Если вы вставляете тайлы вручную — инвертируйте Y:

```
# Проверить metadata и количество тайлов по zoom
sqlite3 /path/to/output/vla-raster.mbtiles "SELECT name,value FROM metadata;"
sqlite3 /path/to/output/vla-raster.mbtiles "SELECT zoom_level, COUNT(*) FROM tiles GROUP BY zoom_level ORDER BY zoom_level;"
# При необходимости принудительно установить формат
sqlite3 /path/to/output/vla-raster.mbtiles "INSERT OR REPLACE INTO metadata (name, value) VALUES ('format','png');"
```
```

#### Вариант C: Через OpenMapTiles (если есть исходные данные)

Если у вас есть исходные данные OpenStreetMap (osm.pbf), можно сгенерировать растровые тайлы напрямую:

```bash
# Используем tippecanoe + magnacarto или аналог
# Это более сложный путь, рекомендуется Вариант A или B
```

### 3. Замена файлов

После генерации PNG MBTiles:

```bash
# Замените файлы в проекте
cp vla-raster.mbtiles /path/to/project/offline-tiles/vla.mbtiles
cp vlacity-raster.mbtiles /path/to/project/offline-tiles/vlacity.mbtiles
```

### 4. Проверка

```bash
# Запустите бэкенд
cd backend
SKIP_DB=true node server.js

# Откройте тестовую страницу
# http://localhost:3002/test-tiles.html

# Проверьте метаданные (формат должен быть png)
curl http://localhost:3002/api/tiles/vla/metadata | jq .format
# Ожидаем: "png"

# Локальные проверки MBTiles (в папке проекта)
# (путь может отличаться; от `backend` используйте ../offline-tiles/...)
sqlite3 ../offline-tiles/vla.mbtiles "SELECT name,value FROM metadata;"
sqlite3 ../offline-tiles/vla.mbtiles "SELECT zoom_level, COUNT(*) FROM tiles GROUP BY zoom_level ORDER BY zoom_level;"

# Если metadata.format не 'png', исправьте:
sqlite3 ../offline-tiles/vla.mbtiles "INSERT OR REPLACE INTO metadata (name, value) VALUES ('format','png');"
```

## Параметры тайлсетов

### vla (Владимирская область)
- **Bounds**: 35.05, 54.27, 48.98, 57.90
- **Zoom**: 4-12
- **Назначение**: общий обзор региона

### vlacity (город Владимир)
- **Bounds**: 35.05, 55.40, 42.12, 57.90
- **Zoom**: 8-16  
- **Назначение**: детальная карта столицы региона

## Рекомендации по нарезке остальных регионов

При нарезке тайлов для других регионов используйте:

```bash
# Формат: PNG (не PBF!)
# Рекомендуемые zoom-уровни:
#   Область: 4-12 (обзор)
#   Город:   8-16 (детальный)
#
# Размер оценка:
#   Zoom 4-12, один регион: ~100-200 МБ (PNG)
#   Zoom 8-16, один город:  ~50-150 МБ (PNG)
```

### Частые проблемы и советы
- 404 на тайлы → проверьте точное имя `STYLE` (curl /styles.json) и `minzoom/maxzoom` в metadata. ⚠️
- Порт 8080 занят → используйте другой порт в `-p` или остановите процесс.
- Проблемы с монтированием в Docker на Windows → используйте `d:/path` или WSL путь `/mnt/d/...`, проверьте права доступа к папке.
- Большое количество потоков → уменьшите `THREADS`, если видите таймауты/ошибки сети.
- Формат в metadata не `png` → исправьте через sqlite3 (см. выше).

## Быстрый тест (без перенарезки) 

Если хотите быстро проверить, что tile server работает, можно скачать готовые PNG тайлы:

```bash
# Скачать тестовые растровые тайлы России (OpenStreetMap)
wget -O /path/to/offline-tiles/test-osm.mbtiles \
  "https://download.maptiler.com/osm/planet_z0-z5_2023.mbtiles"
```

Или сгенерировать маленький тестовый MBTiles через Python:

```bash
pip install Pillow
python3 -c "
import sqlite3, io
from PIL import Image, ImageDraw, ImageFont

db = sqlite3.connect('test-raster.mbtiles')
db.execute('CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT)')
db.execute('CREATE TABLE IF NOT EXISTS tiles (zoom_level INTEGER, tile_column INTEGER, tile_row INTEGER, tile_data BLOB)')
db.execute(\"INSERT INTO metadata VALUES ('format', 'png')\")
db.execute(\"INSERT INTO metadata VALUES ('bounds', '39.5,55.5,41.5,56.8')\")
db.execute(\"INSERT INTO metadata VALUES ('center', '40.4,56.1,10')\")
db.execute(\"INSERT INTO metadata VALUES ('minzoom', '8')\")
db.execute(\"INSERT INTO metadata VALUES ('maxzoom', '12')\")
db.execute(\"INSERT INTO metadata VALUES ('name', 'test-raster')\")
db.execute(\"INSERT INTO metadata VALUES ('description', 'Test raster tileset')\")

# Генерируем несколько тестовых тайлов (цветные квадраты с координатами)
import math
for z in range(8, 13):
    x_min = int((39.5 + 180) / 360 * (1 << z))
    x_max = int((41.5 + 180) / 360 * (1 << z))
    y_min_slippy = int((1 - math.asinh(math.tan(math.radians(56.8))) / math.pi) / 2 * (1 << z))
    y_max_slippy = int((1 - math.asinh(math.tan(math.radians(55.5))) / math.pi) / 2 * (1 << z))
    for x in range(x_min, x_max + 1):
        for y in range(y_min_slippy, y_max_slippy + 1):
            img = Image.new('RGBA', (256, 256), (59, 130, 246, 40))
            draw = ImageDraw.Draw(img)
            draw.rectangle([0, 0, 255, 255], outline=(59, 130, 246, 120), width=1)
            draw.text((10, 10), f'{z}/{x}/{y}', fill=(255, 255, 255, 200))
            buf = io.BytesIO()
            img.save(buf, 'PNG')
            tms_y = (1 << z) - 1 - y  # convert Slippy Y -> TMS Y for MBTiles
            db.execute('INSERT INTO tiles VALUES (?, ?, ?, ?)', (z, x, tms_y, buf.getvalue()))

db.commit()
db.close()
print('Создан test-raster.mbtiles')
"
# Скопируйте в offline-tiles/
# Linux/macOS:
mv test-raster.mbtiles /путь/к/проекту/offline-tiles/

# Windows (PowerShell):
Move-Item test-raster.mbtiles d:\path\to\project\offline-tiles\

# Примечание: на Windows адаптируйте путь (например, замените `d:\path\to\project` на ваш реальный путь).
```