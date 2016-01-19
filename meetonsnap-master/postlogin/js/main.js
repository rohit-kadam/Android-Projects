/*************************************SNAP CONSTANTS****************************************/
var CONTROLLERURL = "php/controller.php",
	CONTACTLIST = [],
	CONTACTSTATUS = [],
	INVITELIST = {},
	CURRENTCHAT = '',
	CURCONTACTID = '',
	CURRENTCHATJID = '',
	CURRENTCHATNAME = '',
	CURRENTWEBRTCNODE = '',
	CURRENTWEBRTCCHAT = '',
	PREVIOUSACTCHAT = '',
	TEMPMESSAGES = {},
	CURRENTTAB = 'chat',
	EMAILVERIFYSTATUS = 0,
	CANWEBRTC_BROWSER = 0,
	BRWVERSION = 0,
    STUN,
    TURN,
    WEBRTCICECONFIG,	
    ISLOGOUT=0,
	ISCHROME = 0,
	ISFIREFOX = 0,
	ISOPERA = 0,
	CALLDUR = [0,0],
	WEAKPASS = 'Password must contain atleast <ul><li>one uppercase character</li><li>one lowercase character</li><li>an integer value</li><li>length must be greater than 6 characters</li></ul>';	

var SYSMESSAGES = {
	'SNAP::INCOMPATIBLEBROWSER' 		: 'Request cannot be processed.<br />Your browser is not compatible for this service.<br />Kindly download Firefox( >= 34) or Google Chrome (>= 31) or Opera (>=27)',
	'SNAP::INCOMPATIBLEBROWSERDETECTED' : 'Request declined, since end-users browser in not compatible',
	'SNAP::VIDEO_CHAT' 					: 'you sent a video chat request',
	'SNAP::AUDIO_CHAT' 					: 'you sent an audio chat request',
	'SNAP::VIDEO_CHAT_RCVD' 			: 'you have received a video chat request',
	'SNAP::AUDIO_CHAT_RCVD' 			: 'you have received an audio chat request',
	'SNAP::VIDEO_CHAT_ACCEPTED' 		: 'you accepted a video chat request',
	'SNAP::AUDIO_CHAT_ACCEPTED'			: 'you accepted an audio chat request',
	'SNAP::VIDEO_CHAT_DECLINED'			: 'you declined a video chat request',
	'SNAP::AUDIO_CHAT_DECLINED' 		: 'you declined an audio chat request',
	'SNAP::VIDEO_CHAT_ACCEPTED_RCVD' 	: 'your video chat request was accepted',
	'SNAP::AUDIO_CHAT_ACCEPTED_RCVD'	: 'your audio chat request was accepted',
	'SNAP::VIDEO_CHAT_DECLINED_RCVD'	: 'your video chat request was declined',
	'SNAP::AUDIO_CHAT_DECLINED_RCVD' 	: 'your audio chat request was declined',
	'SNAP::BUSY_SIG'					: 'Cannot proceed. Responder is busy on another call',
	'SNAP::NO_HARDWARE'					: 'Cannot proceed. You dont have required hardware to make this call',
	'SNAP::DENIED_HARDWARE'				: 'Cannot proceed. You have denied access to required hardware',
	'SNAP::BUSY_HARDWARE'				: 'Cannot proceed. Your required hardware is already in use',
	'SNAP::ERR_HARDWARE'				: 'Cannot proceed. Failed to allow access required hardware',
	'SNAP::END_CALL'					: 'Call ended',
	'SNAP::DISCONNECTED_CALL'			: 'Call disconnected',
	'SNAP::FAILED_CALL'					: 'Call failed',
	'SNAP::NO_HARDWARE_RESP'			: 'Cannot proceed. User does not have required hardware to make this call',
	'SNAP::DENIED_HARDWARE_RESP'		: 'Cannot proceed. User have denied access to required hardware',
	'SNAP::BUSY_HARDWARE_RESP'			: 'Cannot proceed. User\'s required hardware is already in use',
	'SNAP::ERR_HARDWARE_RESP'			: 'Cannot proceed. User failed to allow access required hardware',	
};


/*************************************SNAP AJAX****************************************/

//AJAX EXEC
var snapExecAjax = function(params) {
	var jqxhr = $.post(CONTROLLERURL,{data:params})
	.done(function(data) {
		successCallback(data,params.action);
	})
	.fail(function() {
		console.log('AJAX failed');
	});
};

//ON AJAX SUCCESS CALLBACK
var successCallback = function(data,requestOf) {
	var stats = data.type;
	if(stats == 'success') {
		switch(requestOf) {
			case 'snapLoadStunTurn':
				if(data.ice_servers[0] != undefined && data.ice_servers[0] != '') {
					STUN = data.ice_servers[0];
					TURN = data.ice_servers[1];
					/*STUN = {url: 'stun:stun.l.google.com:19302'},
					TURN = {url: 'turn:numb.viagenie.ca:3478',credential: 'P@ssw0rd',username: 'lubanasachin70@gmail.com'},*/
					WEBRTCICECONFIG = {iceServers: [STUN,TURN]},
					console.log(STUN);
					console.log(TURN);
				} else snapcheckStunTurn();
				break;
			case 'snapGetContactList':
				snapManageContactList(data.contactlist);	
				break;
			case 'snapInviteUser':
				snapNotifyBox(data.descr);
				var resp = data.respdata;
				SNAPSIGNALCONN.roster.add(resp.xmppjid,resp.username,[]);
				socket.emit('sendinvitation',{'from':MYLOGID,'to': resp.invietoid});
				break;
			case 'snapGetInvitees':
				snapEmailVerifyStatus(data);
				INVITELIST = {};
				$.each(data.invitelist,function(key,val){
					INVITELIST[val.id] = val;
				});
				buildInviteList();
				break;
			case 'snapAcceptInvite':
			case 'snapRejectInvite':
				snapNotifyBox(data.descr);
				if(requestOf == 'snapAcceptInvite') {
					snapGetContactList();
					var xmppjid = INVITELIST[data.tblid].xmppjid;
					var username = INVITELIST[data.tblid].username;
					SNAPSIGNALCONN.roster.add(xmppjid,username,[]);
				}
				delete INVITELIST[data.tblid];
				buildInviteList();
				break;
			case 'snapSendVerificationEmailLink':
			case 'snapModifyPassword':
				snapNotifyBox(data.descr);
				$('#oldpassword, #newpassword, #renewpassword').val('');
				break;
			case 'snapModifyNickname':
				snapNotifyBox(data.descr);
				window.setTimeout(function() {window.location.reload();},100);
				break;				
			case 'snapGetPreviousChatMessages':
				var lastentered = '';
				var msgstr = '';
				if(data.msgcount == 10) msgstr += snapAddChatMessage("<a href='javascript:void(0);' onclick='$(\"#snapLoadMoreMessage\").hide();snapGetPreviousChatMessages(\""+data.withjid+"\","+data.lastrecid+");'>load earlier messages</a>",'loadmore',1);
				$.each(data.previousmessages,function(k,v) {
					if(v.msgdate != lastentered) {
						lastentered = v.msgdate;
						msgstr += snapAddChatMessage("<span>"+v.msgdate+"</span>",'msgdate',1);
					}
					var msgtype = 'recvmess';
					if(v.fromjid == MYBAREJID) msgtype = 'sentmess';
					if(v.message.indexOf('SNAP::') != -1) return;
					msgstr += snapAddChatMessage(v.message,msgtype,v.entered);
				});
				var existr = $('#snapChatDiv'+CURRENTCHAT).html();
				$('#snapChatDiv'+CURRENTCHAT).html(msgstr+''+existr);
				break;
		}
	} else if(stats == 'failed') {
		if(data.descr == 'logout_555') {
			window.location.href= 'index.php';
			return;
		}
		snapNotifyBox(data.descr,'error');
	}	
};

/*************************************SNAP COMMON HELPER****************************************/

//show hide notification box
var snapNotifyBox = function(descr,nottype) {
	if(typeof nottype == 'undefined') nottype = 'success';
	var el = ''; 
	switch(nottype) {
		case 'success':
			el = $('#snapSuccess');
			$('#successTxt').html(descr);
			el.show();
			break;
		case 'error':
			el = $('#snapError');
			$('#errorTxt').html(descr);
			el.show();
			break;
		case 'warn':
			el = $('#snapWarning');
			$('#warnTxt').html(descr);
			el.show();
			break;
	}
	setTimeout(function() {el.hide();},2500);	
};

//on snap logout
var snapLogout = function() {
	SNAPSIGNALCONN.send($pres({type: "unavailable"}));
	ISLOGOUT = 1;
	socket.emit('resetUser',{'userid':MYLOGID});
	$(window).unbind('beforeunload');;
	window.location.href = '?page=logout';
};

//on email verify status
var snapEmailVerifyStatus = function(data) {
	if(EMAILVERIFYSTATUS == 0) {
		var emailverifystatus = data.emailverifystatus;
		EMAILVERIFYSTATUS = emailverifystatus;
		if(emailverifystatus == 0) {
			$('#snapChatRow').hide();
			$('#snapinviteemailaddress').attr('disabled',true);
			$('#snapEmailVerifyBox').show();
		} else if(emailverifystatus == 1) {
			$('#snapinviteemailaddress').attr('disabled',false);
			$('#snapChatRow,#snapEmailVerifyBox').hide();
			$('#snapWelcomeBox').show();
		} else $('#snapEmailVerifyBox').hide();
	}
};

//snap chat time for recevd msgs
var snapTimeNow = function(msgdate) {
	var d = new Date();
	if(msgdate != '' && msgdate != undefined) {
		var mdate = msgdate.replace(/-/g,'/');
		var d = new Date(mdate);
	}
	var h = (d.getHours()<10?'0':'') + d.getHours(),
	m = (d.getMinutes()<10?'0':'') + d.getMinutes();
	var ret = {'date' : d,'hour' : h,'min'  : m};
	return ret;
};

//snap validate email address
var snapValidateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

//snap show error
var snapShowError = function(err) {
	$.each(err, function(key,val) {$('#'+val+'Div').addClass('has-error');});
};

//snap hide error
var snapHideError = function(elem) {
	var val = elem.id;
	$('#'+val+'Div').removeClass('has-error');	
};

//handle show hide call controls
var snapShowHideCallCtrls = function(callstatus) {
	var vid = $('#videoChatReq'+CURRENTCHAT);
	var aud = $('#audioChatReq'+CURRENTCHAT);
	var mut = $('#muteaudio'+CURRENTCHAT);
	var unm = $('#unmuteaudio'+CURRENTCHAT);
	var mutvid = $('#mutevideo'+CURRENTCHAT);
	var unmvid = $('#unmutevideo'+CURRENTCHAT);
	var end = $('#endcall'+CURRENTCHAT);
	var vidBox = $('#snapVideoBox'+CURRENTCHAT);
	var vidCont = $('#snapVideoContainer'+CURRENTCHAT);
	var chtCont = $('#snapChatContainer'+CURRENTCHAT);
	var txtCont = $('#snapChatTxtDiv'+CURRENTCHAT);
	var togchat = $('#toggleChat_'+CURRENTCHAT);
	var togvid = $('#toggleVideo_'+CURRENTCHAT);
	if(callstatus == 'callrequest') {
		vid.hide();aud.hide();
	} else if(callstatus == 'callactive') {
		vid.hide();aud.hide();
		togvid.show();togchat.show();
		unm.hide();mut.show();
		unmvid.hide();mutvid.show();
	} else if(callstatus == 'callend') {
		$('#snapMic'+CURRENTWEBRTCNODE).hide();
		//$('#snapLoader'+CURRENTWEBRTCNODE).hide();
		vid.show();aud.show();
		vidBox.hide();
		$('#snapVideoContainer'+CURRENTCHAT+' video').hide().remove();
		//vidCont.html('');
		chtCont.show();
		togvid.hide();togchat.hide();
		unm.show();mut.hide();
		unmvid.show();mutvid.hide();
	} else if(callstatus == 'callmute') {
		mut.hide();unm.show();
	} else if(callstatus == 'callunmute') {
		mut.show();unm.hide();
	}  else if(callstatus == 'callvidmute') {
		mutvid.hide();unmvid.show();
	} else if(callstatus == 'callvidunmute') {
		mutvid.show();unmvid.hide();
	}
};

//snap strong password check
var snapIsStrongPassword = function(password) {
	if(password.length < 6) return 0;
	if(password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)) return 1;
	return 0;
};


/*************************************SNAP CALL AJAX****************************************/

//snap ajax resend email verification email
var snapSendVerificationEmailLink = function() {
	var params = {'action': 'snapSendVerificationEmailLink'};
	snapExecAjax(params);	
};

//snap ajax load previous chat messages
var snapGetPreviousChatMessages = function(chatwithjid,recordid) {
	var params = {
		'action': 'snapGetPreviousChatMessages',
		'myjid' : MYBAREJID,
		'chatwithjid' : chatwithjid,
		'recordid'	: recordid
	};
	snapExecAjax(params);	
};

//snap ajax stun turn details
var snapLoadStunTurnCreds = function() {
	var params = {'action': 'snapLoadStunTurn'};
	snapExecAjax(params);	
};

//snap ajax get contact list for logged in user
var snapGetContactList = function() {
	var params = {'action': 'snapGetContactList'};
	snapExecAjax(params);	
};

//snap reject invitee
var snapRejectInvite = function(tblid) {
	var contactid = INVITELIST[tblid].userid;
	var params = {
		'action': 'snapRejectInvite',
		'contactid' : contactid,
		'tblid' : tblid
	};
	snapExecAjax(params);	
};

//snap accept invitee
var snapAcceptInvite = function(tblid) {
	var contactid = INVITELIST[tblid].userid;
	var params = {
		'action': 'snapAcceptInvite',
		'contactid' : contactid,
		'tblid' : tblid
	};
	snapExecAjax(params);	
};

//snap ajax send invitee
var snapInviteUser = function(emailaddress) {
	var params = {
		'action': 'snapInviteUser',
		'emailaddress' : emailaddress,
	};
	snapExecAjax(params);
};

//snap ajax get invitees received
var snapGetInvitees = function() {
	var params = {'action': 'snapGetInvitees'};
	snapExecAjax(params);	
	//setTimeout(snapGetInvitees,10000);
};

//snap ajax save new password
var snapModifyPassword = function(oldpassword,newpassword) {
	var params = {
		'action': 'snapModifyPassword',
		'oldpassword' : oldpassword,
		'newpassword' : newpassword,
	};
	snapExecAjax(params);
};

//snap ajax save new nickname
var snapModifyNickname = function(nickname) {
	var params = {
		'action': 'snapModifyNickname',
		'nickname' : nickname,
	};
	snapExecAjax(params);
};

/*************************************SNAP CHAT / AUDIO / VIDEO****************************************/

//snap check stun turn loaded details
var snapcheckStunTurn = function() {
    if(STUN == undefined || STUN == '' || TURN == '' || TURN == undefined) {
        snapNotifyBox('Oops, cannot proceed with the call at this moment. Retry after sometime','error');
        return 0;
    }	
    return 1;
}

//snap send video call request
var snapSendVideoCallReq = function() {
	if(CANWEBRTC_BROWSER == 0) {
		snapAddChatMessage(SYSMESSAGES['SNAP::INCOMPATIBLEBROWSER'],'sentmess');
		return;	
	}
	var ret = snapcheckStunTurn();
    if(ret == 0) return;	
    snapCreatePeerConnection();
	getMediaAudioVideo('initiator','video');
};

//snap send audio call request
var snapSendAudioCallReq = function() {
	if(CANWEBRTC_BROWSER == 0) {
		snapAddChatMessage(SYSMESSAGES['SNAP::INCOMPATIBLEBROWSER'],'sentmess');
		return;	
	}	
	var ret = snapcheckStunTurn();
	if(ret == 0) return;
	snapCreatePeerConnection();
	getMediaAudioVideo('initiator','audio');
};

//snap on accept video chat request
var snapAcceptVideoChat = function() {
	if(CANWEBRTC_BROWSER == 0) {
		$('#snapStickyMsg'+CURRENTCHAT).html('').hide();
		snapAddChatMessage(SYSMESSAGES['SNAP::INCOMPATIBLEBROWSER'],'sentmess');
		var message = "SNAP::INCOMPATIBLEBROWSERDETECTED";
		snapSendMessage(CURRENTCHATJID,message);
		return;	
	}
	var ret = snapcheckStunTurn();
    if(ret == 0) return;
    snapCreatePeerConnection();
	getMediaAudioVideo('responder','video');
};

//snap on accept audio chat request
var snapAcceptAudioChat = function() {
	if(CANWEBRTC_BROWSER == 0) {
		$('#snapStickyMsg'+CURRENTCHAT).html('').hide();
		snapAddChatMessage(SYSMESSAGES['SNAP::INCOMPATIBLEBROWSER'],'sentmess');
		var message = "SNAP::INCOMPATIBLEBROWSERDETECTED";
		snapSendMessage(CURRENTCHATJID,message);		
		return;	
	}	
    var ret = snapcheckStunTurn();
    if(ret == 0) return;	
    snapCreatePeerConnection();	
	getMediaAudioVideo('responder','audio');
};

//snap on decline video chat request
var snapDeclineVideoChat = function() {
	$('#snapStickyMsg'+CURRENTCHAT).html('').hide();
	var message = "SNAP::VIDEO_CHAT_DECLINED";
	snapSendMessage(CURRENTCHATJID,message);
	snapAddChatMessage(SYSMESSAGES['SNAP::VIDEO_CHAT_DECLINED'],'sentmess');
	snapShowHideCallCtrls('callend');
};

//snap on decline audio chat request
var snapDeclineAudioChat = function() {
	$('#snapStickyMsg'+CURRENTCHAT).html('').hide();
	var message = "SNAP::AUDIO_CHAT_DECLINED";
	snapSendMessage(CURRENTCHATJID,message);
	snapAddChatMessage(SYSMESSAGES['SNAP::AUDIO_CHAT_DECLINED'],'sentmess');
	snapShowHideCallCtrls('callend');
};

//snap generate chat details for selected contact
var snapContactDetails = function(contactid) {
	$('#snapWelcomeBox, #snapMyAccountBox').hide();
	$('#snapChatRow').show();
	CURCONTACTID = contactid;
	var dataObj = CONTACTLIST[contactid];
	var tojid = CONTACTLIST[contactid].xmppjid;
	var nodeid = tojid.trim().replace(/[^a-z0-9]+/gi, '_');
	$('#chatcount_'+nodeid).html('').hide();

	CURRENTCHATNAME = dataObj.username;
        //if new chat
        if(CURRENTCHAT == '') {
                CURRENTCHAT = nodeid;
                CURRENTCHATJID = tojid;
        } else if(CURRENTCHAT != nodeid) {      //if already chatting then refresh with new chat
                PREVIOUSACTCHAT = CURRENTCHAT;
                $('#curChat'+PREVIOUSACTCHAT).hide();
                CURRENTCHAT = nodeid;
                CURRENTCHATJID = tojid;
        }


	var calltoaction = '';
	if(WEBRTCCALLSTATUS == 1 && CURRENTCHAT != CURRENTWEBRTCNODE) calltoaction = "style='display:none;'";

	var curChatNode = "curChat"+nodeid;
	if(!$('#'+curChatNode).length) {	
		var leftpanehei = $('#snapLeftPane').height();
		var chatContHei  = (0.8 * leftpanehei);
		var chatScrollHei = chatContHei - 90;


		var chatHtmlStr = "<div class='box box-success' id='"+curChatNode+"'>";

		//chat box header
		chatHtmlStr += "<div class='box-header' id='box-header-"+nodeid+"'>";
		chatHtmlStr += "<i class='fa fa-comments-o'></i>";
		chatHtmlStr += "<h3 class='box-title'>"+dataObj.username+"</h3> ("+dataObj.emailaddress+")";
		chatHtmlStr += "<div class='box-tools pull-right' data-toggle='tooltip' title='Status'>";
		chatHtmlStr += "<div class='btn-group' data-toggle='btn-toggle' >";

		//toggle chat/audio/video screens
		chatHtmlStr += "<button type='button' class='btn btn-default btn-sm active' onclick='snapToggleChatVideo(\"video\",\""+nodeid+"\")' title='Video' style='display:none;' id='toggleChat_"+nodeid+"'><i class='fa fa-play-circle'></i></button>";
		chatHtmlStr += "<button type='button' class='btn btn-default btn-sm' onclick='snapToggleChatVideo(\"chat\",\""+nodeid+"\")' title='Chat' style='display:none;' id='toggleVideo_"+nodeid+"'><i class='fa fa-comment'></i></button>";

		//send audio/video chat requests
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='videoChatReq"+nodeid+"' onclick='snapSendVideoCallReq();' title='Video chat request'><i class='fa fa-video-camera'></i></button>";
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='audioChatReq"+nodeid+"' onclick='snapSendAudioCallReq();' title='Audio chat request'><i class='fa fa-microphone'></i></button>";
		chatHtmlStr += "</div></div></div>";

		chatHtmlStr += "<div class='snapStickyMsg' id='snapStickyMsg"+nodeid+"'>";
		chatHtmlStr += "</div>";

		//video box
		chatHtmlStr += "<div class='box-body video-box' id='snapVideoBox"+nodeid+"'>";
		chatHtmlStr += "<div class='video-container' id='snapVideoContainer"+nodeid+"'>";
		
		chatHtmlStr += "<div class='video-container snapMic' id='snapMic"+nodeid+"'></div>";
		chatHtmlStr += "<div class='myLocalStream' id='mylocalVideo"+nodeid+"'></div>";

		chatHtmlStr += "<div class='video-controls'>";

		//mute-unmute audio
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='muteaudio"+nodeid+"' onclick='snapMuteAudio();' title='Mute microphone'><i class='fa fa-microphone'></i></button>";
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='unmuteaudio"+nodeid+"' onclick='snapUnMuteAudio();' title='Unmute microphone' style='display:none;'><i class='fa fa-microphone-slash'></i></button>";

		//start-stop video
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='mutevideo"+nodeid+"' onclick='snapMuteVideo();' title='Pause video'><i class='fa fa-eye'></i></button>";
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='unmutevideo"+nodeid+"' onclick='snapUnMuteVideo();' title='Resume video' style='display:none;'><i class='fa fa-eye-slash'></i></button>";

		//end call
		chatHtmlStr += "<button class='btn btn-default btn-sm' id='endcall"+nodeid+"' onclick='snapEndCall();' title='End call'><i class='fa fa-stop'></i></button>";
		chatHtmlStr += "</div></div></div>";

		//chat container
		chatHtmlStr += "<div id='snapChatContainer"+nodeid+"'>";
		chatHtmlStr += "<div class='box-body chat' id='snapChatDiv"+nodeid+"'>";
		chatHtmlStr += "</div>";

		chatHtmlStr += "<div class='video-footer' id='snapVideoFooter"+nodeid+"' style='display:none;'></div>";

		//chat box footer
		chatHtmlStr += "<div class='box-footer' id='snapChatTxtDiv"+nodeid+"'>";
		chatHtmlStr += "<div class='input-group'>";
		chatHtmlStr += "<input class='form-control' placeholder='Type message...' id='snapTextAreaMessage"+nodeid+"' onkeypress='snapcheckEnter(event,\""+tojid+"\");'/>";
		chatHtmlStr += "<div class='input-group-btn'><button class='btn btn-success' onclick='snapSendChatMessage();' title='Send message'><i class='fa fa-plus'></i></button></div>";
		chatHtmlStr += "</div>";
		chatHtmlStr += "</div>";
		chatHtmlStr += "</div></div>";

		$('#snapContainerDiv').append(chatHtmlStr);
		snapAdjustHeight(nodeid);
		snapGetPreviousChatMessages(tojid,0);
	}
	if(WEBRTCCALLSTATUS == 1 && CURRENTCHAT != CURRENTWEBRTCNODE) $("#videoChatReq"+nodeid+",#audioChatReq"+nodeid+",#endcall"+nodeid+",#muteaudio"+nodeid+",#unmuteaudio"+nodeid).hide();
	$('#'+curChatNode).show();
	//snapLoadTempMsgsRcvd(tojid);
	$('#snapContainerDiv').show();
	$('#snapChatDiv'+nodeid).scrollTop($('#snapChatDiv'+nodeid)[0].scrollHeight);

};

//snap adjust height of elements after login
var snapAdjustHeightOnLogin = function() {
	var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
	var window_height = $(window).height();
	var midContHEi = window_height - neg;
	$('#snapWelcomeBoxLock, #snapEmailVerifyBoxLock, #snapMyAccountBox').css('min-height', midContHEi);
}

//snap adjust height while chatting
var snapAdjustHeight = function(nodeid) {
	var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
	var window_height = $(window).height();
	var boxhead = $('#box-header'+nodeid).outerHeight();
	var boxfoot = $('#snapChatTxtDiv'+nodeid).outerHeight();
	var chatbox = window_height - neg - boxhead - boxfoot - 60;
	$("#snapChatDiv"+nodeid).css('min-height', chatbox);
        $('#snapChatDiv'+nodeid).slimScroll({
                height: chatbox+'px',
				color: "#333",
				size: "3px"                
        });
        var videobox = window_height - neg - boxhead;
        $("#snapStickyMsg"+nodeid).css('min-height', videobox);
        $("#snapVideoBox"+nodeid).css('min-height', chatbox);
        $("#snapVideoContainer"+nodeid+', #snapMic'+nodeid).css('min-height', chatbox);
};

var snapToggleChatVideo = function(toggle,nodeid) {
	if(toggle == 'chat') {
		$('#snapVideoBox'+nodeid).hide();
		$('#snapChatContainer'+nodeid).show();
	} else if(toggle == 'video') {
		$('#snapChatContainer'+nodeid).hide();
		$('#snapVideoBox'+nodeid).show();

	}

}

//load temorary messages received
var snapLoadTempMsgsRcvd = function(tojid) {
	if(TEMPMESSAGES[tojid] != undefined) {
		$.each(TEMPMESSAGES[tojid],function(k,v) {
			snapAddChatMessage(v,'recvmess');
		});
		TEMPMESSAGES[tojid] = [];
	}	
};

//snap on enter key press while sending messages
var snapcheckEnter = function(event,tojid) {
	if(event.which == 13) snapSendChatMessage();
};

//snap on end call click
var snapEndCall = function() {
	snapShowHideCallCtrls('callend');
	var message = 'SNAP::END_CALL';
	snapAddChatMessage(SYSMESSAGES['SNAP::END_CALL'],'sentmess');
	snapSendMessage(CURRENTCHATJID,message);
	snapStopLocalMedia();
	snapEndWebRTCCall();	
};

//snap on mute audio
var snapMuteAudio = function() {
	snapShowHideCallCtrls('callmute');
	snapMuteUnmuteAudio(0);
};

//snap on unmute audio
var snapUnMuteAudio = function() {
	snapShowHideCallCtrls('callunmute');
	snapMuteUnmuteAudio(1);
};

//snap on mute audio
var snapMuteVideo = function() {
	snapShowHideCallCtrls('callvidmute');
	snapMuteUnmuteVideo(0);
};

//snap on unmute audio
var snapUnMuteVideo = function() {
	snapShowHideCallCtrls('callvidunmute');
	snapMuteUnmuteVideo(1);
};

//snap on enter key press while sending message
var snapSendChatMessage = function() {
	var message = $('#snapTextAreaMessage'+CURRENTCHAT).val();
	message = message.trim();
	if(message == '') return;
	$('#snapTextAreaMessage'+CURRENTCHAT).val('');
	snapAddChatMessage(message,'sentmess');
	snapSendMessage(CURRENTCHATJID,message);
	return false;
};

//snap add chat message to chat window
var snapAddChatMessage = function(message,msgtype,msgtime) {
	if(typeof msgtime == 'undefined') msgtime = '';
	var iconCls = 'chatRightIcon';
	if(msgtype == 'sentmess') iconCls = 'chatLeftIcon';
	var msgstr = '';
	var chatname = 'me';
	var profimg = PROFILEIMAGE;
	if(msgtype == 'recvmess') {
		profimg = 'profileimages/'+CONTACTLIST[CURCONTACTID]['userimage'];
		chatname = CURRENTCHATNAME;
	}

	if(msgtype == 'sentmess' || msgtype == 'recvmess') {
		var ret = snapTimeNow(msgtime);
		var title = ret.date;
		var trecv = ret.hour+':'+ret.min;

		msgstr += "<div class='item'>";
		msgstr += "<img src='"+profimg+"' alt='user image' />";
		msgstr += "<p class='message'>";
		msgstr += "<a href='#' class='name'><small class='text-muted pull-right' title='"+title+"'><i class='fa fa-clock-o'></i> "+trecv+"</small>"+chatname+"</a>";
		msgstr += message;
		msgstr += "</p></div>";
	} else if(msgtype == 'loadmore') {
		var msgstr = "<div class='snapLoadMessageOf' id='snapLoadMoreMessage'>"+message+"</div>";
	} else if(msgtype == 'msgdate') {
		var msgstr = "<div class='snapLoadMessageOf'>"+message+"</div>";
	}	
	if(msgtime != '') return msgstr;
	$('#snapChatDiv'+CURRENTCHAT).append(msgstr);
	$('#snapChatDiv'+CURRENTCHAT).scrollTop($('#snapChatDiv'+CURRENTCHAT)[0].scrollHeight);
};

//snap send message across
var snapSendMessage = function(tojid,message) {
    var msg = $msg({
	    to: tojid,
	    type: 'chat',
	    id: 'msg' + Math.floor((Math.random() * 1000) + 1)
    })
    .c('body').t(message).up()
    .c('active', {xmlns: 'http://jabber.org/protocol/chatstates'});
    SNAPSIGNALCONN.send(msg);
};

//snap build contact list
var snapManageContactList = function(contactlist) {
	$('#sidebar_ul').html('');	
	$('#sidebarLoader').hide();
	$.each(contactlist, function(key,val) {
		var nodeid = val.xmppjid.trim().replace(/[^a-z0-9]+/gi, '_');
		var contactliststr = '';
		CONTACTLIST[val.contactid] = val;
		var contStatus = "<i class='fa fa-circle text-danger'></i> Offline";
		if(TEMPMESSAGES[val.xmppjid] == undefined) TEMPMESSAGES[val.xmppjid] = [];
		var tempcnt = '';
		if(TEMPMESSAGES[val.xmppjid].length > 0) tempcnt = TEMPMESSAGES[val.xmppjid].length;
		if(CONTACTSTATUS[val.xmppjid] != undefined && CONTACTSTATUS[val.xmppjid] == 1) contStatus = "<i class='fa fa-circle text-success'></i> Online";
		contactliststr += "<li><div class='user-panel' id='node_"+nodeid+"' onclick='snapContactDetails("+val.contactid+");'>";
		contactliststr += "<div class='pull-left image'><img src='profileimages/"+val.userimage+"' class='img-circle' alt='User Image' id='node_icon_"+nodeid+"' /></div>";
		contactliststr += "<div class='pull-left info'><p>"+val.username;
		contactliststr += "</p><a href='#' id='userStats_"+nodeid+"'>"+contStatus+"</a></div>";
		contactliststr += "<small class='label pull-right bg-green' id='chatcount_"+nodeid+"'>"+tempcnt+"</small></div></li>";
		$('#sidebar_ul').append(contactliststr);	
		var subscribe = $pres({to: val.xmppjid, type: "subscribe"});
		SNAPSIGNALCONN.send(subscribe);
	});
};

/*************************************SNAP NAV CLICKS****************************************/

//snap load init screen
var snapLoadInit = function() {
	$('body').addClass('sidebar-collapse');
	snapAdjustHeightOnLogin();
	CURRENTCHAT = '';
	CURRENTCHATJID = '';
	CURRENTWEBRTCCHAT = '';
	loadWebRTC();
	snapGetInvitees();
	$(window).unload(function() {
		if(ISLOGOUT == 1) return false;
		if(SNAPSIGNALCONN && SNAPSIGNALCONN.connected) {
			SNAPSIGNALCONN.options.sync = true;
			SNAPSIGNALCONN.flush();
			SNAPSIGNALCONN.disconnect();
		}
	});
};

/*************************************SNAP INVITEE SCREEN****************************************/

//snap build invitee list for received invitees
var buildInviteList = function() {
	var inviteStr = '';
	$.each(INVITELIST,function(key,val) {
		inviteStr += "<li>";
		inviteStr += "<a href='#''>";
		inviteStr += "<div class='pull-left'><img src='profileimages/"+val.userimage+"' class='img-circle' alt='User Image'/></div>";
		inviteStr += "<h4>"+val.username+" ("+val.emailaddress+")<small><i class='fa fa-clock-o'></i> "+val.addedon+"</small></h4>";
		inviteStr += "<p style='margin:5px;'><table><tr>";
		inviteStr += "<td><img src='postlogin/img/accept.png' onclick='snapAcceptInvite("+key+");' /></td><td>&nbsp;</td>";
		inviteStr += "<td><img src='postlogin/img/reject.png' onclick='snapRejectInvite("+key+");' /></td>";
		inviteStr += "</tr></table></p>";
		inviteStr += "</a></li>";
	});
	var inviteCount = Object.keys(INVITELIST).length;
	if(inviteCount > 0) {
		$('#snapInviteBox').html(inviteStr);
		$('#inviteCount').html(inviteCount);
		$('#headCount').html('You have '+inviteCount+' invitation');
	} else {
		$('#headCount').html('You have 0 invitation');
		$('#inviteCount').html('');				
		$('#snapInviteBox').html('');
	}
};

//snap send invitee
var snapInvite = function() {
	var emailaddress = $('#snapinviteemailaddress').val();
	var err = 0;
	if(emailaddress == '') err = 1;
	if(emailaddress && !snapValidateEmail(emailaddress)) err = 1;
	if(err == 1) {
		snapNotifyBox('Invalid email address','error');
		return;
	}
	$('#snapinviteemailaddress').val('');
	snapInviteUser(emailaddress);	
};

//snap reject call request
var snapRejectCall = function(msg,tojid) {
	snapSendMessage(tojid,msg);
};

//show my account form details
var showMyAccount = function() {
	$('#snapWelcomeBox, #snapEmailVerifyBox, #snapChatRow').hide();
	$('#snapMyAccountBox').show();
};

//snap save account details
var saveAccountDetails = function() {
	var oldpassword = $('#oldpassword').val();
	var newpassword = $('#newpassword').val();
	var renewpassword = $('#renewpassword').val();

	var err = new Array();
	if(oldpassword == '') err.push('oldpassword');
	if(newpassword == '') err.push('newpassword');
	if(renewpassword == '') err.push('renewpassword');
	if(newpassword && !snapIsStrongPassword(newpassword)) {
		snapNotifyBox(WEAKPASS,'error');
		err.push('newpassword');	
	}		
	if(err.length > 0) {
		snapShowError(err);
		return;
	}	
	if(oldpassword == newpassword) {
		snapNotifyBox('Old password & new password cannot be same','warn');
		return;		
	}
	if(newpassword != renewpassword) {
		err  = new Array();
		err.push('newpassword');
		err.push('renewpassword');
		snapShowError(err);
		snapNotifyBox('New password not re-entered properly','warn');
		return;		
	}	
	snapModifyPassword(oldpassword,newpassword);
};

//snap save my nick name
var saveMyNickName = function() {
	var mynickname = $('#mynickname').val();
	var err = new Array();
	if(mynickname == '') err.push('mynickname');
	if(err.length > 0) {
		snapShowError(err);
		return;
	}	
	if(mynickname == MYLOGNAME) {
		snapNotifyBox('Change nick name before you save','warn');
		return;		
	}
	snapModifyNickname(mynickname);
};

//snap save my profile pic
var saveMyProfilePic = function() {
	var myprofilepic = $('#myprofilepic').val();
	if(myprofilepic == '') {
		snapNotifyBox('Select profile image before you save','warn');
		return;
	}
    var client = new XMLHttpRequest();
	var file = document.getElementById("myprofilepic");
	var formData = new FormData();
	formData.append("upload", file.files[0]);
	formData.append('action', 'snapUploadProfileImage');
	client.open("post",CONTROLLERURL, true);
	client.send(formData);
    client.onreadystatechange = function(response) {
		if (client.readyState == 4 && client.status == 200)  {
			var resp = JSON.parse(client.response);
			if(resp.type == 'success') {
				snapNotifyBox(resp.descr,'success');
				window.setTimeout(function() {window.location.reload();},100);
			} else snapNotifyBox(resp.descr,'error');
		}
    }
};
