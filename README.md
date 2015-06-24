_This documentation is a work in progress. Many parts are incomplete at the moment. Additional documentation is coming very soon._


![alt tag](https://github.com/Azimuth1/SARCAT/blob/master/meteor/public/icon.png?raw=true)

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

*** 
# Advanced Install

### 1\. Download [Node.js](https://nodejs.org) v0.10.36

SARCAT is built with Meteor - which makes it fast and reliable. Meteor has been tested up to [node](https://nodejs.org/) version 0.10.36\. If you are building from source, [NVM](https://github.com/creationix/nvm) is a great way to use bash scripting to manage multiple active node.js versions.

### Installation Steps

1.  Download the installer from Nodes.js®

*   [![](https://nodejs.org/images/platform-icon-win.png)Windows Installer <small>node-v0.10.36-x86.msi</small>](https://nodejs.org/dist/v0.10.36/node-v0.10.36-x86.msi)
*   [![](https://nodejs.org/images/platform-icon-osx.png)Macintosh Installer <small>node-v0.10.36.pkg</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36.pkg)
*   [![](https://nodejs.org/images/platform-icon-generic.png)Source Code <small>node-v0.10.36.tar.gz</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz)

3.  Run the installer (the .msi/.pkg file you downloaded in the previous step.)
4.  Follow the prompts in the installer (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).

* * *

### 2\. Download [MongoDB](https://nodejs.org) v0.10.36

Mongo is the powerful database behind SARCAT. Follow the isntructions to get up and running with mongo! SARCAT has been tested with the latest version: v3.0.4.

### Installation Steps

*   [Download Mongo Source now!](https://www.mongodb.org/downloads)

Or if you like, Mongo has great documentation to walk you throgh the install and be up and running quickly!

*   [Mongo for Windows](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/)
*   [Mongo for Mac](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
*   [Mongo for Linux](http://docs.mongodb.org/manual/administration/install-on-linux/)

* * *

## 3\. Install SARCAT From Source

_You can get the latest .zip [here](https://github.com/Azimuth1/SARCAT/releases)_

#### _Or use git_

<div>

<pre>$ git clone https://github.com/Azimuth1/SARCAT.git</pre>

</div>

* * *

## 4\. Open Your Shell  

*   For Windows, click `start`>`run` and type `cmd`
*   For Mac, search "Terminal" to open the shell.
*   If you are using Linux, I think you probably know this step.

* * *

## 5\. Install Dependencies  

<div>

<pre>$ npm install</pre>

</div>

* * *

## 6\. Build  

*   Windows:

    <pre>./build.bat</pre>

*   Mac/Linux

    <pre>$ ./build.sh</pre>

* * *

## 7\. Run SARCAT  

Run As a Meteor App

<div>

<pre>$ cd meteor</pre>

<pre>meteor --settings settings.json</pre>

</div>

Or run as a node app:

<pre>$ mongod --dbpath {{USERHOME}}/sarcatdb</pre>

<pre>$ node sarcat/app/main.js</pre>

* * *

# Troubleshooting

SARCAT is intended to be used as a web server. If installing on a local network, you may need to contact your administrator to be granted access rights to install. While the steps and dependencies are minimal for this software, proper knowledge of your network is important to ensure quality.

*   Ensure proper priveleges are set on your machine and install paths
*   If you have problems with the binary installs, try installing from source
*   Feel free to contact us with any question or concerns you may have. This is an open source project and we encourage collaboration in order to create the best product possible!

## Officially supported platforms

*   Mac: OS X 10.7 and above
*   Windows: Microsoft Windows 7, Windows 8.1, Windows Server 2008, Windows Server 2012
*   Linux: x86 and x86_64 systems

## Dependencies

*   Node.js v0.10.6
*   MongoDB v3.0.4

* * *
## Hosted Options
*Don't want to manage you server? We can take care of all your hosting needs.
## Getting Started
* Instructional Videos
* Tutorials

## Developer Resources

## Participate!!!
## License
## Feedback
