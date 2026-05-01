import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const db = new Database(path.join(__dirname, '../db/database.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS responsaveis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('diacono', 'iop')),
    contato TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS setores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('setor', 'distrito'))
  );

  CREATE TABLE IF NOT EXISTS setores_responsaveis (
    setor_id INTEGER NOT NULL REFERENCES setores(id) ON DELETE CASCADE,
    responsavel_id INTEGER NOT NULL REFERENCES responsaveis(id) ON DELETE CASCADE,
    PRIMARY KEY (setor_id, responsavel_id)
  );

  CREATE TABLE IF NOT EXISTS bairros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    setor_id INTEGER NOT NULL REFERENCES setores(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS familias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    endereco TEXT,
    num_moradores INTEGER,
    num_criancas INTEGER,
    num_idosos INTEGER,
    num_enfermos INTEGER,
    num_batizados INTEGER,
    situacao TEXT CHECK(situacao IN (
      'aposentado',
      'registrado',
      'autonomo',
      'desempregado',
      'encostado',
      'pensionista',
      'do_lar'
    )),
    residencia TEXT CHECK(residencia IN (
      'propria',
      'alugada',
      'cedida',
      'financiada'
    )),
    obs TEXT CHECK(obs IN (
      'congrega',
      'parado',
      'afastado'
    )),
    bairro_id INTEGER NOT NULL REFERENCES bairros(id) ON DELETE CASCADE
  );
`)

export default db
