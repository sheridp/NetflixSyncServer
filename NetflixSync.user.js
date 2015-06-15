//Copyright Patrick Sheridan, 2015
// This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.

// ==UserScript==
// @name       NetflixSync
// @version    0.1
// @description  A small script to allow netflix syncing via websockets
// @match        *://www.netflix.com/WiPlayer*
// @grant       GM_addStyle
// @require http://code.jquery.com/jquery-latest.js
// @updateURL 
// @downloadURL 
// ==/UserScript==



var zNode       = document.createElement ('div');

/*jshint multistr: true */
zNode.innerHTML = '<button id="nfSyncPauseButton" type="button">Pause</button> \
                   <button id="nfSyncPlayButton" type="button">Play</button>   \
                   <button id="nfSyncSyncButton" type="button">Sync</button>   \
                   <button id="nfSyncBack10s" type="button">Back 10s</button>'  ;

zNode.setAttribute ('id', 'nfSyncTools');
$(".player-video-wrapper").after(zNode);

//$("#page-WiPlayer").mousemove( function(event){ $("#nfSyncTools").fadeIn();  } );

//--- Activate the newly added button.
$("#nfSyncPauseButton").click('Pause', PlayPauseNetflix);
$("#nfSyncPlayButton").click('Play', PlayPauseNetflix);
$("#nfSyncSyncButton").click(SendSynchronize);
$("#nfSyncBack10s").click(Back10s);


var timer;
$( document ).ready( function(){
                    $(document).mousemove(function() {
                        if (timer) {
                            clearTimeout(timer);
                            timer = 0;
                        }

                        $('#nfSyncTools').fadeIn();
                        timer = setTimeout(function() {
                            $('#nfSyncTools').fadeOut()
                        }, 3000)
                    })}
                   )


var syncDelay = 1000;
var vp = netflix.cadmium.objects.videoPlayer();
var syncServer = new WebSocket("ws://CHANGE_ME.com:PORT");

function Back10s(){
    console.log(frame);
    var frame = vp.getCurrentTime();
    vp.seek(frame - 10000);
    console.log(frame);
}

function SendSynchronize(){
    var frame = vp.getCurrentTime();
    var msg = {action : "Sync", frame : frame};
    syncServer.send(JSON.stringify(msg));
    vp.seek(frame); //Seems to be necessary for unknown reason
}

function PlayPauseNetflix (event) {
    var action = event.data;
        
    if(action == "Play"){
        setTimeout( function(){ vp.play(); }, syncDelay );
    }
    else if(action == "Pause") { 
        vp.pause();
    }
    
    var msg = {action : action, time : Date.now() };
    syncServer.send(JSON.stringify(msg));
}

syncServer.onmessage = function (event) {
    var msg = JSON.parse(event.data);

    if(msg.action == 'Play'){
        var msgTime = Number(msg.time);
        var delay = syncDelay - ( Date.now() - msgTime );
        setTimeout( function(){ vp.play(); }, delay );
        //$("#nfSyncTools").fadeOut();
    }
    else if(msg.action == 'Pause'){
        vp.pause();
        $("#nfSyncTools").fadeIn();
    }
    else if(msg.action == 'Sync'){
        vp.seek(Number(msg.frame));
    }
    else {
        console.log(msg);
    }
}

//--- Style our newly added elements using CSS.
GM_addStyle ( multilineStr ( function () {/*!
    #nfSyncTools {
        position:               absolute;
        top:                    0;
        left:                   0;
        font-size:              20px;
        background:             orange;
        border:                 3px outset black;
        margin:                 5px;
        opacity:                0.9;
        z-index:                222;
        padding:                5px 20px;
    }
    #nfSyncPauseButton {
        cursor:                 pointer;
    }
    #nfSyncTools p {
        color:                  red;
        background:             white;
    }
*/} ) );

function multilineStr (dummyFunc) {
    var str = dummyFunc.toString ();
    str     = str.replace (/^[^\/]+\/\*!?/, '') // Strip function () { /*!
    .replace (/\s*\*\/\s*\}\s*$/, '')   // Strip */ }
    .replace (/\/\/.+$/gm, '') // Double-slash comments wreck CSS. Strip them.
    ;
    return str;
}

window.onbeforeunload =  function (event) {
    syncServer.close();
};
