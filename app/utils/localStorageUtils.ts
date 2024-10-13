const isBrowser = typeof window !== "undefined";

const setCache = (key: string, value: unknown, ttl: number) => {
  if (!isBrowser) {
    // If not in a browser environment, return false or handle accordingly
    return false;
  }

  const now = new Date();
  const item = {
    value,
    expiry: now.getTime() + ttl, // Store expiry time in milliseconds
  };
  localStorage.setItem(key, JSON.stringify(item));
  return true;
};

const getCache = (key: string) => {
  if (!isBrowser) {
    // If not in a browser environment, return null or handle accordingly
    return null;
  }

  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  // If the item is expired, remove it from storage and return null
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

const clearCache = (key: string) => {
  if (!isBrowser) {
    // If not in a browser environment, return false or handle accordingly
    return false;
  }

  localStorage.removeItem(key);
  return true;
};

const clearAllCache = () => {
  if (!isBrowser) {
    // If not in a browser environment, return false or handle accordingly
    return false;
  }

  localStorage.clear();
  return true;
};

export { setCache, getCache, clearCache, clearAllCache };
