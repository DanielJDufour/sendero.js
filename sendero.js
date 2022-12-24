function get(data, path, options) {
  const uniq = arr => arr.filter((it, i) => arr.indexOf(it) === i);

  if (typeof path === "string") {
    let seps = [".", "__"]; // default
    if (options && typeof options.sep === "string") {
      seps = [options.sep];
    } else if (options && Array.isArray(options.sep)) {
      seps = options.sep;
    }

    if (seps.length > 1) {
      return seps.reduce((acc, sep) => {
        const subresults = get(data, path.split(sep), options);
        return subresults.length > acc.length ? subresults : acc;
      }, []);
    } else if (seps.length === 1) {
      path = path.split(seps[0]);
    }
  } else {
    path = Array.prototype.slice.call(path); // clone
  }

  let previous = [data];
  while (path.length > 0) {
    const active = [];
    const key = path.shift();
    previous.forEach(obj => {
      if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            if (key in item) {
              const value = item[key];
              if (Array.isArray(value)) {
                value.forEach(subvalue => {
                  active.push(subvalue);
                });
              } else {
                active.push(value);
              }
            }
          });
        } else {
          if (key in obj) {
            const value = obj[key];
            if (Array.isArray(value)) {
              value.forEach(subvalue => {
                active.push(subvalue);
              });
            } else {
              active.push(value);
            }
          }
        }
      }
    });
    previous = active;
  }

  let results = previous.map(p => (typeof p === "object" ? JSON.stringify(p) : p));

  if (options && options.unique) results = uniq(results);
  if (options && options.sort) results = results.sort();

  return results;
}

// compute paths for an object
function findPaths(obj, { debug = false, prev = "", sep = "." } = {}) {
  let paths = new Set();
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      for (let el of findPaths(item, { prev: prev ? prev + sep : "", sep })) {
        paths.add(el);
      }
    });
  } else if (typeof obj === "object") {
    for (let key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          for (let el of findPaths(item, { prev: (prev ? prev + sep : "") + key, sep })) {
            paths.add(el);
          }
        });
      } else if (typeof value === "object") {
        for (let el of findPaths(value, { prev: (prev ? prev + sep : "") + key, sep })) {
          paths.add(el);
        }
      } else {
        paths.add((prev ? prev + sep : "") + key);
      }
    }
  }

  if (debug) console.log("[sendero] paths for", obj, "is", paths);
  return paths;
}

function listPaths(data, { debug = false, prev = "", sep = "." } = {}) {
  return Array.from(findPaths(data, { debug, prev, sep })).sort();
}

if (typeof define === "function" && define.amd)
  define(function () {
    return { get, listPaths };
  });
if (typeof module === "object") module.exports = { get, listPaths };
if (typeof window === "object") window.sendero = { get, listPaths };
if (typeof self === "object") self.sendero = { get, listPaths };
