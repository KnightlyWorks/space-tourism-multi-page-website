import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// Игнорируем папки, которые не должны проверяться
const IGNORED_DIRS = ["node_modules", ".git", "dist"];

// Проверяемые расширения файлов
const VALID_EXTENSIONS = [".html", ".js", ".json", ".css"];

// === Получаем все файлы проекта ===
function getAllFiles(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir)) {
        if (IGNORED_DIRS.includes(entry)) continue;
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            files = files.concat(getAllFiles(fullPath));
        } else if (VALID_EXTENSIONS.includes(path.extname(entry))) {
            files.push(fullPath);
        }
    }
    return files;
}

// === Проверка относительного пути ===
function checkPath(baseFile, relPath) {
    // убираем query-параметры и хэши
    const cleanPath = relPath.split(/[?#]/)[0];
    // разрешаем путь относительно корня проекта
    const resolved = path.resolve(path.dirname(baseFile), cleanPath);
    return fs.existsSync(resolved);
}

// === Регулярка для поиска локальных ресурсов ===
const LOCAL_PATH_REGEX =
/(?:src|href|url)\s*=\s*["'`]([^"'`]+)["'`]|import\s+["'`]([^"'`]+)["'`]/g;

// === Основная проверка ===
function checkPaths() {
    const files = getAllFiles(ROOT);
    const broken = [];

    for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        let match;
        while ((match = LOCAL_PATH_REGEX.exec(content))) {
            const relPath = match[1] || match[2];
            if (!relPath) continue;

            // пропускаем внешние ссылки и специальные протоколы
            if (
                relPath.startsWith("http") ||
                relPath.startsWith("https") ||
                relPath.startsWith("data:") ||
                relPath.startsWith("mailto:") ||
                relPath.startsWith("#")
            )
                continue;

                // проверяем путь
                if (!checkPath(file, relPath)) {
                    // приводим путь относительно корня проекта
                    const relativeToRoot = path.relative(ROOT, path.resolve(path.dirname(file), relPath));
                    broken.push({ file: path.relative(ROOT, file), path: relativeToRoot });
                }
        }
    }

    if (broken.length === 0) {
        console.log("✅ Все локальные пути корректны!");
    } else {
        console.log("⚠️ Найдены битые пути:\n");
        broken.forEach(b => console.log(`- ${b.file} → ${b.path}`));
    }
}

checkPaths();
