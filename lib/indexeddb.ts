const DB_NAME = 'agrimanage-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const getFromDB = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error('Failed to read from IndexedDB'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error reading from DB:', error);
    return null;
  }
};

export const setToDB = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => {
        reject(new Error('Failed to write to IndexedDB'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error writing to DB:', error);
  }
};

export const removeFromDB = async (key: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error('Failed to delete from IndexedDB'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error deleting from DB:', error);
  }
};
