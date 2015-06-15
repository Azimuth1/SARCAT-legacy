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















*Create a SARCAT Account (vs join)
*View Create Edit your SAR teams Records

*Challenge setup for password recorvery

default role is viewer



first admin user creates an organization profile.
Location/Agency info/Phone #


pill boxes show x/total filled in

*Created By vs Prepared By

Track IP


Changing form status affects all forms - database is always platinum


Dashboard => Admin Tools
My SAR Team Stats...










delete logo
ipp - red X
subject category description page
change domain names to simpler names


"Runaway"

subject sub-category vs subj desc


water incdiecnt  - fall into river

search - 95% land
incident type = water then environment = water

impervious layer = population desity

alert when moving IPP - are you sure


alert on UI for bug fix

trackoffset - diastance form nearest linear feature

travel bearing - ipp angle = 30, find = 31..dispersion = 1;




find-feature - use NLCD to get value... 

add Lock to Personal Subject Info
dont let viewer see information

add evacuation methof to subject

signalling - add to rescue

other Resources

incident status - radio button

precip type = none

style injured searcher









Initial Load page
• Underneath SARCAT it says “Missing Persons Database” it should be changed to “Search & Rescue Incident Database”

Done

• Underneath “SARCAT .....” add the chance to add in the organization/agency name much like we added the option to add the organization/agency logo.

It becomes a bit cluttered - so I defaulted to the iconin the top right


• Perhaps at the bottom of the page add the ISRID logo.

I think putting this on the "About" page will be good. I do have the isrid logoon the export button.

• Need to add forgot password link Agency Profile
This is one of those items that has proved to be trickier than I hoped. The admin can reset a user. I plan to improve this. But shouldn't hold us back for now.


• Add, inputting the Agency/Organization name (or use from above) to appear on the load page.

Trying to reduce clutter became a priority with the logos. This should be clear to the admin.

• Add, county to the agency profile, as an option
To Do

• Here is a possible issue I’m not sure the best way to approach. Say a statewide organization is
using SARCAT. Individual users are from various SAR teams or county’s around the state. We will want the user’s county or team to be entered into the database. (We also need to add county or team to the data collection form). Ideally, the county or team can be prepopulated based upon the user profile. This will become important for the reports. When looking at various state reports, one of the most common tables or graphs is incidents by county, resources by county, types of incidents by county, dollars spent by county. So we will want to be able to capture that and add it into the reports.

We capture all user information for all submitted data. So it can be combined in any way needed.
￼￼￼￼￼￼￼￼
All Records Page
• Move the “*Click column header to sort” from the top right, to the left handed side just above the column headers.

Did a lot of rearranging here to fix some previous bugs. Layout seems pretty sold right now.

• I like the options to hide various record headers
• I think the incident date is less important and might not need to be displayed or could be
replaced by county/team, subject type, #subjects
The user can filter the table views. I can set them predefined also. This is heavily tied to the data schema, so customizing will take some more work. 


• Might consider putting some of the most important record stats above the incident record title
bar. This would include a radio button for current year/total. An stats for o Total#ofincidents
o Total#ofmissions
o Total#ofsubjects
o Total#ofsaves
o Totalcost
o Totalpersonalhours

A lot of this is in the stats page. I can look at adding some basic stats to the list view also on the next go-around.


Map Comments

• Suggest changing the order of tabs so that decision point is in front of find location and route.

This format has changed a lot since the last revision. I think I found a pretty nice order to things!

• Need the word revised in front of Last Known Point/Point Last Seen. If too long ok to say
“Revised LKP/PLS

Revised is now only shown is lkp/pls is marked as different from ipp. This clears some page clutter.

• I like the measurement tool but a few items
o A different icon perhaps. I would not have guessed an arrow is a measuring tool. I’m thinking a ruler, calipers, or compass.
o Need to switch the units based upon the preferences being used. I would say either miles or kilometers. Right now it is showing nautical miles.

Done and done!


• Here is what the IPP icon looks like from MapSAR , I would also be ok with the x inside a circle,
the x can touch the sides of the circle.

Having consistent markers really makes the map much cleaner. Check out the x now. 

• Under IPP type, we should add, incident location for rescues and such.
Done

• Under IPP Classification we need to add Cellular forensics
Done
• Direction of travel suggestions Match color above
Done

o InitialDirectionofTravelboxshouldshowbearingnumber
Done


o In find feature match the options found in the ISRID document (page41-42)
o Add Investigative findcheckbox(describedISRIDpage39)
o Add investigative finddetails(page39)
o Add Find Accuracy (page 40) for options. While the options are for meters it could just
as easily be 1 yard, 10 yards, 100 yards, or half mile if the US measurements are chosen • Data outputs below
o Great to have distance from IPP. But need to show units. I would suggest that we use the US or metric preference and already show the units in miles or km depending upon the preference.
Done

Dispersionanglewillbethedifferencebetweenthefindbearingandtheinitialdirection of travel.
o Track offset (units should be meters or yards depending upon preference). User will need to fill this in most likely.
o Elevationchange,shouldbefeetormetersdependinguponuserpreference. Record information
• With IE the time and date tools do not open
Incident Details
• Add, the county, for US might be able to use a shapefile.
• Add, disaster checkbox
• Add, disaster types (if checked) see list on page 16-17 of ISRID standards
Weather
• Might add to *Powered by Forecast based on Incident Date & Location. User may edit.
• Ideally units should match user preference for US or Metric. Keep in mind that the actual ISRID
standard is to use metric or SI in the actual final database.
• Platinum standard also has a field for Light (see page 36), rain type, and snow type.
Incident Outcome
• Lost strategy, be sure to follow option list found in ISRID guidelines (page 43-44)
• Add mission cause here, follow ISRID guidelines (page 45)
• Find feature moved to find map box
￼
Rescue Details
• Keep Signaling
• Correct spelling of Signaling
• Move injured searcher details to new tab called Incident Safety
• Add series of checkboxes for rescue methods (see page 49 of ISRID standards)
Incident Safety
• New tab (this is all platinum level by the way)
• Move Injured/Killed Searcher/Rescuer check button here
• Move Injured/Killed Searcher/Rescuer Details here
• Add Lost/Damaged equipment checkbox
• Add Lost/Damaged equipment details comment field
• Add Near miss checkbox
• Add Near miss details comment field
Subject Info
• I love it
• Let’s make personal information turned off by default on the admin settings. When they turn it
on, a pop-up window will verify they wish to maintain such data and it may have HIPPA or PII implications. I also believe we said this particular data would be encrypted. I also happened to just notice that the entire form interface is via http, shouldn’t it be via https?
• Weight and height should be either Lbs/in or kg/cm depending upon unit preferences
• I’m thinking that evacuation method can come out since it will be redundant with the rescue
details box
• Will need to look at the details of firmly locking down the personal information so that only the
admin and editor can look at those details, might consider requesting password or login credentials again. Perhaps Jason may have some ideas. Another reason all of this should really be sent via https
• Any standards required for PII or HIPPA?
• Since the basic levels require far less information in this field, I would also recommend adding
the following boxes: o #Well
o #Injured
o #DOA
o #NotFound o #Saves
o Theseboxescouldbeabovetheindividualsubjectinformationheaders.
• Potentially, you could add up the Well, Inured, DOA, and not found totals and then
automatically set the number of subject rows needed
Comments
• Looks good
• Just a thought that I’m not sure where to stick. When a pull down field has the option of other,
that remains a mystery. Either, we have some type of ability of insert a text field to collect what other actually is. In the database I would like to see something like Other- space vehicle crash. So one thought I had (I have never seen this so it might be too difficult) is that whenever other is checked it adds that field name and the word other into the comments, with the hope the user adds the details.
Record Files
• Looks good.
Cross all boxes – Incident times see page 27
• I think the four critical times with the current format might lead to several users being confused.
• In the Record Info we have the Incident Date/Time. I would typically think that means the time
the incident starts from the agency perspective, or when the agency first heard about the
incidents, often with a little bit of a lag prior to SAR resources being formally requested.
• The four times in the ISRID standards are:
o Date/Timesubjectlastseenoraccidentoccurred
o Date/TimeSARresourcesrequested(whichisalittledifferentthannotified) o Date/TimeSubjectLocated(inincidentoutcomethisisfine)
o Date/TimeIncidentClosed(inincidentoutcomethisisfine)
• So change SAR Notified to SAR requested in the Incident Details
• I’m not sure what to do with the Incident Date/time in the record box. That might serve as the
Incident notification and could be used to populate the incident records box
• Need a very clear box labeled Date/Time subject last seen or accident occurred (for rescues), I’m
not 100 percent sure where that box should go.
• In the Incident Outcomes athte bottom I would like to see four boxes showing calculated time
durations (in hours)
o Notifyhours:elapsedtimefromlastseentime/accidentoccurredtoSARrequested o Searchhours:elapsedtimefromSARrequestedtofind
o TotaltimeLosthours:elapsedtimefromlastseentimetosubjectfound(orsum)
o TotalIncidenttime:elapsedtimefromSARrequestedtoIncidentClosed.

*fouynd alive vs dead different colors showing where they are

add data import