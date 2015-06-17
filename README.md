_This documentation is a work in progress. Many parts are incomplete at the moment. Additional documentation is coming very soon._


![alt tag](https://raw.github.com/azimuth1/SARCAT/master/public/icon.png)

#SARCAT
Search and Rescue Collection & Analysis Tool (SARCAT) is a web-hosted application that simplifies the collection and analysis of your team’s or agencies SAR data. Its goal is simple; make the collection of data easy, accurate, and standardized. This is accomplished with smartforms, auto-calculations, and an intuitive user inter-
face. The user then reaps the benefits with built in data analysis, reporting, mapping, and the ability to contribute to ISRID. In this way, all SAR providers help each other.
##Key Features
* _World-wide map interface with topographic, street, and aerial imagery. Simply drag icons onto the map to mark key locations (Initial Planning Point, Incident Location, Find Location, decision points, revised PLS/LKP, intended and actual route). _

* _Smartforms adapts to information being entered, reducing the amount of data entry._
* _“Auto-calculation” based upon previous data; weather, ecoregion, elevation, dispersion, and spatial data automatically entered and calculated._

* _Browser interface can be opened from any desktop, laptop, or tablet._

* _Administrative functions provide user control, customization of data fields, and preferences._

* _Security features include user authentication with password encryption, NOSQL database logs all data entry, versioned database in case of accidental deletion, event log,optional personally identifiable information, if enabled, is encrypted_

* _Visualize your data with built in dashboards, analysis tools, maps, and reports._

* _Download your data into other programs. Export your data easily into ISRID._

* _Can be hosted on your Linux/Unix or Microsoft server. Option for hosted version as well. Fully scalable for small or large teams._


## Download Latest Release
_*Coming Soon - Easily download the latest release for your platform.*_


## Install From Source:

* Install [Node.js v0.10.x](https://nodejs.org/download/)
* Install [Meteor](http://docs.meteor.com/#/basic/quickstart)
    git clone https://github.com/Azimuth1/SARCAT.git
* Install [MongoDB](https://www.mongodb.org/)

   

  Download Latest From Repo:
```bash
$ git clone https://github.com/Azimuth1/SARCAT.git
```
  Install dependencies:
```bash
$ cd SARCAT
$ npm install
```

Run as a Meteor app:
```bash
$ meteor --settings settings.json
```

Or run as a node app:
```bash
$ meteor build --directory /build
$ (cd ../build/bundle/programs/server && npm install)
$ MONGO_URL=mongodb://127.0.0.1:27017 ROOT_URL=http://localhost.com PORT=3000 METEOR_SETTINGS=$(cat settings.json) node ../build/bundle/main.js
```
    
## Hosted Options
*Don't want to manage you server? We can take care of all your hosting needs.
## Getting Started
* Instructional Videos
* Tutorials

## Developer Resources

## Participate!!!
## License
## Feedback