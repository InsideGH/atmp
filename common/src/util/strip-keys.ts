export const stripKeys = (obj: any, keys: string[]) => {
  if (Array.isArray(obj)) {
    obj.forEach((x) => global.stripKeys(x, keys));
  } else if (typeof obj == 'object') {
    for (const key in obj) {
      const value = obj[key];
      if (keys.includes(key)) {
        delete obj[key];
      } else {
        global.stripKeys(value, keys);
      }
    }
  }
};
