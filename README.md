Welcome to SARCAT
===================
![alt tag](https://github.com/Azimuth1/SARCAT/blob/master/meteor/public/icon.png?raw=true)

**SARCAT (Search and Rescue Collection & Analysis Tool)** is a web-hosted application that simplifies the collection and analysis of your team’s or agencies SAR data. Its goal is simple; make the collection of data easy, accurate, and standardized. This is accomplished with smartforms, auto-calculations, and an intuitive user interface. The user then reaps the benefits with built in data analysis, reporting, mapping, and the ability to contribute to ISRID.

> **Key Features:**

> - World-wide map interface with topographic, street, and aerial imagery. Simply drag icons onto the map to mark key locations (Initial Planning Point, Incident Location, Find Location, decision points, revised PLS/LKP, intended and actual route). 
> - Smartforms adapts to information being entered, reducing the amount of data entry.
> - “Auto-calculation” based upon previous data; weather, ecoregion, elevation, dispersion, and spatial data automatically entered and calculated.
> - Browser interface can be opened from any desktop, laptop, or tablet.
> - Administrative functions provide user control, customization of data fields, and preferences.
> - Security features include user authentication with password encryption, NOSQL database logs all data entry, event log, personally identifiable information also is encrypted
> - Visualize your data with built in dashboards, analysis tools, maps, and reports.
> - Download your data into other programs. Export your data easily into ISRID.
> - Can be hosted on Linux/Windows/Mac platforms. Option for hosted version coming soon as well. Fully scalable for small or large teams.


----------

#**Basic Installation**
*Contains all dependencies locally within the application.*
> ####**Supported platforms**
> 
> - Mac: OS X 10.x
> - Windows: Microsoft Windows 7, Windows 8.1, Windows Server 2008, Windows Server 2012
> - Linux: x86 and x86_64 systems




## To Install the latest release: ##
* First, download the [latest release](http://spa.tial.ly:8080/download.html) for your platform.
* Then, follow instructions below for extracting the zipped SARCAT package.
> ####**EXTRACTING THE SARCAT PACKAGE ON YOUR LOCAL MACHINE: **
> *SARCAT is downloaded as a .zip file (.tar for Binux/Mac). Being a server application, this would normally involve seperate installations of server-side software. However, we have done the work to compile all of the binaries for you to get up and running quickly!*
1. Unzip the compressed file into a directory on your machine. Doing this in your home folder is recommended to ensure proper priviledges.
2. Open the directory.
3. Click <code>start</code> to run SARCAT.
4. Open you browser and go to http://www.localhost:3000 to begin.
4. Click <code>stop</code> to stop SARCAT.
5. Enjoy!


----------


----------


----------

#**Advanced Installation**
*If you already have node v0.10.36 & mongo installed on your system and know your way around a bit more (or want to learn), this is for you. Or if you want to learn, this is your chance! Follow instructions bellow to build the latest release from source*

> #### **DEPENDENCIES:** 


> **Node.js v0.10.6** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> 
> - [Windows Installer <small>node-v0.10.36-x86.msi</small>](https://nodejs.org/dist/v0.10.36/node-v0.10.36-x86.msi)
> - [Macintosh Installer <small>node-v0.10.36.pkg</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36.pkg)
> - [Linux Installer <small>node-v0.10.36.tar.gz</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz)


> **MongoDB v3.0.4**
> *Mongo is the powerful database behind SARCAT. Follow the instructions to get up and running with mongo! SARCAT has been tested with the latest version: v3.0.4. Mongo has great [documentation](http://docs.mongodb.org/manual/) to walk you through the install to be up and running quickly!*


>  *   [Download Mongo now!](https://www.mongodb.org/downloads)


----------


## Download SARCAT ##
Make sure you have the required dependencies. Then: 


	git clone https://github.com/Azimuth1/SARCAT
    cd SARCAT
    npm install
    npm start

* * *



#**Folder structure**

 |-- sarcat-0.3.0-os.windows.x86_64      **-Home Directory**
 

    |-- index.js
    |-- package.json
    |-- settings.json
    |-- start
    |-- stop
    
    |-- app/
        |-- !
        
    |-- bin/
	    | -- !

    |-- config/
        |-- config.json
        
    |-- node_modules/
        |-- !


###**| - -start**
> *bash script to start sarcat*
> 
###**| - -stop**
> *bash script to stop sarcat*        

####**| - - config/config.json**
> *Important env variables for running SARCAT on your server. Leave the default values unless you know what you are doing!*
> - **sarcatPort**
> port SARCAT will run on your server .Default is 3000_
> - **databaseDir**
> if left empty, your database will be install in your home directory.
> - **databasePort**
> port MongoDB will run on your server. Default is 3001
> - **databaseName**
> name of your database instance. Default is sarcatdb. It is saved to the location of your databaseDir parameter.
> - **MONGO_URL**
> default mongo connection settings to locahost.
> - **ROOT_URL**
> root url SARCAT will serve from. Generally should be localhost
####**| - -settings.json**
> *SARCAT config settings. Leave the default values unless you know what you are doing!*


----------

#**Command Line**

#### Start a SARCAT instance on your machine:


`node dist/index.js`
`npm start`
`./start`
	
    

#### Kill a running instance of SARCAT on your machine:
`./stop`

###**Build Commands (development only)**
#### **Build for your current user's platform:**
> `npm install`
> `npm run buildlocal`



#### **Build for target platform:**
>**Windows: **
`node scripts/run.js win32`
`npm run win32`
`scripts/win32.sh`
**Mac: **
`node scripts/run.js darwin`
`npm run darwin`
`scripts/darwin.sh`
**Linux: **
`node scripts/run.js linux`
`npm run linux`
`scripts/linux.sh`



* * *
##FAQ & Troubleshooting


***How is SARCAT installed?***

* SARCAT is designed to be run on a server for an entire organization. Node & Mongodb are the backbones behind the scenes. If you know your way around these tools, you will be able to get the most out of SARCAT and the data. If you already have node & mongo running on your server, getting up and running with sarcat will be pretty easy for you. If not, dont worry - we compiled all the necessary dependencies into a zip file for your platform.

***Where is my data stored?***

* When SARCAT is installed, by default it will create the database in your home directory. If you wish to change this location, simply open up config/config.json and create a path to your desired database directory.

***How do I update SARCAT?***

* If you are using git, you can just update the latest with a pull. if you downloaded the zip file, it is recommended at this time to download the latest version and run it from this extracted file. It will automatically connect to you latest database if you used the default sarcatdb in your home directory.



***How do a wipeout my database and start over?***

* As long as this is exactly what you want, you can delete your local copy of the database from your home directory. The next time you restart SARCAT it will be created again. Or change the database location from the above instructions.


***I am _still_ having trouble installing!***

* SARCAT is intended to be used as a web server. If installing on a local network, you may need to contact your administrator to be granted access rights to install. While the steps and dependencies are minimal for this software, proper knowledge of your network is important to ensure quality.

*   Ensure proper priveleges are set on your machine and install paths
*   Check firewall settings.
*   Feel free to contact us with any question or concerns you may have. This is an open source project and we encourage collaboration in order to create the best product possible!



* * *



#**Manuel**




##Getting Started

*Once SARCAT is installed, use the default username/password to begin setting up your profile at http://localhost:3000:*

> **Username**: *admin@sarcat*
> **Password** *admin*
                
----------


## Admin Tools
> #### **Organization Profile:** 


> - **Organization Information** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Custom Settings/Preferences** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Custom Settings/Preferences** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Custom Incident Questions** 
> - *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Default SAR Response Area** 


----------


> #### **User Roles:** 
> - **Adding New Users** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Password Reset** - *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
> - **Remove Users** - *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*


----------


> #### **Editing History:** 
> *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*


----------


## Incident Records



#### **Create a Record**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
#### **Viewing Records**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
#### **Downloading Records**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
#### **Importing Records into SARCAT**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
#### **Exporting Records to ISRID**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*
#### **View Reports**
*Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*


----------


## Editing An Incident

> #### **Incident Categories:** 
> - **Incident Map** 
> *lalalalalalala.*
> - **Record Info** 
> *lalalalalalala.*
> - **Incident Location/Details** 
> *lalalalalalala.*
> - **Incident TimeLog** 
> *lalalalalalala.*
> - **Subject Info** 
> *lalalalalalala.*
> - **Weather** 
> *lalalalalalala.*
> - **Find Location** 
> *lalalalalalala.*
> - **Incident Outcome/Rescue** 
> *lalalalalalala.*
> - **Resources Used** 
> *lalalalalalala.*
> - **Comments**  
> *lalalalalalala.*
> *lalalalalalala.*
> - **Saved Incident Files** 
> *lalalalalalala.*


----------


## SARCAT Stats
#### **Record Map**
#### **Reactive charts**


----------


# Feedback
We would love to hear any feedback you have on the app. For technical support, contact *kyle.kalwarski@azimuth1.com*. For other general inqueries, contact Robert Koester at *robert@dbs-sar.com*

And don't forget to check out our Lost Person Behavior mobile app available for iOS & Android today!
