SARCAT STATUS:






COMPLETE:

GENERAL
* Binary packaged in a tarball for easy installation.
* Support for Windows/iOS/Linux.



USER SECURITY
* secure bcrypt Login.
* Allow first setup user to create default admin with default secure fixed password.
* Prevent users from accessing admin dash.
* Allow access if user forgets password using key questions.

DATABASE SECURITY
* NOSQL database with access restrictions. 
* Security Updating/Deleting/Inserting Records.
* Prevent users from overwritting data.
* Prevent visitors from accessing data.
* Keep a versioned database in case of accidental deletion.


Administrator:
* Grants roles/privileges to users.
* Deletes Users.
* Sets default field inputs for user forms.
* Sets visible field inputs for user forms.
* Submits Data back to ISRID.

FORMS
* Autovalidation - Make sure Fields are filled in correctly. (i.e. Dates are in Date inputs, numbers are in numerical inputs).
* AutoSave & Update - prevents user from forgetting to hit "Save".
* Weather API auto fills weather data.
* Notifies user what fields need to be complete before submitting.


USER:
* Can share data or make public for other verified users to edit.
* Generates a custom Profile which autofills specific fields for unique users.




The backend support is in a stable state. The security is very tight and database integrity is upheld. I am now at the stage where I am incorporating all of these server side abilities into the UI.

I do have some questions about specific form inputs. However, creating a solid architecture that can support all types of data is the primary focus for now.

It's better to have an ugly car that runs perfectly than a nice looking car that is broken! Haha - that's my metaphor of the day.. What I mean is the UI components are the easy part now that the backbone is complete.
SARCAT is in a pretty solid state as far as its architecture. Now the peices are being put into the UI and the frame is being built. Once everything is in there, I will style and finalize. And this is when we will also make adjustments to the user form worflow. Because it will be much easier to make changes when the archetecture can support what is required.


user email when create account
default: admin creates 
incident vs mission(not all have)

incident # - admin setting
export file - default is only admin can send... or USER CAN SEND
computer cannot send out
weather & geolocation api block
only send file
subject category wizard
read only users
cool user home page
spider line map
colorcode find locationd by fatality/survive