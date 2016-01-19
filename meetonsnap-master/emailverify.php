<style>
.errDiv {
color:#f00;	
height:300px;
width:600px;
margin:200px auto 0 auto;
font-size:15px;
font-family:arial;
text-align:center;
letter-spacing:1px;		
}
</style>
<?php
error_reporting(E_ERROR);
$userid = $_REQUEST['userid'];
$uniqid = $_REQUEST['uniqid'];

include_once('php/config.php');
include_once('php/function.php');

function sendError($level) {
	$err = "<div class='errDiv'>";
	if($level == 1) {
		$err .= "<p>Invalid email verification link. Please retry with proper link</p>";
	} else if($level == 2) {
		$err .= "<p>Some problem occured. Please retry after sometime</p>";
	} else if($level == 3) {
		$err .= "<p>Your email verification link is old. Please generate a new one to change password</p>";
	} else if($level == 4) {
		$err .= "<p>Your email verification link has expired.</p>";
	} else if($level == 5) {
		$err .= "<p>Your email address is already verified.</p>";
	}
	$err .= "</div>";
	echo $err;
	exit;
}

//empty request params
if(empty($userid) || empty($uniqid)) sendError(1);

//db connect failed
$snapDbConn = snapCreateDbConnect('snapdb');
if(!$snapDbConn) sendError(2);

//check uniqid comparison
$query = "select id,userid,username,email,linktime,verifyid,linktype,linkstatus from snap_linktrack where userid = ? and linktype = 'emailverify' order by id desc limit 1";
$arrParams = array('s', &$userid); 
$result = snapDbQuery($snapDbConn,$query,$arrParams); 
if(!isset($result['rows'])) sendError(1);

$linkid = $result['rows'][0]->id;
$userid = $result['rows'][0]->userid;
$username = $result['rows'][0]->username;
$email = $result['rows'][0]->email;
$linktime = $result['rows'][0]->linktime;
$verifyid = $result['rows'][0]->verifyid;
$linkstatus = $result['rows'][0]->linkstatus;


//uniqid does not match the verify id in db
if($uniqid !=  $verifyid) sendError(3);

//linkstats = 1 mean old link
if($linkstatus == 1) sendError(4);

//linkstats = 2 mean used link
if($linkstatus == 2) sendError(5);

//check if linktime has expiered i.e a day old
$curtime = time();
$cmptime = $linktime+(24*60*60);	
if($curtime > $cmptime) {
	snapUpdateLinkStatus($snapDbConn,$linkid,1);
	sendError(3);
}

snapUpdateLinkStatus($snapDbConn,$linkid,2);
snapUpdateUserStatus($snapDbConn,$userid,1);

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>MeetOn SNAP - Email Verification</title>
	<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
	<link href="common/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="common/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="postlogin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
	<link href="prelogin/css/AdminLTE.css" rel="stylesheet" type="text/css" />
	<link href="common/css/skin-blue-light.min.css" rel="stylesheet" type="text/css" />
</head>
<body class="skin-blue-light" data-target="#scrollspy">
	<div class="wrapper">
		<header class="main-header">
		  <a href="http://www.meetonsnap.com" class="logo"><span class="logo-lg"><b>MeetOn</b>SNAP</span></a>
		  <nav class="navbar navbar-static-top" role="navigation">
		    <div class="navbar-custom-menu">
		    </div>
		  </nav>  
		</header>
		<div style='position:relative;'>
		  <div class="box box-solid ">
		    <div class="lockscreen">
		      <div class="lockscreen-wrapper">
		        <div class="lockscreen-logo">
		          <a href="javascript:void(0);"><b>Thank you for verifying your email address</b></a>
		        </div>
		        <div class="help-block text-center">Click <a href='http://www.meetonsnap.com' >here</a> to login and make your first SNAP call.  <br /></div>
		      </div>
		    </div>
		  </div>
		</div>
		<footer class="main-footer">
		<div class="pull-right hidden-xs"><b>Version</b> 2.0</div>
		<strong>Copyright &copy; 2015-2016 <a href="http://www.meetonsnap.com">MeetOnSNAP</a>.</strong> All rights reserved.
		</footer>
	</div>
</body>
</html>
<script type="text/javascript">CURRENTWEBRTCNODE=''</script>
<script src="common/js/jQuery-2.1.4.min.js"></script>
<script src="common/js/bootstrap.min.js" type="text/javascript"></script>
<script src="common/js/jquery.slimscroll.min.js" type="text/javascript"></script>
<script src='common/js/fastclick.min.js'></script>
<script src="common/js/app.js" type="text/javascript"></script>
<script type="text/javascript" src="common/js/socket.io.js"></script>
<script type="text/javascript">
var socket = io.connect('http://:8000');
var MYLOGID = '<?php echo $userid; ?>';
socket.emit('setUser',{'userid':MYLOGID});
socket.emit('setEmailVerify',{'userid':MYLOGID});
</script>
