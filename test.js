const test = require("flug");
const { get, listPaths } = require("./sendero.js");

const data = require("./data/code.json");

test("array path", ({ eq }) => {
  eq(get(data, ["agency"]), ["GSA"]);
});

test("key", ({ eq }) => {
  eq(get(data, "agency"), ["GSA"]);
});

test("array item property", ({ eq }) => {
  eq(get(data, "releases.name", { sort: false }).slice(0, 3), ["usasearch", "cron_scripts", "mobile-fu"]);
});

test("releases.permissions.licenses.name", ({ eq }) => {
  eq(Array.from(new Set(get(data, "releases.permissions.licenses.name"))).sort(), [
    "CC0 1.0 Universal",
    "PD",
    "agpl-3.0",
    "apache-2.0",
    "bsd-2-clause",
    "bsd-3-clause",
    "cc0-1.0",
    "gpl-2.0",
    "gpl-3.0",
    "lgpl-2.1",
    "mit",
    "mpl-2.0",
    "other",
    "unlicense"
  ]);
});

test("releases.tags (default)", ({ eq }) => {
  eq(get(data, "releases.tags").slice(0, 3), ["GSA", "GSA", "GSA"]);
});

test("wrong seperator", ({ eq }) => {
  eq(get(data, "releases__tags", { sep: "|" }), []);
});

test("default seps", ({ eq }) => {
  eq(get(data, "releases.tags", { unique: true }).slice(0, 3), ["GSA", "gsa", "socialmedia"]);
  eq(get(data, "releases__tags", { unique: true }).slice(0, 3), ["GSA", "gsa", "socialmedia"]);
});

test("releases__tags", ({ eq }) => {
  eq(get(data, "releases__tags", { sep: "__" }).slice(0, 3), ["GSA", "GSA", "GSA"]);
});

test("unique", ({ eq }) => {
  eq(get(data, "releases.tags", { unique: true }).slice(0, 4), ["GSA", "gsa", "socialmedia", "mobileapps"]);
});

test("sort", ({ eq }) => {
  eq(get(data, "releases.tags", { sort: true }).slice(0, 4), ["508", "API", "Bing", "DigitalGovSearch"]);
});

test("unique + sort", ({ eq }) => {
  eq(get(data, "releases.tags", { sort: true, unique: true }).slice(0, 3), ["508", "API", "Bing"]);
});

test("releases.contact.email", ({ eq }) => {
  eq(get(data, "releases.contact.email", { sort: true, unique: true }).slice(0, 3), [
    "cloudmgmt@gsa.gov",
    "code@gsa.gov",
    "cto@gsa.gov"
  ]);
});

test("list paths", ({ eq }) => {
  eq(listPaths(data), [
    "agency",
    "measurementType.method",
    "releases.contact.email",
    "releases.description",
    "releases.governmentWideReuseProject",
    "releases.homepageURL",
    "releases.laborHours",
    "releases.languages",
    "releases.license",
    "releases.name",
    "releases.openSourceProject",
    "releases.organization",
    "releases.permissions.licenses.URL",
    "releases.permissions.licenses.name",
    "releases.permissions.usageType",
    "releases.repositoryURL",
    "releases.tags",
    "releases.vcs",
    "version"
  ]);
});

test("list paths with separator", ({ eq }) => {
  eq(listPaths(data, { sep: "__" }), [
    "agency",
    "measurementType__method",
    "releases__contact__email",
    "releases__description",
    "releases__governmentWideReuseProject",
    "releases__homepageURL",
    "releases__laborHours",
    "releases__languages",
    "releases__license",
    "releases__name",
    "releases__openSourceProject",
    "releases__organization",
    "releases__permissions__licenses__URL",
    "releases__permissions__licenses__name",
    "releases__permissions__usageType",
    "releases__repositoryURL",
    "releases__tags",
    "releases__vcs",
    "version"
  ]);
});

test("list then get", ({ eq }) => {
  const paths = listPaths(data);
  paths.forEach(path => {
    eq(get(data, path, { unique: true }).length >= 1, true);
  });
});

test("geojson point", ({ eq }) => {
  const point = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [125.6, 10.1]
    },
    properties: {
      name: "Dinagat Islands"
    }
  };
  eq(listPaths(point), ["geometry.coordinates", "geometry.type", "properties.name", "type"]);
});

test("multipoint geometry", ({ eq }) => {
  // from https://www.rfc-editor.org/rfc/rfc7946#appendix-A.4
  const multipoint = {
    type: "MultiPoint",
    coordinates: [
      [100.0, 0.0],
      [101.0, 1.0]
    ],
    ignore_this: [], // ignore empty arrays
    ignore_that: [[], []] // ignore empty multidimensional arrays
  };
  eq(listPaths(multipoint), ["coordinates", "type"]);
});

test("clean", ({ eq }) => {
  eq(get(data, "releases.permissions.licenses", { clean: true }).includes(null), false);
  eq(get(data, "releases.license", { clean: true }).includes(null), false);
});

test("stringify", ({ eq }) => {
  eq(get(data, "releases.laborHours", { stringify: true, unique: true }), ["0"]);

  eq(get(data, "releases.permissions", { stringify: true, unique: true }).slice(0, 3), [
    '{"licenses":null,"usageType":"governmentWideReuse"}',
    '{"licenses":[{"URL":"http://choosealicense.com/licenses/mit/","name":"mit"}],"usageType":"openSource"}',
    '{"licenses":[{"URL":"http://choosealicense.com/licenses/gpl-3.0/","name":"gpl-3.0"}],"usageType":"openSource"}'
  ]);
});
