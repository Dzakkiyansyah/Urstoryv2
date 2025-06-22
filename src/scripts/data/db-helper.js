import { openDB } from "idb";

const DATABASE_NAME = "urstory-database";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
  },
});

const StoriesDb = {
  async getStory(id) {
    if (!id) {
      return undefined;
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    if (!story || !story.id) {
      return;
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    if (!id) {
      return;
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoriesDb;
