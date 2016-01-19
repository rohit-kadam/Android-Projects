<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>MeetOn SNAP</title>
	<meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'>
	<meta name='verify-v1' content='e8ba01c3c42e4ee642383932b2d65428'/>
	<!-- Bootstrap 3.3.4 -->
	<link href="common/css/bootstrap.css" rel="stylesheet" type="text/css" />
	<link href="common/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="prelogin/css/AdminLTE.css" rel="stylesheet" type="text/css" />
	<link href="common/css/skin-blue-light.min.css" rel="stylesheet" type="text/css" />
	<link href="prelogin/css/blue.css" rel="stylesheet" type="text/css" />
</head>
<body class="skin-blue-light" data-target="#scrollspy">
	<div class="wrapper">
	<?php
		error_reporting(E_ERROR);
		session_start();
		$page = empty($_REQUEST['page']) ? '' : $_REQUEST['page'];
		if($page == 'logout') {
			$_SESSION['userlogin'] = 0;		
			session_destroy();
			$page = '';
		}
		if(!empty($_SESSION['userlogin'])) {
			header("location: home.php");
			exit;
		}
		include_once('prelogin/header.php');
		include_once('prelogin/container.php');
		include_once('prelogin/footer.php');
	?>
	</div>
</body>
</html>
