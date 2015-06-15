Things you'll need.
1) Python
2) TamperMonkey (for Chrome) or Greasemonkey (for Firefox, untested though)


How to run:

1)  You'll need to set up a server so that all clients can communicate.
	Open a terminal, and cd into SimpleWebsocketServer
	type python SimpleExampleServer.py --example chat

2)  You'll need to edit NetflixSync.user.js to use the location of the server
	you just created, this is done on line 50.

3)  You'll need to install the NetflixSync.user.js script into TamperMonkey
	- Click the TM addon and select add new script. Copy and paste the contents
	of NetflixSync.user.js into the new script.


Now for everyone you want to sync with, you just have them install the same NetflixSyncServer.user.js script 
-- you only need one SyncServer running.


ToDo:
- Submit NetflixSync.user.js to TamperMonkey repository so that updates are automatically pushed
- Make SyncServer configurable from the front-end to allow easier server selection
- Implement password-protected access on the SyncServer backend to restrict who can access (and thus pause) your video



