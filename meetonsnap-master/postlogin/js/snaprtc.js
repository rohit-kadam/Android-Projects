
/*********************************WebRTC globals**********************************/

var SNAPSIGNALSERVER = 'http://meetonsnap.com:5280/http-bind/',
    RTC = null,
    RTCPeerConnection = null,
    MYPEERCONNECTION = null,
    SNAPSIGNALCONN = null,
    SNAPSIGNALCONNSTATUS = false,
    isChrome = !!navigator.webkitGetUserMedia,
    isFirefox = !!navigator.mozGetUserMedia,
    localAudioStream = null,
    localVideoStream = null,
    media_constraints = {mandatory: {'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true}},
    WEBRTCDEBUG = true,
    MYBAREJID,
    WEBRTCCALLSTATUS = 0,
    CALLINGCOUNT = 0,
    MONITORRESPONSE = 0;
    if (isFirefox) media_constraints.mandatory.MozDontOfferDataChannel = true;

/*********************************WebRTC functions**********************************/

//log function for debug
var snapDebug = function(logme) {if(WEBRTCDEBUG) console.log(logme);};

//setup RTC object based on browser
var snapSetupInit = function() {
    if(RTC) return true;
    if (isFirefox) {
        snapDebug('Firefox');
        var version = navigator.userAgent.match(/Firefox/) ? parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10) : 0;
        if (version >= 22) {
            RTC = {
                peerconnection: window.mozRTCPeerConnection,
                getUserMedia: navigator.mozGetUserMedia.bind(navigator),
                attachMediaStream: function (element, stream) { element.attr('src', URL.createObjectURL(stream));},
                pc_constraints: {'optional': [{'DtlsSrtpKeyAgreement': 'true'}]} 
            };
            if (!MediaStream.prototype.getVideoTracks) MediaStream.prototype.getVideoTracks = function () { return []; };
            if (!MediaStream.prototype.getAudioTracks) MediaStream.prototype.getAudioTracks = function () { return []; };
            RTCSessionDescription = window.mozRTCSessionDescription;
            RTCIceCandidate = window.mozRTCIceCandidate;
        }
    } else if (isChrome) {
        snapDebug('Chrome');
        RTC = {
            peerconnection: webkitRTCPeerConnection,
            getUserMedia: navigator.webkitGetUserMedia.bind(navigator),
            attachMediaStream: function (element, stream) { element.attr('src', URL.createObjectURL(stream));},
            pc_constraints: {'optional': [{'DtlsSrtpKeyAgreement': 'true'}]} 
        };
        if (!webkitMediaStream.prototype.getVideoTracks) { webkitMediaStream.prototype.getVideoTracks = function () { return this.videoTracks; }; }
        if (!webkitMediaStream.prototype.getAudioTracks) { webkitMediaStream.prototype.getAudioTracks = function () { return this.audioTracks; }; }
    }
    if (RTC === null) return false;
    RTCPeerConnection = RTC.peerconnection;
};

//snap create webrtc peer connection
var snapCreatePeerConnection = function() {
    try {
        MYPEERCONNECTION = new RTCPeerConnection(WEBRTCICECONFIG,RTC.pc_constraints);
    } catch (e) {
        snapDebug('SETUP RTC FAILED');
    }   
    MYPEERCONNECTION.onicecandidate = snapOnWebRTCIceCandidate;        
    MYPEERCONNECTION.oniceconnectionstatechange = snapOnIceConnectionStateChanged;
    MYPEERCONNECTION.onaddstream = snapOnRemoteStreamAdded;    
    snapDebug('CREATE PEER CONNECTION SUCCESS');    
}

//connect to webrtc signaling server
var snapSignalConnect = function() {
    if(SNAPSIGNALCONN && SNAPSIGNALCONN.connected) {
        snapGetContactList();
        return true;
    }
    //create connection to webRTC BOSH server
    SNAPSIGNALCONN = new Strophe.Connection(SNAPSIGNALSERVER);
    SNAPSIGNALCONN._hitError = function (reqStatus) {
        snapDebug('STROPHE CONNECT ERROR...!');
        if(reqStatus == 0 && SNAPSIGNALCONNSTATUS != false) {
            SNAPSIGNALCONNSTATUS = false;
            snapNotifyBox('Oops, connection to server is temporarily down','error');
        }
    }
    SNAPSIGNALCONN.connect(MYJID,MYPASS, snapSignalOnConnect);
    //SNAPSIGNALCONN.xmlInput = function(stanza) {snapWebRTCMessageHandler(stanza);};    
};

//snap set temporary messages array
var snapSetTemporaryMsg = function(when,msgfrom,msgbody) {
    var nodeid = msgfrom.trim().replace(/[^a-z0-9]+/gi, '_');    
    TEMPMESSAGES[msgfrom].push(msgbody);
    var tempmsgcount = TEMPMESSAGES[msgfrom].length;
    if(CURRENTTAB != 'chat') {
        var ntread = 0;
        $.each(TEMPMESSAGES,function(k,v) {
            ntread += TEMPMESSAGES[k].length;
        });
        if(ntread > 0) $('#unreadchat').html('('+ntread+')').show();
        if(when == 'diff' || when == 'old') $('#chatcount_'+nodeid).show().html(tempmsgcount);
        return;
    }
    if(when == 'new') $('#node_'+nodeid).click();
    else if(when == 'diff') $('#chatcount_'+nodeid).show().html(tempmsgcount);
};

//get user media audio video
var getMediaAudioVideo = function(whois,calltype) {
    var constraints = {
        audio: {
            mandatory: {googEchoCancellation: false,googAutoGainControl: false,googNoiseSuppression: false,googHighpassFilter: false},
            optional: []
        }
    };
    if(calltype == 'video') constraints.video = true;
    try {
        RTC.getUserMedia(constraints,
                function (stream) {
                    for (var i = 0; i < stream.getAudioTracks().length; i++) {
                        stream.getAudioTracks()[0].enabled = true;
                        snapDebug('USING AUDIO DEVICE "' + stream.getAudioTracks()[i].label + '"');
                    }
                    for (i = 0; i < stream.getVideoTracks().length; i++) snapDebug('USING VIDEO DEVICE "' + stream.getVideoTracks()[i].label + '"');
                    var message = '';
                    if(whois == 'initiator') {
                        if(calltype == 'audio') {
                            $('#mylocalVideo'+CURRENTCHAT).hide();
                            message = "SNAP::AUDIO_CHAT";
                        } else if(calltype == 'video') {
                            $('#mylocalVideo'+CURRENTCHAT).show();
                            $('#mylocalVideo'+CURRENTCHAT).html("<video  style='width:100%;height:100%;display:block;' src='"+URL.createObjectURL(stream)+"'></video>");
                            message = "SNAP::VIDEO_CHAT";
                        }
                    } else if(whois == 'responder') {

                        CURRENTWEBRTCNODE = CURRENTCHAT;
                        CURRENTWEBRTCCHAT = CURRENTCHATJID;
                        $('#snapStickyMsg'+CURRENTCHAT).html('').hide();
                        if(calltype == 'video') {
                            $('#mylocalVideo'+CURRENTCHAT).show();
                            $('#mylocalVideo'+CURRENTCHAT).html("<video  style='width:100%;height:100%;display:block;' src='"+URL.createObjectURL(stream)+"'></video>");
                            message = "SNAP::VIDEO_CHAT_ACCEPTED";
                        } else if(calltype == 'audio') {
                            $('#mylocalVideo'+CURRENTCHAT).hide();
                            message = "SNAP::AUDIO_CHAT_ACCEPTED";
                        }
                        WEBRTCCALLSTATUS = 1; 
                        $('#snapChatContainer'+CURRENTCHAT).hide();
                        $('#snapVideoBox'+CURRENTCHAT+',#snapLoader'+CURRENTCHAT).show();
                    }
                    snapSendMessage(CURRENTCHATJID,message);
                    snapAddChatMessage(SYSMESSAGES[message],'sentmess');                    
                    if(calltype == 'audio') localAudioStream = stream;
                    else if(calltype == 'video') localVideoStream = stream;
                    MYPEERCONNECTION.addStream(stream);
                },
                function (error) {
                    handleHardwareError(whois,error,CURRENTCHATJID);
                });
    } catch (e) {
        handleHardwareError(whois,{name:'notDefined'},CURRENTCHATJID);
    }
};

var handleHardwareError = function(whois,error,tojid) {
    $('#snapStickyMsg'+CURRENTCHAT).html('').hide();
    if(error.name != undefined) {
        var err  = error.name;
        var errMsg = '';
        switch(err) {
            case 'DevicesNotFoundError':
                errMsg = 'SNAP::NO_HARDWARE';
                break;
            case 'PermissionDismissedError':
            case 'PermissionDeniedError':
                errMsg = 'SNAP::DENIED_HARDWARE';
                break;
            case 'SourceUnavailableError':
                errMsg = 'SNAP::BUSY_HARDWARE';
                break;                                
            case 'notDefined':
                errMsg = 'SNAP::ERR_HARDWARE';
                break;
        }
        var errDesc = SYSMESSAGES[errMsg];
        if(whois == 'initiator') snapAddChatMessage(errDesc,'sentmess');
        else if(whois == 'responder') {
            errDesc = SYSMESSAGES[errMsg];
            snapAddChatMessage(errDesc,'sentmess');
            errDesc = SYSMESSAGES[errMsg+'_RESP'];
            snapRejectCall(errDesc,tojid);
        }
    }
};

/*********************************WebRTC callbacks**********************************/

var onPresenceCallback = function (presence) { 
    var type = presence.getAttribute('type'); 
    var from = presence.getAttribute('from'); 
    var from_barejid = Strophe.getBareJidFromJid(from);
    if(from_barejid == MYBAREJID) return true;
    var nodeid = from_barejid.trim().replace(/[^a-z0-9]+/gi, '_');
    if(type && type != undefined) {
        switch(type) {
            case 'subscribe':
                snapGetContactList();
                snapDebug('SUBSCRIBE');
                SNAPSIGNALCONN.send($pres({ to: from, type: "subscribed"}));
                $('#userStats_'+nodeid).html("<i class='fa fa-circle text-success'></i> Online");
                break;
            case 'subscribed':
            case 'available':
                snapDebug('AVAILABLE RCVD: '+from);
                CONTACTSTATUS[from_barejid] = 1;
                $('#userStats_'+nodeid).html("<i class='fa fa-circle text-success'></i> Online");
                break;
            case 'unavailable':
                snapDebug('UNAVAILABLE RCVD: '+from);
                CONTACTSTATUS[from_barejid] = 0;
                $('#userStats_'+nodeid).html("<i class='fa fa-circle text-danger'></i> Offline");
                break;
        };
    }
    return true; 
};

//webrtc callback on strope connection.connect success
var snapSignalOnConnect = function(status) {
    if (status == Strophe.Status.CONNECTING) {
        snapDebug('Hey, connecting to WebRTC......!');
    } else if (status == Strophe.Status.CONNFAIL) {
        snapDebug('Aw, Snap connecting to WebRTC failed.');
    } else if (status == Strophe.Status.DISCONNECTING) {
        snapDebug('Thank you for using WebRTC. Disconnecting.....!');
    } else if (status == Strophe.Status.DISCONNECTED) {
        SNAPSIGNALCONNSTATUS = false;
        snapDebug('Disconnected.');
    } else if (status == Strophe.Status.CONNECTED) {
        snapDebug('Hey, you are now connected. Enjoy SNAP calling!');
        var iq = $iq({type: 'set', id: 'auto1'}).c('auto', {xmlns: 'urn:xmpp:archive', save: true});
        SNAPSIGNALCONN.send(iq);        
        snapGetContactList();
        MYBAREJID = Strophe.getBareJidFromJid(SNAPSIGNALCONN.jid);
        SNAPSIGNALCONNSTATUS = true;
        SNAPSIGNALCONN.addHandler(onPresenceCallback, null, "presence");
	SNAPSIGNALCONN.addHandler(snapWebRTCMessageHandler, null, 'message');
        SNAPSIGNALCONN.send($pres({type: "available"}));
    } else if (status === Strophe.Status.ATTACHED) {
        snapDebug('Strophe is attached.');
    }
};

//on call active
var snapOnCallActivated = function(elem) {
    CALLINGCOUNT = 100;
    $('#snapLoader'+CURRENTWEBRTCNODE).hide();
    var vidhei = $('#snapVideoContainer'+CURRENTWEBRTCNODE).height() - 20;
    $(elem).css('min-height', vidhei);
    $(elem).appendTo('#snapVideoContainer'+CURRENTWEBRTCNODE);
    snapShowHideCallCtrls('callactive');
    CALLDUR = [0,0];
    snapStartCallTimer();
};

//on ice connection state changed
var snapOnIceConnectionStateChanged = function(event) {
    snapDebug('ISC '+ MYPEERCONNECTION.iceConnectionState);
    snapDebug('SSC '+ MYPEERCONNECTION.signalingState);
    var iceconstats = MYPEERCONNECTION.iceConnectionState;
    if(iceconstats == 'disconnected' || iceconstats == 'failed') {
        snapOnCallDisconnected(iceconstats);        
    } else if(iceconstats == 'connected') {
        snapAddChatMessage('Call connected','recvmess');
    } 
};

//on call disconnected
var snapOnCallDisconnected = function(iceconstats) {
    if(typeof iceconstats == 'undefined') iceconstats = '';
    snapShowHideCallCtrls('callend');
    WEBRTCCALLSTATUS = 0;
    CURRENTWEBRTCNODE = '';
    CURRENTWEBRTCCHAT = '';

    snapStopLocalMedia();
    var msg = SYSMESSAGES['SNAP::END_CALL'];
    if(iceconstats == 'disconnected') {
        msg = SYSMESSAGES['SNAP::DISCONNECTED_CALL'];
    } else if(iceconstats == 'failed') { 
        msg = SYSMESSAGES['SNAP::FAILED_CALL'];
    }
    snapAddChatMessage(msg,'recvmess');
};

//wait for remote media stream 
var waitForRemoteVideo = function(selector,stream) {
    var videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0 || selector[0].currentTime > 0) {
        snapDebug('WRMV-AV SESSID');
    } else {
        setTimeout(function () { waitForRemoteVideo(selector,stream); }, 100);
    }
};    

//wait for remote media stream 
var waitForRemoteAudio = function(selector,stream) {
    var audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0 || selector[0].currentTime > 0) {
        snapDebug('WRMV-AU SESSID');
    } else {
        setTimeout(function () { waitForRemoteAudio(selector,stream); }, 100);
    }
};

//on remote media stream added
var snapOnRemoteStreamAdded = function(data) {
    var stream = data.stream;
    var isaudio = stream.getAudioTracks().length;
    var isvideo = stream.getVideoTracks().length;
    $('#snapMic'+CURRENTWEBRTCNODE).hide();
    if(isvideo) {
        snapDebug('RSA-V-S SESSID');
        var contwid = $("#snapVideoContainer"+CURRENTWEBRTCNODE).outerWidth();
        var vidwidth = contwid - 50;
        $("#snapVideoControl"+CURRENTWEBRTCNODE).css('width',contwid);        
        var el = $("<video autoplay='autoplay' class='screenShareVideo' />").attr('id', 'largevideo'+CURRENTWEBRTCNODE);
        RTC.attachMediaStream(el, data.stream);
        snapOnCallActivated(el);
        waitForRemoteVideo(el,stream);
    } else if(isaudio && !isvideo) {
        snapDebug('RSA-AU SESSID');
        $('#snapMic'+CURRENTWEBRTCNODE).show();
        var el = $("<audio autoplay='autoplay' class='screenShareAudio' style='display:none;' />").attr('id', 'largeaudio');
        RTC.attachMediaStream(el, data.stream);
        snapOnCallActivated(el);
        waitForRemoteAudio(el,stream);
    }
};

//initiate webrtc call
var snapInitWebRTCCall = function() {
    WEBRTCCALLSTATUS = 1;
    snapDebug('CALLING ');
    snapSendWebRTCOffer();
    snapCallingStatus();
};

var snapCallingStatus = function() {
    if(CALLINGCOUNT == 100) return;
    if(CALLINGCOUNT >= 3)  {
        snapDebug('Responder went away. Hence ending call');
        snapOnCallDisconnected('failed');
        return;
    }
    CALLINGCOUNT++;
    snapSendWebRTCMessage('SNAP::WebRTC_Call_Monitor');
    setTimeout(snapCallingStatus,5000);    
}

//terminate webrtc call
var snapEndWebRTCCall = function() {
    snapDebug('TERMINATING ');
    snapStartCallTimer('stop');
    WEBRTCCALLSTATUS = 0;
    CURRENTWEBRTCNODE = '';
    CURRENTWEBRTCCHAT = '';
    MYPEERCONNECTION.close();
};

//stop local media allowed
var snapStopLocalMedia = function() {
    if(localVideoStream && localVideoStream.getVideoTracks().length) localVideoStream.getVideoTracks()[0].stop();
    if(localVideoStream && localVideoStream.getAudioTracks().length) localVideoStream.getAudioTracks()[0].stop();
    if(localAudioStream && localAudioStream.getVideoTracks().length) localAudioStream.getVideoTracks()[0].stop();
};

//mute unmute audio device
var snapMuteUnmuteAudio = function(mutstatus) {
    if(localVideoStream && localVideoStream.getAudioTracks().length) localVideoStream.getAudioTracks()[0].enabled = (mutstatus ==0 ) ? false : true;
    else if(localAudioStream && localAudioStream.getAudioTracks().length) localAudioStream.getAudioTracks()[0].enabled = (mutstatus ==0 ) ? false : true;
};

//mute unmute video
var snapMuteUnmuteVideo = function(mutstatus) {
    if(localVideoStream && localVideoStream.getVideoTracks().length) localVideoStream.getVideoTracks()[0].enabled = (mutstatus ==0 ) ? false : true;
};

//call timer displaying call active since
var snapStartCallTimer = function(stop) {
    if(typeof stop != 'undefined') {
        $('#snapCallActiveSince'+CURRENTWEBRTCNODE).html('').hide();
        return;
    }
    if(CALLDUR[1] > 60) {
        CALLDUR[1] = 0;
        CALLDUR[0]++;
    }
    var mns = CALLDUR[0];
    var scs = CALLDUR[1];
    var unit = 'secs';
    if(CALLDUR[0] < 10) mns = '0'+mns;
    if(CALLDUR[1] < 10) scs = '0'+scs;
    if(CALLDUR[0] > 0) unit = 'mins';
    var txt = mns+' : '+scs+' '+unit;
    $('#snapCallActiveSince'+CURRENTWEBRTCNODE).html(txt).show();
    CALLDUR[1]++;
    setTimeout(snapStartCallTimer,1000);
};



/*********************************` WEBRTC FUNCS**********************************/

//stringify json oject
var stringifyJson = function(jsonObj) {
    var jsonString = JSON.stringify(jsonObj);
    return jsonString;
};

//send messages
var snapSendWebRTCMessage = function(message,msgType) {
    if(typeof msgType == 'undefined') msgType = '';
    var msgObj = {
        to: CURRENTWEBRTCCHAT,
        type: 'chat',
        webrtcmsgtype: msgType,
        id: 'msg' + Math.floor((Math.random() * 1000) + 1)
    };
    var msg = $msg(msgObj)
    .c('body').t(message).up()
    .c('active', {xmlns: 'http://jabber.org/protocol/chatstates'});
    SNAPSIGNALCONN.send(msg);
};

//set local description
var snapSetWebRTCLocDesc = function(sdp) {
    MYPEERCONNECTION.setLocalDescription(sdp,
        function () { snapDebug('SLD SUCCESS'); },
        function (e) {
            snapDebug('SLD FAILED');
            snapDebug(e.message);
        }
    );
};

//send offer sdp
var snapSendWebRTCOffer = function() {
    MYPEERCONNECTION.createOffer(function(sdp) {
        snapDebug('CREATE OFFER SUCCESS');
        var sdpmsg = stringifyJson(sdp);
        snapSendWebRTCMessage(sdpmsg,'SNAP::Offer');
        snapDebug('SEND OFFER SUCCESS');
        window.setTimeout(function() {snapSetWebRTCLocDesc(sdp);},300,sdp);
    },function(e) {
        snapDebug('CREATE OFFER FAILED');
        snapDebug(e.message);
    },media_constraints);       
};    

//send answer sdp
var snapSendWebRTCAnswer = function(offersdp) {
    MYPEERCONNECTION.setRemoteDescription(new RTCSessionDescription(offersdp),
        function() {
            snapDebug('SRD SUCCESS');
            MYPEERCONNECTION.createAnswer(function(sdp) {
                snapDebug('CREATE ANSWER SUCCESS');
                var jsonsdp = stringifyJson(sdp);
                snapSendWebRTCMessage(jsonsdp,'SNAP::Answer');
                snapDebug('SEND ANSWER SUCCESS');
                window.setTimeout(function() {snapSetWebRTCLocDesc(sdp);},300,sdp);                
                window.setTimeout(function() {snapSendMonitorCallInfo();},5000);
            },function(e) {
                snapDebug('SEND ANSWER FAILED');
                snapDebug(e.message);
            },media_constraints);
        },function(e) {
            snapDebug('SRD FAILED');
            snapDebug(e.toString());
        }
    );
};


//webrtc message handler
var snapWebRTCMessageHandler = function(message) {
    var from_fulljid = $(message).attr('from'); 
    var msgbody = $(message).find('body').text(); 
    var msgtype = $(message).attr('type'); 
    var webrtcmsgtype = $(message).attr('webrtcmsgtype'); 

    if(from_fulljid != '' && from_fulljid != undefined) {

        if(webrtcmsgtype) {
            var msgbody = $('<div/>').html(msgbody).text();
            if(webrtcmsgtype == 'SNAP::Answer') snapHandleWebRTCRemoteAnswer(msgbody);
            else if(webrtcmsgtype == 'SNAP::Offer') snapHandleWebRTCRemoteOffer(msgbody);
            else if(webrtcmsgtype == 'SNAP::Candidate') snapHandleWebRTCRCCandidates(msgbody);
            return true;
        }

        if(msgtype == 'chat') {
            msgfrom  = Strophe.getBareJidFromJid(from_fulljid);
            var nodeid = msgfrom.trim().replace(/[^a-z0-9]+/gi, '_');
            if(CURRENTCHAT == '') {
                CURRENTCHAT = nodeid;
                CURRENTCHATJID = msgfrom;
                $('#node_'+nodeid).click();
                if(msgbody.indexOf('SNAP::') == -1) return true;
            }
            if(msgbody.indexOf('SNAP::') != -1) {
                if(msgbody == 'SNAP::INCOMPATIBLEBROWSERDETECTED') {
                    snapAddChatMessage(SYSMESSAGES[msgbody],'recvmess');    
                    return true;                        
                } 
                if(msgbody == 'SNAP::VIDEO_CHAT' || msgbody == 'SNAP::AUDIO_CHAT') {
                    if(WEBRTCCALLSTATUS == '1') {
                        snapSendMessage(msgfrom,'SNAP::BUSY_SIG');
                        return true;
                    }
                }
                if(msgbody == 'SNAP::VIDEO_CHAT') {
                    $('#snapStickyMsg'+nodeid).html('').hide();
                    var stickyMsg = "<div class='box snapInsideSticky'>";
                    stickyMsg += "<div class='lockscreen' style='background:none !important;'>";
                    stickyMsg += "<div class='lockscreen-wrapper'>";
                    stickyMsg += "<div class='lockscreen-logo'>";
                    stickyMsg += "<a href='javascript:void(0);' style='font-size: 12px;color:#000;'>You have received a video chat request</a><br />";
                    stickyMsg += "<button class='btn btn-default btn-sm' onclick='snapAcceptVideoChat();'><i class='fa  fa-thumbs-up'></i></button>";
                    stickyMsg += "<button class='btn btn-default btn-sm' onclick='snapDeclineVideoChat();'><i class='fa  fa-thumbs-down'></i></button>";
                    stickyMsg += "</div></div></div></div>";
                    $('#snapStickyMsg'+nodeid).html(stickyMsg).show();
                    snapShowHideCallCtrls('callrequest');
                } else if(msgbody == 'SNAP::AUDIO_CHAT') {
                    $('#snapStickyMsg'+nodeid).html('').hide();
                    var stickyMsg = "<div class='box snapInsideSticky'>";
                    stickyMsg += "<div class='lockscreen' style='background:none !important;'>";
                    stickyMsg += "<div class='lockscreen-wrapper'>";
                    stickyMsg += "<div class='lockscreen-logo'>";
                    stickyMsg += "<a href='javascript:void(0);' style='font-size: 12px;color:#000;'>You have received an audio chat request</a><br />";
                    stickyMsg += "<button class='btn btn-default btn-sm' onclick='snapAcceptAudioChat();'><i class='fa  fa-thumbs-up'></i></button>";
                    stickyMsg += "<button class='btn btn-default btn-sm' onclick='snapDeclineAudioChat();'><i class='fa  fa-thumbs-down'></i></button>";
                    stickyMsg += "</div></div></div></div>";
                    $('#snapStickyMsg'+nodeid).html(stickyMsg).show();
                    snapShowHideCallCtrls('callrequest');
                } else if(msgbody == 'SNAP::VIDEO_CHAT_DECLINED') {
                    snapAddChatMessage('Video chat request declined','recvmess');    
                    snapShowHideCallCtrls('callend');
                } else if(msgbody == 'SNAP::AUDIO_CHAT_DECLINED') {
                    snapAddChatMessage('Audio chat request declined','recvmess');    
                    snapShowHideCallCtrls('callend');
                } else if(msgbody == 'SNAP::VIDEO_CHAT_ACCEPTED' || msgbody == 'SNAP::AUDIO_CHAT_ACCEPTED') {
                    WEBRTCCALLSTATUS = 1;
                    CURRENTWEBRTCNODE = nodeid;
                    snapShowHideCallCtrls('callactive');                        
                    var msg = 'Video chat request accepted';
                    if(msgbody == 'SNAP::AUDIO_CHAT_ACCEPTED') msg = 'Audio chat request accepted';
                    snapAddChatMessage(msg,'recvmess');
                    $('#snapChatContainer'+nodeid).hide();
                    $('#snapVideoBox'+nodeid+',#snapLoader'+nodeid).show();
                    snapDebug('INIT CALLTO: '+msgfrom);
                    CURRENTWEBRTCCHAT = from_fulljid; 
                    snapInitWebRTCCall();
                } else if(msgbody == 'SNAP::END_CALL') {
                    snapStopLocalMedia();
                    snapShowHideCallCtrls('callend');
                    snapStartCallTimer('stop');
                    WEBRTCCALLSTATUS = 0;
                    CURRENTWEBRTCNODE = '';
                    snapEndWebRTCCall();
                    snapAddChatMessage(SYSMESSAGES['SNAP::END_CALL'],'recvmess');
                } else if(msgbody == 'SNAP::WebRTC_Call_Monitor_Response') {
                    snapDebug('MONITOR RESPONSE PKT RCVD');
                    MONITORRESPONSE = 0;
                } else if(msgbody == 'SNAP::WebRTC_Call_Monitor') {
                    snapDebug('MONITOR PKT RCVD');
                    snapSendWebRTCMessage('SNAP::WebRTC_Call_Monitor_Response');
                }
                return true;
            }

            if(CURRENTCHAT != nodeid) snapSetTemporaryMsg('diff',msgfrom,msgbody);
            else if(CURRENTCHAT == nodeid) {
                CURRENTCHAT = nodeid;
                CURRENTCHATJID = msgfrom;
                if(CURRENTTAB == 'chat')  snapAddChatMessage(msgbody,'recvmess');
                else snapSetTemporaryMsg('old',msgfrom,msgbody);
            } 
       }
    }
    return true;
};

//handle remote answer packet received
var snapHandleWebRTCRemoteAnswer = function(msgbody) {
    snapDebug('REMOTE ANSWER RECEIVED');
    var answersdp = JSON.parse(msgbody);
    MYPEERCONNECTION.setRemoteDescription(new RTCSessionDescription(answersdp),
        function() {
            snapDebug('SRD SUCCESS');
        },function(e) {
            snapDebug('SRD FAILED');
            snapDebug(e.toString());
        }
    );
};

//handle remote offer packet received
var snapHandleWebRTCRemoteOffer = function(msgbody) {
    snapDebug('REMOTE OFFER RECEIVED');
    var sdp = JSON.parse(msgbody);
    snapSendWebRTCAnswer(sdp);
};

//handle webrtc candidates
var snapHandleWebRTCRCCandidates = function(msgbody) {
    //snapDebug('CANDIDATE RECEIVED');
    var matches = msgbody.match(/\{(.*?)\}/g);
    if(!matches) return;
    $.each(matches, function(k,v) {
        var cand = JSON.parse(v);
        try {
            MYPEERCONNECTION.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: cand.sdpMLineIndex,
                candidate: cand.candidate
            }));
            //snapDebug('ADD ICE CANDIDATE SUCCESS');
        } catch (e) {
            snapDebug('ADD ICE CANDIDATE FAILED');
            snapDebug(e.toString());
        }
    });
};

//on ice candidate change
var snapOnWebRTCIceCandidate = function (event) {
    if (!MYPEERCONNECTION || !event || !event.candidate) return;
    var cand = event.candidate;
    cand = stringifyJson(cand);
    snapSendWebRTCMessage(cand,'SNAP::Candidate');
};


//send message packet to agent to monitor screen sharing call
var snapSendMonitorCallInfo = function() {
    if(WEBRTCCALLSTATUS != 1) return;
    if(MONITORRESPONSE >= 3)  {
        snapDebug('Agent went away. Hence ending call');
        snapOnCallDisconnected('disconnected');
        return;
    }
    MONITORRESPONSE++;
    snapSendWebRTCMessage('SNAP::WebRTC_Call_Monitor');
    setTimeout(snapSendMonitorCallInfo,5000);
};

var loadWebRTC = function() {
    snapSetupInit();
    snapSignalConnect();
};
