# sendero
> Data Filtering for Humans

## why sendero
"sendero" means footpath in Spanish

## demo
http://danieljdufour.com/sendero.js/

## install
```html
<script src="https://unpkg.com/sendero"></script>
```
or
```js
import { get, listPaths } from "sendero";
```

## basic usage
```js
data = {
  "agency": "GSA",
  "measurementType": {
    "method": "modules"
  },
  "version": "2.0.0",
  "releases": [
    {
      "name": "usasearch",
      "description": "System now maintained in open repo https://github.com/GSA/search-gov.",
      "permissions": {
        "licenses": null,
        "usageType": "governmentWideReuse"
      },
      "tags": [
        "GSA"
      ]
    },
    // ...
  }
}
```

```js
listPaths(data, 'agency');
[
    "agency",
    "measurementType.method",
    "releases.contact.email",
    "releases.description",
    // ...
]

get(data, 'agency');
["GSA"]

// get nested properties using dot syntax
get(data, 'releases.permissions.licenses.name');
["CC0 1.0 Universal", "PD", "agpl-3.0", ... ]

// get nested properties using double underscore syntax
get(data, 'releases__permissions__licenses__name');
["CC0 1.0 Universal", "PD", "agpl-3.0", ... ]
```

# advanced usage
## unique
If you only want unique results returned:
```js
// default
get(data, 'releases.tags');
["GSA", "GSA", "GSA", ...]

// uniques only
get(data, 'releases.tags', { unique: true });
["GSA","gsa","socialmedia", "mobileapps", ...]
```

## sort
If you want your results sorted
```js
get(data, 'releases.tags', { sort: true });
["508", "API", "Bing", "DigitalGovSearch", ...]
```

## separator
By default, sendero tries syntax where the steps are separted by
`"."` or `"__"`.  If you'd like to restrict the syntax or use a custom separator:
```js
get(data, 'releases--tags', { sep: '--' });

// accepts releases--tags and releases__tags
get(data, 'releases--tags', { sep: ['--', '__'] });
```