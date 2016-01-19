<footer class="main-footer">
	<div class="pull-right hidden-xs"><b>Version</b> 2.0</div>
        <strong>Copyright &copy; 2015-2016 <a href="http://www.meetonsnap.com">MeetOnSNAP</a>.</strong> All rights reserved.
</footer>

<script src="common/js/jQuery-2.1.4.min.js"></script>
<script src="common/js/bootstrap.min.js" type="text/javascript"></script>
<script src="common/js/jquery.slimscroll.min.js" type="text/javascript"></script>
<script src='common/js/fastclick.min.js'></script>
<script src="common/js/app.js" type="text/javascript"></script>
<script type="text/javascript" src="common/js/bowser.min.js" ></script>
<script type="text/javascript" src="common/js/socket.io.js"></script>

<script type="text/javascript" src="postlogin/js/main.js?ver=2" ></script>
<script type="text/javascript" src="postlogin/js/strophe.min.js" ></script>
<script type="text/javascript" src="postlogin/js/strophe.roster.min.js" ></script>
<script type="text/javascript" src="postlogin/js/snaprtc.js?ver=1" ></script>

<script type="text/javascript">
var socket = io.connect('http://:8000');
MYJID = '<?php echo $_SESSION["userloginxmppid"] ?>';
MYPASS = '<?php echo $_SESSION["userloginxmpppasss"] ?>';
MYLOGID = '<?php echo $_SESSION["userloginid"]; ?>';
MYLOGNAME = '<?php echo $_SESSION["userloginname"]; ?>';
var BRWVERSION  = bowser.version;
var ISCHROME    = (bowser.chrome != undefined) ? 1 : 0;
var ISFIREFOX   = (bowser.firefox != undefined) ? 1 : 0;
var ISOPERA     = (bowser.opera != undefined) ? 1 : 0;
if(ISCHROME == 1 && BRWVERSION >= 31) CANWEBRTC_BROWSER = 1;
if(ISFIREFOX == 1 && BRWVERSION >= 34) CANWEBRTC_BROWSER = 1;
if(ISOPERA == 1 && BRWVERSION >= 27) CANWEBRTC_BROWSER = 1;

socket.emit('setUser',{'userid':MYLOGID});
socket.on('recvInvitation', function (data) {
	if(data.to == MYLOGID) {
		console.log('invitation received');
		snapGetInvitees();
	}
});
socket.on('emailVerified', function (data) {
	if(data.userid == MYLOGID) {
		console.log('Email Verified');
		var estats = {'emailverifystatus':1};
		snapEmailVerifyStatus(estats);
	}
});
$('#mynickname').val(MYLOGNAME);

</script>
<?php if(!empty($_SESSION['userlogin'])) echo '<script type="text/javascript">snapLoadInit();snapLoadStunTurnCreds();</script>'; ?>
