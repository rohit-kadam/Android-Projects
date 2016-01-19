<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>MeetOn SNAP</title>
	<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
	<link href="common/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="common/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="postlogin/css/ionicons.min.css" rel="stylesheet" type="text/css" />
	<link href="postlogin/css/AdminLTE.css" rel="stylesheet" type="text/css" />
	<link href="common/css/skin-blue-light.min.css" rel="stylesheet" type="text/css" />
</head>
<body class="skin-blue-light" data-target="#scrollspy">
	<div class="wrapper">
	<?php
        error_reporting(E_ERROR);
        session_start();

	if(empty($_SESSION['userlogin'])) {
		header("Location: index.php");
		die();		
	}

	include_once('postlogin/header.php');
	include_once('postlogin/sidebar.php');
	include_once('postlogin/container.php');
	include_once('postlogin/footer.php');
	?>
	</div>
</body>
</html>
