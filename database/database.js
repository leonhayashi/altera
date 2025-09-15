const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Création de la connexion à la base de données
const db = new sqlite3.Database(path.join(__dirname, 'altera.db'), (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données SQLite');
        initDatabase();
    }
});

// Initialisation des tables
function initDatabase() {
    db.serialize(() => {
        // Table des systèmes
        db.run(`CREATE TABLE IF NOT EXISTS systems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            symbol TEXT DEFAULT '⁕',
            description TEXT,
            timezone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Table des membres (alters)
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            system_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            tag TEXT NOT NULL,
            description TEXT,
            age INTEGER,
            age_range TEXT,
            birthday TEXT,
            pronouns TEXT,
            role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (system_id) REFERENCES systems(id)
        )`);

        // Table des switches (front)
        db.run(`CREATE TABLE IF NOT EXISTS switches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            system_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            switched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (system_id) REFERENCES systems(id),
            FOREIGN KEY (member_id) REFERENCES members(id)
        )`);
    });
}

module.exports = db; 