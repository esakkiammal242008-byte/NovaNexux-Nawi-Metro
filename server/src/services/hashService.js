import crypto from 'node:crypto'
export function hashReportData(data) { return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex') }
export function verifyReportHash(data, storedHash) { const actual=hashReportData(data); return { actualHash:actual, verified:crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(storedHash)) } }
