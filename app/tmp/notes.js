//nesting

app.controller('ParentCtrl ', function($scope) {
  // I'm the sibling, but want to act as parent
});

app.controller('ChildCtrl', function($scope, $controller) {
  $controller('ParentCtrl', {$scope: $scope}); //This works



  will horseback be in app?
  table dont belong in mobile - lists!!


/*

Ionic App Base
=====================

A starting project for Ionic that optionally supports
using custom SCSS.

## Using this project

We recommend using the `ionic` utility to create new Ionic projects that are based on this project but use a ready-made starter template.

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ sudo npm install -g ionic
```

Then run:

```bash
$ sudo npm install -g ionic
$ ionic start myProject tabs
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page.

## Installation

While we recommend using the `ionic` utility to create new Ionic projects, you can use this repo as a barebones starting point to your next Ionic app.

To use this project as is, first clone the repo from GitHub, then run:

```bash
$ cd ionic-app-base
$ sudo npm install -g cordova ionic gulp
$ npm install
$ gulp install
```

## Using Sass (optional)

This project makes it easy to use Sass (the SCSS syntax) in your projects. This enables you to override styles from Ionic, and benefit from
Sass's great features.

Just update the `./scss/ionic.app.scss` file, and run `gulp` or `gulp watch` to rebuild the CSS files for Ionic.

Note: if you choose to use the Sass method, make sure to remove the included `ionic.css` file in `index.html`, and then uncomment
the include to your `ionic.app.css` file which now contains all your Sass code and Ionic itself:

```html
<!-- IF using Sass (run gulp sass first), then remove the CSS include above
<link href="css/ionic.app.css" rel="stylesheet">
-->
```

## Updating Ionic

To update to a new version of Ionic, open bower.json and change the version listed there.

For example, to update from version `1.0.0-beta.4` to `1.0.0-beta.5`, open bower.json and change this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.4"
```

To this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.5"
```

After saving the update to bower.json file, run `gulp install`.

Alternatively, install bower globally with `npm install -g bower` and run `bower install`.

#### Using the Nightly Builds of Ionic

If you feel daring and want use the bleeding edge 'Nightly' version of Ionic, change the version of Ionic in your bower.json to this:

```
"ionic": "driftyco/ionic-bower#master"
```

Warning: the nightly version is not stable.


## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/contribute/#issues) to the main Ionic repository. On the other hand, pull requests are welcome here!



*/


/**
 * A simple example service that returns some data.
 */
 /*
.factory('subjCategories', function() {
  // Might use a resource here that returns a JSON array



  var subjCategories = [{
    "name": "ATV",
    "sub": [],
    "id": 0
}, {
    "name": "Angler",
    "sub": [],
    "id": 1
}, {
    "name": "Autistic",
    "sub": [],
    "id": 2
}, {
    "name": "Camper(Car)",
    "sub": [],
    "id": 3
}, {
    "name": "Caver",
    "sub": [],
    "id": 4
}, {
    "name": "Child",
    "sub": ["Toddler(1-3)", "Preschool(4-6)", "School Age(7-9)",
        "Pre-Teen(10-12)", "Adolescent/Youth(13-15)"
    ],
    "id": 5
}, {
    "name": "Climber",
    "sub": [],
    "id": 6
}, {
    "name": "Dementia",
    "sub": [],
    "id": 7
}, {
    "name": "Despondent",
    "sub": [],
    "id": 8
}, {
    "name": "Disability",
    "sub": [],
    "id": 9
}, {
    "name": "Gatherer",
    "sub": [],
    "id": 10
}, {
    "name": "Hiker",
    "sub": [],
    "id": 11
}, {
    "name": "Horseback",
    "sub": [],
    "id": 12
}, {
    "name": "Hunter",
    "sub": [],
    "id": 13
}, {
    "name": "Intellectual",
    "sub": [],
    "id": 14
}, {
    "name": "Medical Scenario",
    "sub": [],
    "id": 15
}, {
    "name": "Mental Illness",
    "sub": [],
    "id": 16
}, {
    "name": "Mountain Biker",
    "sub": [],
    "id": 17
}, {
    "name": "Runner",
    "sub": [],
    "id": 18
}, {
    "name": "Snow Related",
    "sub": ["Skier-Alpine", "Skier-Nordic", "Snowboarder", "Snowmobiler",
        "Snowshoer"
    ],
    "id": 19
}, {
    "name": "Substance Intoxication",
    "sub": [],
    "id": 20
}, {
    "name": "Worker",
    "sub": [],
    "id": 21
}];

  return {
    all: function() {
      return subjCategories;
    },
    get: function(subjId) {
      return subjCategories.filter(function(d){return d.name==subjId})[0];
    }
  }
})


*/