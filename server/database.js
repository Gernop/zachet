import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

let db = null;

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Создаём директорию для БД если нет
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Загружаем или создаём БД
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Создаём таблицы
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'Диспетчер',
      lastLogin TEXT,
      status TEXT NOT NULL DEFAULT 'Активен'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      passengerName TEXT NOT NULL,
      route TEXT NOT NULL,
      date TEXT,
      time TEXT,
      seats INTEGER DEFAULT 1,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'Ожидание',
      totalPrice REAL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tariffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pricePerKm REAL NOT NULL,
      minPrice REAL NOT NULL DEFAULT 0,
      description TEXT,
      validFrom TEXT,
      validTo TEXT,
      status TEXT NOT NULL DEFAULT 'Активен'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS buses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      plateNumber TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      year INTEGER,
      status TEXT NOT NULL DEFAULT 'В гараже'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      length REAL NOT NULL,
      stops INTEGER NOT NULL,
      travelTime INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'Городской'
    )
  `);

  // Вставляем начальные данные если таблица пустая
  const userCount = db.exec('SELECT COUNT(*) as count FROM users')[0];
  if (userCount.values[0][0] === 0) {
    const hashedPassword1 = bcrypt.hashSync('admin123', 10);
    const hashedPassword2 = bcrypt.hashSync('disp123', 10);
    const hashedPassword3 = bcrypt.hashSync('mgr123', 10);

    db.run(`INSERT INTO users (username, password, name, email, role, lastLogin, status) VALUES
      ('admin', '${hashedPassword1}', 'Администратор', 'admin@buspark.ru', 'Администратор', '2026-04-08 09:15', 'Активен'),
      ('dispatcher', '${hashedPassword2}', 'Диспетров И.С.', 'dispatcher@buspark.ru', 'Диспетчер', '2026-04-07 14:30', 'Активен'),
      ('manager', '${hashedPassword3}', 'Менеджерова А.В.', 'manager@buspark.ru', 'Менеджер', '2026-04-06 11:45', 'Неактивен')
    `);

    db.run(`INSERT INTO bookings (passengerName, route, date, time, seats, phone, status, totalPrice) VALUES
      ('Иванов А.П.', '10', '2026-04-10', '08:00', 2, '+7(999)123-45-67', 'Подтверждено', 120),
      ('Петрова М.С.', '25', '2026-04-10', '09:30', 1, '+7(999)234-56-78', 'Ожидание', 45),
      ('Сидоров В.К.', '42', '2026-04-11', '14:00', 3, '+7(999)345-67-89', 'Подтверждено', 270),
      ('Козлова Е.А.', '105', '2026-04-12', '06:00', 1, '+7(999)456-78-90', 'Отменено', 0),
      ('Новиков Д.И.', '7', '2026-04-12', '10:15', 2, '+7(999)567-89-01', 'Подтверждено', 90)
    `);

    db.run(`INSERT INTO tariffs (name, pricePerKm, minPrice, description, validFrom, validTo, status) VALUES
      ('Городской', 3.5, 35, 'Городские маршруты до 20 км', '2026-01-01', '2026-12-31', 'Активен'),
      ('Пригородный', 4.2, 50, 'Пригородные маршруты 20-50 км', '2026-01-01', '2026-12-31', 'Активен'),
      ('Межгород', 5.8, 150, 'Межгородские маршруты от 50 км', '2026-01-01', '2026-12-31', 'Активен'),
      ('Льготный', 1.75, 20, 'Для льготных категорий граждан', '2026-01-01', '2026-12-31', 'Активен')
    `);

    db.run(`INSERT INTO buses (model, plateNumber, capacity, year, status) VALUES
      ('ЛиАЗ-5292', 'А123БВ77', 80, 2020, 'На линии'),
      ('НефАЗ-5299', 'В456ГД77', 90, 2019, 'В гараже'),
      ('МАЗ-206', 'Е789ЖЗ77', 100, 2021, 'На линии'),
      ('ЛиАЗ-6213', 'И012КЛ77', 85, 2018, 'На ремонте'),
      ('КАВЗ-4238', 'М345НО77', 50, 2022, 'На линии')
    `);

    db.run(`INSERT INTO routes (number, name, length, stops, travelTime, type) VALUES
      ('10', 'Вокзал - Центр - Микрорайон', 12.5, 18, 45, 'Городской'),
      ('25', 'Автопарк - Больница - Рынок', 8.3, 14, 35, 'Городской'),
      ('42', 'Пос. Северный - Школа - ТЦ Мега', 15.7, 22, 55, 'Пригородный'),
      ('105', 'Автостанция - Дер. Ивановка', 35.2, 12, 75, 'Межгород'),
      ('7', 'Ж/Д станция - Парк - Университет', 10.1, 16, 40, 'Городской')
    `);
  }

  saveDatabase();
  console.log('✅ База данных инициализирована');
}

function saveDatabase() {
  if (db) {
    const buffer = db.export();
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function getDb() {
  if (!db) {
    throw new Error('База данных не инициализирована');
  }
  return db;
}

export function saveDb() {
  saveDatabase();
}
