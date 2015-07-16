#SARCAT#
![alt tag](https://github.com/Azimuth1/SARCAT/blob/master/meteor/public/icon.png?raw=true)


----------


**SARCAT (Search and Rescue Collection & Analysis Tool)** is a web-hosted application that simplifies the collection and analysis of your team’s or agencies SAR data. Its goal is simple; make the collection of data easy, accurate, and standardized. This is accomplished with smartforms, auto-calculations, and an intuitive user interface. The user then reaps the benefits with built in data analysis, reporting, mapping, and the ability to contribute to ISRID.


#### **Key Features** ####
* World-wide map interface with topographic, street, and aerial imagery. Simply drag icons onto the map to mark key locations (Initial Planning Point, Incident Location, Find Location, decision points, revised PLS/LKP, intended and actual route). 

* Smartforms adapts to information being entered, reducing the amount of data entry.
* Auto-calculation based upon previous data; weather, ecoregion, elevation, dispersion, and spatial data automatically entered and calculated.
* Browser interface can be opened from any desktop, laptop, or tablet.
* Administrative functions provide user control, customization of data fields, and preferences.
* Security features include user authentication with password encryption, NOSQL database logs all data entry, event log, personally identifiable information also is encrypted
* Visualize your data with built in dashboards, analysis tools, maps, and reports.
* Download your data into other programs. Export your data easily into ISRID.
* Can be hosted on Linux/Windows/Mac platforms. Option for hosted version coming soon as well. Fully scalable for small or large teams.

#### **Supported platforms** ####
* Mac: OS X 10.x
* Windows: Microsoft Windows 7, Windows 8.1
* Linux: 32-bit Linux, 64-bit Linux

----------

# **Basic Installation** #
*This is the easiest way to install SARCAT. You simply download a compressed source containing everything you need to get up and running. Keep in mind that although SARCAT is designed to be run as a server application, it has been specially wrapped to run as a standalone product on your desktop.*


## To Install the latest release: ##
1. First, download the [latest release](http://spa.tial.ly:8080/download.html) for your platform from the download section of the SARCAT website. This is a compressed file *(zip/tar.fz)* targetting your operating system.

2. Create a SARCAT home directory on your machine. **Ensure this is a location where you have owner privileges.**  Below is a recommended guide for where this should be done:
* **Windows:** 
*C:\Users\\{username}\sarcat*
* **Mac:** 
*/Users/{username}/sarcat*


3. Drag the downloaded zipped file into your SARCAT home directory.
4. Right-click the file and select **Extract All**. 
5. For your destination, choose your SARCAT home directory (e.g. ***C:\Users\\{username}\sarcat***).
6. Once extracted, navigate into the new app directory. (e.g. ***C:\Users\\{username}\sarcat\sarcat-{version}-{platform}***)
8. Click <code>start</code> to run SARCAT. This will open a terminal to run the server and database for the software.
9. Open your web browser and go to http://www.localhost:3000 to begin.
10. Click <code>stop</code> to stop SARCAT. Or ***Ctrl+C*** into the current terminal session. Be careful to exit correctly or the process may not fully end.
11. Enjoy!





----------



# **Folder structure** #


 |-- C:\Users\\{username}\sarcat-{version}-{platform}
 


    |-- start (Click to start SARCAT)
    |-- stop (Click to stop SARCAT)
    |-- config/
        |-- config.json (Local server/datebase configurations)
        
    |-- app/ (master files. do not touch!)
        |-- index.js
        |-- settings.json
        
        |-- bundle/
        |-- *compiled SARCAT application*
        
        |-- bin/
        | -- *binary dependencies*

    
### **| - -start**
*batch script to easily start SARCAT*

### **| - -stop**
*batch script to easily stop SARCAT*      

### **| - - config/config.json**

*Important environment variables for running SARCAT on your server. Leave the default values. However, if you must change port, restart the server for changes to take effect.*

* **sarcatPort:**
Port SARCAT will run on your server. Default is 3000. If unavailable, the server will incrementally try higher numbers until a free port is found available.
* **sarcatStorage:**
If left empty, your personal SARCAT files and database will be saved to your user home directory in (e.g. ***C:\Users\\{username}\sarcatData***). Be careful if you change this or your data may not update when you upgrade your version of SARCAT
* **databasePort:**
Port MongoDB will run on your server. Default is 27017
* **databaseName:**
Name of your database instance. Default is sarcatdb. It is saved to the location of your sarcatStorage parameter.
* **MONGO_URL:**
Default mongo connection settings to locahost.
* **ROOT_URL:**
Root url SARCAT will serve from. Generally should be localhost.


### **| - -app/**
*node scripts that runs SARCAT. Do not touch!*

  




----------


# **Manuel** #




## Getting Started ##

* Once SARCAT is installed and running, use the default username/password (**Username**: ***admin@sarcat***, **Password**: ***admin***) to begin setting up your profile at **http://localhost:3000**. This ensures only you can do the initial setup.


    
* Go to the Admin Tools section on the left to begin setting up your profile.
                
----------


## **Admin Tools** ##
*The admin tools page is only accessible to users with an admin level privilege. Here, you can manage your projects and user-base.*


### **Organization Profile** ###

**Organization Information**

* Create a profile for your organzation before you can create any records.

**Custom Settings/Preferences**

* Upload your organization logo to customize the look and feel of SARCAT.
* Allow a connection to the SARCAT servers. these currently will assist you with getting weather and elevation information. More features will be added in the future!
* Choose a unit of measurement for your team.

**Custom Incident Questions**

* Generate custom questions to fill out for incidents. We understand every team has unique needs and this will help make sure you get the data recorded that you depend on!
**Default SAR Response Area**
* Set this map on your default response area in order to more quickly create records.




### **User Roles** ###
**Adding New Users**

*The admin must approve all new users. When a user signs up, they will be notified that their account is pending admin approval. There are 4 main roles within SARCAT:*
 * Pending - Default role. Users cannot login.
 * Viewer - Users can view Records but not create them.
 * Editor - Users can create and edit any records.
 * Admin - You can control the admin dashboard!

**Password Reset**
* If a user forget their password, you can click this for a one time reset code. Give them this code in order to reset their password

**Remove Users**
* Remove users for your database




### **Editing History** ###
* *SARCAT tracks a history of all user edits here.*


----------


## **Incident Records** ##


* This is where you can sort through and view a table of all records. It can be sorted and displayed by multiple incident fields. In addition the following options will appear on the page for authorized users. Photos to come!

#### **Create a Record**
* Once you have your profile set up, creating records is a breeze. This modal that pops up contains the required information to begin a new record. Drag the point on the map to the incident location and fill in data. Once you have a records, the Record ID and Mission ID will display the previously used values for your reference*
#### **Downloading Records**
* You can download your records as a .csv and open in Excel. You can also download in JSON format. This is good for backups, as you can import these records (see below)*
#### **Importing Records into SARCAT**
* Navigate to a JSON file from exported records to load them into SARCAT again.*
#### **Exporting Records to ISRID**
* A single button click will send your data to the ISRID servers. Only the admin can see this*
#### **View Reports**
* Select records and click View Report to see a summary of the incidents. If none are selected, you will have a report generated for all records. After 3 records, the map will not display data due to map API usage limits.*


----------


## **Editing An Incident** ##
*And now for data entry! SARCAT makes life easier by assisting with inputs. Our goal is to optimize this as much as possible to make sure you are spending less time inserting data and more time analyzing your workflow. All of these value auto-save, so you don't have to worry about filling out an entire form and forgetting to save it!* 

### **Incident Categories:**  ###
#### **Incident Map** 
* Click the buttons above the map to add/remove geospatial data from your incident 
#### **Record Info** 
* This is the primary information filled in when you created the record
#### **Incident Location/Details** 
* Dropdowns assist with pick values about your location
#### **Incident TimeLog** 
* 24 hour time is used here. Total time is also generated based on these values
#### **Subject Info** 
* Add subject information for the missing parties. The personal information is encrypted and only the creator or admins can view this information
#### **Weather** 
* If connection is enabled to the SARCAT servers, this data can be auto-calculated once you have add the Incident Date and Incident Location.
#### **Find Location** 
* Information pertaining to the find. This is activated when the Find Coordinate is place on the map
#### **Incident Outcome/Rescue** 
* Details pertaining to the rescue.
#### **Resources Used** 
* Select resources with the checkboxes to add to the list.
#### **Comments**  
* Write anything you want pertaining to the search here
#### **Saved Incident Files**
* You can also upload data and manage it within SARCAT! It currently will serve images and other various reports (.pdf/.doc/.csv). This is saved to your **/sarcatDATA** directory


----------


## **SARCAT Stats** ##
### **Record Map**
this shows all of your records in a single map. The incident location and find location (if available) have a single crows-path line drawn between them. You can selected these records to view information pertaining to the individual record
### **Reactive charts**

The more data you have, the more you will notice trends. You can select a date range and display stats based on when your incidents happened.




----------




## **FAQ & Troubleshooting** ##


***How is SARCAT installed?***

* SARCAT is designed to be run on a server for an entire organization. Node & Mongodb are the backbones behind the scenes. If you know your way around these tools, you will be able to get the most out of SARCAT and the data. If you already have node & mongo running on your server, getting up and running with sarcat will be pretty easy for you. If not, dont worry - we compiled all the necessary dependencies into a zip file for your platform.

***Where is my data stored?***

* When SARCAT is installed, by default it will create the database in your home directory. If you wish to change this location, simply open up config/config.json and change the value of **sarcatStorage**.

***Can I change my default ports?***

* Yes! inside of config/config.json you have the ability to change your default ports of **sarcatPort** & **databasePort**.

***How do I update SARCAT?***

* If you are using git, you can just update the latest with a pull. if you downloaded the zip file, extract it into your home SARCAT directory. It will automatically connect to you latest database if you used the default sarcatdb in your home directory. If you changed this, update the config to reflect your desired settings.



***How do a wipeout my database and start over?***

* As long as this is exactly what you want, you can delete your local copy of the **/sarcatData** from your home directory. The next time you restart SARCAT it will be created again. Or you can simply change the database by updating the config.json.


***I am _still_ having trouble installing!***

* SARCAT is intended to be used as a web server. If installing on a local network, you may need to contact your administrator to be granted access rights to install. While the steps and dependencies are minimal for this software, proper knowledge of your network is important to ensure quality.

*   Ensure proper priveleges are set on your machine and install paths
*   Check firewall settings.
*  You may have mongo already running on your machine and unable to create a new port for it. Check out [this reference](http://www.howtogeek.com/145882/how-to-kill-a-process-from-the-cli-in-windows/) to kill a running process 
* If you have npm installed, you can try removing your **/node_modules** directory and `npm install` to install again.
*   Feel free to contact us with any question or concerns you may have. This is an open source project and we encourage collaboration in order to create the best product possible!



* * *

## **Feedback** ##

We would love to hear any feedback you have on the app. For technical support, contact *kyle.kalwarski@azimuth1.com*. For other general inqueries, contact Robert Koester at *robert@dbs-sar.com*

And don't forget to check out our Lost Person Behavior mobile app available for iOS & Android today!

----------

## More Documentation to come! ##


----------


## **Advanced Installation** ##
*If you already have node v0.10.36 & mongo installed on your system and know your way around a bit more (or want to learn), this is for you. Or if you want to learn, this is your chance! Follow instructions bellow to build the latest release from source*

## **DEPENDENCIES:** ##


#### **Node.js v0.10.6** ####
 *Select your installer below. Follow the prompts (Accept the license agreement, click the NEXT button a bunch of times and accept the default installation settings).*

 - [Windows Installer <small>node-v0.10.36-x86.msi</small>](https://nodejs.org/dist/v0.10.36/node-v0.10.36-x86.msi)
 - [Macintosh Installer <small>node-v0.10.36.pkg</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36.pkg)
 - [Linux Installer <small>node-v0.10.36.tar.gz</small>](http://nodejs.org/dist/v0.10.36/node-v0.10.36-linux-x64.tar.gz)


#### **MongoDB v3.0.4** ####
 *Mongo is the powerful database behind SARCAT. Follow the instructions to get up and running with mongo! SARCAT has been tested with the latest version: v3.0.4. Mongo has great [documentation](http://docs.mongodb.org/manual/) to walk you through the install to be up and running quickly!*


  *   [Download Mongo now!](https://www.mongodb.org/downloads)


----------


## **Download SARCAT** ##
* Make sure you have the required dependencies. Then download the standalone version (w/out node/mongo) from github [here](https://github.com/Azimuth1/SARCAT/archive/master.zip).  


    git clone https://github.com/Azimuth1/SARCAT
    cd SARCAT
    npm install
    npm build
    npm start









#### **Build for target platform:** ####
* **Windows:**
`node scripts/run.js win32`
* **Mac:**
`node scripts/run.js darwin`
* **Linux:**
`node scripts/run.js linux`
