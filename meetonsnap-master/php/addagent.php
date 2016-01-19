<?php
	include_once('extensions/XMPPHP/XMPPHP_XMPP.php');
	$conf = array(
		'server'        => 'localhost',
		'port'          => '5222',
		'userName'      => 'admin',
		'passwd'        => 'password',
		'resource'      => 'xmpphp',
		'domain'        => 'myxmpp.com'
	);

	$email = 'sachin@customer360.co';
	$userJID = 'sachin@myxmpp.com';
	$passwd = 'asdasdasd@34';

	$conn = new XMPPHP_XMPP(
			"myxmpp.com",
			$conf['port'],
			$conf['userName'],
			$conf['passwd'],
			$conf['resource'],
			'myxmpp.com'
	);

	$conn->autoSubscribe(true);
	$conn->useEncryption(false);

	try{
		$conn->connect();
		$conn->processUntil('session_start');
		$conn->registerNewUser($userJID, $email, $passwd);
		$conn->processUntil('done');
		$conn->disconnect();
	}catch(XMPPHP_Exception $e) {
		die($e->getMessage());
	}


?>