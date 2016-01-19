<?php
	$APPCONFIG = array(

		'SNAPURL'	=>	'http://meetonsnap.com/',

		'XMPP' => array(
			'server'        	=> 'meetonsnap.com',
			'port'          	=> '5222',
			'adminuser'      	=> 'admin',
			'adminpasswd'       	=> 'tigasemeetonsnap',
			'resource'      	=> 'xmpphp',
			'domain'        	=> 'meetonsnap.com',
			'userpasswd'		=> 'asdasdasd@34'
		),

		'snapdb' => array(
			'dbserver'		=> 'localhost',
			'dbusername'		=> 'root',
			'dbpassword'		=> 'qwerasdf',
			'dbname'		=> 'snaprtc'
		),

		'tigasedb' => array(
			'dbserver'		=> 'localhost',
			'dbusername'		=> 'tigase',
			'dbpassword'		=> 'tigase12',
			'dbname'		=> 'tigasedb'
		),		

		'TWILLIO' => array(
			'sid' 				=> "AC580e4ca0e6be39ebde7a997c7e4fe664",
			'token'				=> "d17b54544d2c61895808ae855d5e0555"
		),

		'templateDir'			=> '../views/templates/',

		'profileimagepath'		=> '../profileimages/',

		'EMAIL'	=> array(

			'ADMINEMAILADDRESS'		=> 'meetonsnap@gmail.com',

			'CCEMAILADDRESS'		=> 'lubanasachin70@gmail.com',

			
			'resetpassword'		=> array(
										'template' => '../views/templates/resetpassword.html',
										'subject' => 'MOS:: Reset your password',
									),

			'emailverify'		=> array(
										'template' => '../views/templates/emailverify.html',
										'subject' => 'MOS:: Verify your email address',
									),

			'feedbackform'		=> array(
										'template' => '../views/templates/feedbackform.html',
										'subject' => 'MOS:: Feedback received',
									),

			//'apikey'			=> '68e86d9d12144224f354017e896bdf2b',
			//'apikey'			=> '78b33cd401e6116c028bac7720aef53d',
			//'apikey'			=> 'dc9f57dcfcf37fa4a24c7095d948e8e9',
			'apikey'			=> '9eebd38acf017e15bd2fe4998741bdea',
			'apiurl'			=> 'https://api.falconide.com/falconapi/web.send.rest',
			'emailfrom'			=> 'snapfriends@meetonsnap.com',
			'fromname'			=> 'MeetOnSnap',
		),

		'ERROR'	=> array(
			'555'				=> 'logout_555',
			'101'				=> 'Cannot process your request at this moment',
			'102'				=> 'Oops, something went wrong. Please retry after sometime',
			'103'				=> 'Hey, you made an invalid request',
			'104'				=> 'Oops, cannot load previous chat messages',			
			'105'				=> 'Hey, you entered an invalid email address',
			'106'				=> 'Hey, this email address is already registered',
			'107'				=> 'Hey, you entered invalid email address or password',
			'108'				=> 'Hey, entered email address is not yet registered',
			'109'				=> 'Hey, you have already sent invitation to this email address',
			'110'				=> 'Hey, failed to load iceServers',
			'111'				=> 'Old password is incorrect. Cannot proceed',
			'112'				=> 'Update password failed. Cannot proceed',
			'113'				=> 'Update nickname failed. Cannot proceed',
			'114'				=> 'Update profile image failed. Cannot proceed',
			'115'				=> 'File size exceeded the allowed limit of 100KB. Cannot proceed',
			'116'				=> 'File type is invalid. Cannot proceed',
			'117'				=> 'Hey, this email address is not registered',
			
		)
	);
?>
