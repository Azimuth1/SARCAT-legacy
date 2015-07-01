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
## Supported platforms

*   Mac: OS X 10.7 and above
*   Windows: Microsoft Windows 7, Windows 8.1, Windows Server 2008, Windows Server 2012
*   Linux: x86 and x86_64 systems

## Dependencies

*   Node.js v0.10.6
*   MongoDB v3.0.4
*   ***

## Install latest release

Download the [latest release](http://spa.tial.ly:8080/download.html) for your platform.

1. Extract the compressed file in a directory in your home folder.
2. Open the directory
3. Click <code>start</code> to run SARCAT
4. Click <code>stop</code> to stop SARCAT

                
                
* * *
## Install latest release (without node/mongo)
If you already have node v0.10.36 & mongo installed on your system and prefer the terminal, this will make that install quicker for you and you can skip the first 2 steps. If you want to install node & mongo seperately, the instructions are below.

#### 1. Download the installer from Nodes.js(v0.10.36)

*   [Windows Installer <small>node-v0.10.36-x86.msi</small>](https://nodejs.org/dist/v0.10.36/node-v0.10.36-x86.msi)
*   [Macintosh Installer <small>node-v0.10.36.pkg</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36.pkg)
*   [Linux Installer <small>node-v0.10.36.tar.gz</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz)

3.  Run the installer (the .msi/.pkg file you downloaded in the previous step.)
4.  Follow the prompts in the installer (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).



#### 2. Download the installer for MongoDB

Mongo is the powerful database behind SARCAT. Follow the isntructions to get up and running with mongo! SARCAT has been tested with the latest version: v3.0.4.


*   [Download Mongo now!](https://www.mongodb.org/downloads)

Mongo has great [documentation](http://docs.mongodb.org/manual/) to walk you throgh the install and be up and running quickly!

* Download the [latest release](http://spa.tial.ly:8080/download.html) (sans node/mongo) for your platform.
* Extract the compressed file in a directory in your home folder.

###3. Download SARCAT (without node/mongo)
Download the [latest release](http://spa.tial.ly:8080/download.html) (sans node/mongo) for your platform.

###4. Then.. 

    cd SARCAT
    npm install
    npm start

* * *
## Build from source
_*Currently not supported on Windows_

    git clone https://github.com/Azimuth1/SARCAT.git
    cd SARCAT
    npm install
    npm start

* * *


##Files


* <strong>SARCAT/config/config.json</strong>- Contains specific congurations for SARCAT on your server. DOn't change the default settings unless you have to and you know what you are doing!
    * <strong>"sarcatPort": 3000</strong> - _port SARCAT will run on your server_
    * <strong>"databaseDir": ""</strong> - _if left empty, your database will be install in your home directory._
    * <strong>"databasePort": 3001</strong> - _port MongoDB will run on your server_
    * <strong>"databaseName": "sarcatdb"</strong> - _name of your database (is saved to the location of your databaseDir parameter)_
    * <strong>"MONGO_URL": "mongodb://localhost"</strong> - *default mongo connection settings*
    * <strong>"ROOT_URL": "http://localhost.com"</strong> - *root url SARCAT will serve from*
    


* <strong>SARCAT/settings.json</strong>- Intitial config settings for the first time SARCAT is loaded. These are saved to the database afterwards.


***
## Getting Started

Once SARCAT is installed, use the default username/password to begin setting up your profile:

* Username: *admin@sarcat*
* Password: *admin*


Instructional Videos Coming Soon

* * *
##FAQ & Troubleshooting
* How do a wipeout my database?
* I can't find my records
* I forgot my admin password!
* I am havving trouble installing



SARCAT is intended to be used as a web server. If installing on a local network, you may need to contact your administrator to be granted access rights to install. While the steps and dependencies are minimal for this software, proper knowledge of your network is important to ensure quality.

*   Ensure proper priveleges are set on your machine and install paths
*   Check firewall settings.
*   Feel free to contact us with any question or concerns you may have. This is an open source project and we encourage collaboration in order to create the best product possible!





* * *



## Feedback
We would love to hear any feedback you have on the app.
