import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')
const dbFile = process.env.DATABASE_PATH ? path.resolve(root, process.env.DATABASE_PATH) : path.join(root, 'data', 'novanexus.sqlite')
fs.mkdirSync(path.dirname(dbFile), { recursive: true })
export const db = new Database(dbFile)
db.pragma('foreign_keys = ON')
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'tester',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);CREATE TABLE IF NOT EXISTS instruments (id TEXT PRIMARY KEY,manufacturer TEXT NOT NULL,model TEXT NOT NULL,serial_number TEXT NOT NULL UNIQUE,capacity TEXT NOT NULL,minimum_capacity TEXT,verification_scale_interval TEXT NOT NULL,accuracy_class TEXT NOT NULL,location TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'ACTIVE',created_by INTEGER,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(created_by) REFERENCES users(id));CREATE TABLE IF NOT EXISTS tests (id TEXT PRIMARY KEY,instrument_id TEXT NOT NULL,test_type TEXT NOT NULL,temperature REAL,humidity REAL,tester_id INTEGER NOT NULL,result TEXT NOT NULL DEFAULT 'REVIEW',status TEXT NOT NULL DEFAULT 'IN_PROGRESS',remarks TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(instrument_id) REFERENCES instruments(id),FOREIGN KEY(tester_id) REFERENCES users(id));CREATE TABLE IF NOT EXISTS test_readings (id INTEGER PRIMARY KEY AUTOINCREMENT,test_id TEXT NOT NULL,test_point TEXT NOT NULL,reference_value REAL NOT NULL,indicated_value REAL NOT NULL,permissible_error REAL NOT NULL,error REAL NOT NULL,absolute_error REAL NOT NULL,result TEXT NOT NULL,source TEXT NOT NULL DEFAULT 'MANUAL',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE);CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY,test_id TEXT NOT NULL UNIQUE,report_data TEXT NOT NULL,sha256_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(test_id) REFERENCES tests(id));CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT,level TEXT NOT NULL,message TEXT NOT NULL,acknowledged INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT,timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,user_id INTEGER,action TEXT NOT NULL,entity TEXT NOT NULL,details TEXT,FOREIGN KEY(user_id) REFERENCES users(id));`)
try { db.exec('ALTER TABLE instruments ADD COLUMN next_verification TEXT') } catch (error) { if (!String(error.message).includes('duplicate column')) throw error }
const users = [{ email:'admin@novanexus.com', password:'Admin@123', role:'admin' }, { email:'tester@novanexus.com', password:'Tester@123', role:'tester' }]
const addUser = db.prepare('INSERT OR IGNORE INTO users (email,password_hash,role) VALUES (?,?,?)')
for (const user of users) addUser.run(user.email, bcrypt.hashSync(user.password, 12), user.role)
const count = db.prepare('SELECT COUNT(*) AS count FROM instruments').get().count
if (!count) db.prepare('INSERT INTO instruments (id,manufacturer,model,serial_number,capacity,minimum_capacity,verification_scale_interval,accuracy_class,location,status,next_verification) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run('NAWI-001','Mettler Toledo','IND360','MT-88421','30 kg','200 g','5 g','III','Lab A / Bay 02','ACTIVE','2026-09-10')
if (!db.prepare('SELECT COUNT(*) AS count FROM alerts').get().count) db.prepare('INSERT INTO alerts (level,message) VALUES (?,?)').run('INFO','NovaNexus API connected to the local SQLite workspace.')
export function audit(userId, action, entity, details) { db.prepare('INSERT INTO audit_logs (user_id,action,entity,details) VALUES (?,?,?,?)').run(userId || null, action, entity, details || null) }
export default db
