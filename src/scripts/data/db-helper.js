import { openDB } from 'idb';

const DATABASE_NAME = 'urstory-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const StoriesDb = {
  async getAllStories() {
    console.log('Mengambil semua stories dari IndexedDB');
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putAllStories(stories) {
    if (!stories || !Array.isArray(stories)) {
      console.error('Data stories tidak valid:', stories);
      return;
    }
    
    console.log('Menyimpan stories ke IndexedDB');
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, 'readwrite');
    await Promise.all(stories.map((story) => tx.store.put(story)));
    await tx.done;
  },
};

export default StoriesDb;