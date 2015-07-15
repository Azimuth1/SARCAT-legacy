_This documentation is a work in progress. Many parts are incomplete at the moment. Additional documentation is coming very soon._


![alt tag](https://github.com/Azimuth1/SARCAT/blob/master/meteor/public/icon.png?raw=true)

#SARCAT
Search and Rescue Collection & Analysis Tool (SARCAT) is a web-hosted application that simplifies the collection and analysis of your team’s or agencies SAR data. Its goal is simple; make the collection of data easy, accurate, and standardized. This is accomplished with smartforms, auto-calculations, and an intuitive user interface. The user then reaps the benefits with built in data analysis, reporting, mapping, and the ability to contribute to ISRID.
##Key Features
* _World-wide map interface with topographic, street, and aerial imagery. Simply drag icons onto the map to mark key locations (Initial Planning Point, Incident Location, Find Location, decision points, revised PLS/LKP, intended and actual route). _

* _Smartforms adapts to information being entered, reducing the amount of data entry._
* _“Auto-calculation” based upon previous data; weather, ecoregion, elevation, dispersion, and spatial data automatically entered and calculated._

* _Browser interface can be opened from any desktop, laptop, or tablet._

* _Administrative functions provide user control, customization of data fields, and preferences._

* _Security features include user authentication with password encryption, NOSQL database logs all data entry, event log, personally identifiable information also is encrypted_

* _Visualize your data with built in dashboards, analysis tools, maps, and reports._

* _Download your data into other programs. Export your data easily into ISRID._

* _Can be hosted on Linux/Windows/Mac platforms. Option for hosted version coming soon as well. Fully scalable for small or large teams._

***
## Supported platforms

*   Mac: OS X 10.x
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
5. Enjoy!

***

## Getting Started

Once SARCAT is installed, use the default username/password to begin setting up your profile:

* Username: *admin@sarcat*
* Password: *admin*
                
* * *
## Install latest release (without node/mongo)
If you already have node v0.10.36 & mongo installed on your system and know your way around a bit more (or want to learn), this is for you. Instructions to install node & mongo are below.

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

###3. Download SARCAT
Download the [latest release](http://spa.tial.ly:8080/download.html) (sans node/mongo) for your platform on github.

###4. Then.. 

    cd SARCAT
    npm install
    npm start

* * *



##Files structure


* <strong>SARCAT/config/config.json</strong>- Contains specific congurations for SARCAT on your server. DOn't change the default settings unless you have to and you know what you are doing!
    * <strong>"sarcatPort": 3000</strong> - _port SARCAT will run on your server_
    * <strong>"databaseDir": ""</strong> - _if left empty, your database will be install in your home directory._
    * <strong>"databasePort": 3001</strong> - _port MongoDB will run on your server_
    * <strong>"databaseName": "sarcatdb"</strong> - _name of your database (is saved to the location of your databaseDir parameter)_
    * <strong>"MONGO_URL": "mongodb://localhost"</strong> - *default mongo connection settings*
    * <strong>"ROOT_URL": "http://localhost.com"</strong> - *root url SARCAT will serve from*
    


* <strong>SARCAT/settings.json</strong>- Intitial config settings for the first time SARCAT is loaded. These are saved to the database afterwards.


***



Instructional Videos Coming Soon

* * *
##FAQ & Troubleshooting

* How is SARCAT installed?

SARCAT is designed to be run on a server for an entire organization. Node & Mongodb are the backbones behind the scenes. If you know your way around these tools, you will be able to get the most out of SARCAT and the data. If you already have node & mongo running on your server, getting up and running with sarcat will be pretty easy for you. If not, dont worry - we compiled all the necessary dependencies into a zip file for your platform.

* Where is my data stored?

When SARCAT is installed, by default it will create the database in your home directory. If you wish to change this location, sinply open up config/config.json and create a path to your desired database directory.

* How do I update SARCAT?

If you are using git, you can just update the latest with a pull. if you downloaded the zip file, it is recommended at this time to download the latest version and run it from this extracted file. It will automatically connect to you latest database if you used the default sarcatdb in your home directory.



* How do a wipeout my database and start over?

As long as this is exactly what you want, you can delete your local copy of the database from your home directory. The next time you restart SARCAT it will be created again. Or change the database location from the above instructions.


* I am _still_ having trouble installing

SARCAT is intended to be used as a web server. If installing on a local network, you may need to contact your administrator to be granted access rights to install. While the steps and dependencies are minimal for this software, proper knowledge of your network is important to ensure quality.

*   Ensure proper priveleges are set on your machine and install paths
*   Check firewall settings.
*   Feel free to contact us with any question or concerns you may have. This is an open source project and we encourage collaboration in order to create the best product possible!



* * *



## Feedback
We would love to hear any feedback you have on the app. For technical support, contact *kyle.kalwarski@azimuth1.com*. For other general inqueries, contact Robert Koester at *robert@dbs-sar.com*

And don't forget to check out our Lost Person Behavior mobile app available for iOS & Android today!
