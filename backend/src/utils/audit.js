import { AuditLog } from '../models/Records.js';

export async function writeAudit(req, action, entity, entityId, previousValue, newValue) {
  await AuditLog.create({
    user: req.user?.email || 'system',
    action,
    entity,
    entityId,
    previousValue: typeof previousValue === 'string' ? previousValue : JSON.stringify(previousValue),
    newValue: typeof newValue === 'string' ? newValue : JSON.stringify(newValue)
  });
}
