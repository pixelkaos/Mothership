
/**
 * Sets a value on a nested object using a string path.
 *
 * @param obj The object to modify.
 * @param path The path to the property (e.g., 'stats.strength').
 * @param value The value to set.
 */
export function set(obj: any, path: string | string[], value: any): any {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  
  let current = obj;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[pathArray[pathArray.length - 1]] = value;
  
  return obj;
}
