/**
 * Backup & restore for the whole app.
 *
 * Everything Entumany stores lives in localStorage on its own origin (the
 * dictionary, quiz progress, the activity log, the Portuguese trainers and
 * speech preferences). A backup is therefore a snapshot of every localStorage
 * entry — this stays correct even as new persisted features are added, without
 * having to maintain a hand-written list of keys.
 */

const BACKUP_APP = 'entumany';
const BACKUP_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

const buildBackup = (): BackupFile => {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === null) continue;
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  return {
    app: BACKUP_APP,
    data,
    exportedAt: new Date().toISOString(),
    version: BACKUP_VERSION,
  };
};

/** Pretty-printed JSON snapshot of all app data, ready to download or copy. */
export const serializeBackup = (): string => JSON.stringify(buildBackup(), null, 2);

/** A filesystem-friendly name like `entumany-backup-2026-06-24.json`. */
export const backupFileName = (): string => `${BACKUP_APP}-backup-${new Date().toISOString().slice(0, 10)}.json`;

/**
 * Restore a backup produced by {@link serializeBackup}. Throws if the payload
 * is not a recognisable Entumany backup. The caller is expected to reload the
 * page afterwards so in-memory singletons re-read the restored values.
 */
export const restoreBackup = (raw: string): void => {
  let parsed: Partial<BackupFile>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (!parsed || parsed.app !== BACKUP_APP || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('That does not look like an Entumany backup.');
  }

  Object.entries(parsed.data).forEach(([key, value]) => {
    if (typeof value === 'string') localStorage.setItem(key, value);
  });
};

/**
 * Wipe every piece of app data. The caller is expected to reload the page so
 * in-memory singletons reset to their defaults.
 */
export const clearAllData = (): void => {
  localStorage.clear();
};
