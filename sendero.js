function get(data, path, options) {
  if (!options) options = {};

  const stringify = it => (typeof it === "object" ? JSON.stringify(it) : "" + it);

  if (typeof path === "string") {
    let seps = [".", "__"]; // default
    if (typeof options.sep === "string") {
      seps = [options.sep];
    } else if (Array.isArray(options.sep)) {
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

  let results = previous;

  if (options.clean) {
    results = results.filter(it => it !== null && it !== undefined && it !== "");
  }

  if (options.unique || options.sort || options.stringify) {
    results = results.map(it => [it, stringify(it)]);

    // sort results by string version
    if (options.sort) {
      results = results.sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0));
    }

    if (options.unique) {
      results = results.filter(
        ([_, str], i) => results.slice(0, i).filter(([_, substr]) => str === substr).length === 0
      );
    }

    results = results.map(([it, str]) => (options.stringify ? str : it));
  }

  return results;
}

// compute paths for an object
function findPaths(obj, { debug = false, prev = "", sep = "." } = {}) {
  let paths = new Set();
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      const found = findPaths(item, { prev: prev ? prev + sep : "", sep });
      if (found.size === 0) {
        if (Array.isArray(item) && item.length > 0) {
          if (prev) {
            paths.add(prev);
          }
        }
      } else {
        for (let el of found) {
          paths.add(el);
        }
      }
    });
  } else if (typeof obj === "object") {
    for (let key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (Array.isArray(item)) {
            if (item.length > 0) {
              const found = findPaths(item, { prev: (prev ? prev + sep : "") + key, sep });
              if (found.size === 0) {
                paths.add((prev ? prev + sep : "") + key);
              } else {
                for (let el of found) {
                  paths.add(el);
                }
              }
            }
          } else if (typeof item === "object") {
            for (let el of findPaths(item, { prev: (prev ? prev + sep : "") + key, sep })) {
              paths.add(el);
            }
          } else {
            paths.add((prev ? prev + sep : "") + key);
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
