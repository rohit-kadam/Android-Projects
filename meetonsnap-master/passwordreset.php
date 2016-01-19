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
		$err .= "<p>Invalid password reset link. Please retry with proper link</p>";
	} else if($level == 2) {
		$err .= "<p>Some problem occured. Please retry after sometime</p>";
	} else if($level == 3) {
		$err .= "<p>Your password reset link is old. Please generate a new one to change password</p>";
	} else if($level == 4) {
		$err .= "<p>Your password reset link has expired.</p>";
	} else if($level == 5) {
		$err .= "<p>Your password reset link is already used.</p>";
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
$query = "select id,userid,username,email,linktime,verifyid,linktype,linkstatus from snap_linktrack where userid = ? and linktype = 'resetpassword' order by id desc limit 1";
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
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>MeetOn SNAP - Reset Password</title>
	<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
	<link href="common/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="common/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="postlogin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
	<link href="prelogin/css/AdminLTE.css" rel="stylesheet" type="text/css" />
	<link href="common/css/skin-blue-light.min.css" rel="stylesheet" type="text/css" />
</head>
<body class="skin-blue-light" data-target="#scrollspy">
	<input type='hidden' id='linkid' value='<?php echo $linkid; ?>' />
	<div class="wrapper">
		<header class="main-header">
		  <a href="http://www.meetonsnap.com" class="logo"><span class="logo-lg"><b>MeetOn</b>SNAP</span></a>
		  <nav class="navbar navbar-static-top" role="navigation">
		    <div class="navbar-custom-menu">
		    </div>
		  </nav>  
		</header>

		<!--NOTIFICATION BOX-->
		<div style='position:relative;'>
		<!--WARNING MSG BOX-->
		<div class="alert alert-warning alert-dismissable snapBox" id='snapWarning'>
		<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>
		<i class="icon fa fa-warning"></i><span id='warnTxt'></span>
		</div>
		<!--ERROR MSG BOX-->
		<div class="alert alert-danger alert-dismissable snapBox" id='snapError'>
		<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>
		<i class="icon fa fa-ban"></i><span id='errorTxt'></span>
		</div>
		<!--SUCCESS MSG BOX-->
		<div class="alert alert-success alert-dismissable snapBox" id='snapSuccess'>
		<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>
		<i class="icon fa fa-check"></i><span id='successTxt'></span>
		</div>
		</div>


		<div class="login-page">
		    <!--LOGIN BOX-->
		    <div class="login-box" id="snapResetPassContainer">
		      <div class="login-box-body">
		        <p class="login-box-msg">Reset Password</p>
		        <form method="post" onsubmit="return false;" >
		          <div class="form-group has-feedback" id="snapsaveemailaddressDiv">
		            <input type="email" class="form-control" placeholder="email address" value='<?php echo $email; ?>' id='snapsaveemailaddress' onfocus='snapHideError(this);' maxlength="100"  readonly='true'  />
		            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
		          </div>
		          <div class="form-group has-feedback" id="snaploginpasswordDiv">
		            <input type="password" class="form-control" placeholder="password" value="" id='snapsavenewpassword' onfocus='snapHideError(this);' maxlength="100"  />
		            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
		          </div>
		          <div class="row">
		            <div class="col-xs-8"></div>
		            <div class="col-xs-4"><button class="btn btn-primary btn-block btn-flat" onclick='snapSaveChangePassword();'>Modify</button></div>
		          </div>
		        </form>
		      </div>
		    </div>
			<div id='snapOnResetPassContainer' style='display:none;'>
			  <div class="box box-solid ">
			    <div class="lockscreen">
			      <div class="lockscreen-wrapper">
			        <div class="lockscreen-logo">
			          <a href="javascrip:void(0);"><b>Password reset successfully</b></a>
			        </div>
			      </div>
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
<script src="prelogin/js/main.js" type="text/javascript"></script>
