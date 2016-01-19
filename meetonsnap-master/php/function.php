<?php
	//snap load stun/turn creds required for webrtc
	function snapLoadStunTurnCreds() {
		global $APPCONFIG;
		require_once('../extensions/twillio/Services/Twilio.php'); 
		$conf = $APPCONFIG['TWILLIO'];
		$sid = $conf['sid'];
		$authToken = $conf['token'];
		$http = new Services_Twilio_TinyHttp('https://api.twilio.com',
		array('curlopts' => array(CURLOPT_SSL_VERIFYPEER => false)));
		$client = new Services_Twilio($sid, $authToken, "2010-04-01", $http);
		$ice_config = '';
		try { $token = $client->account->tokens->create();} 
		catch(Exception $e) { return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][110]); }
		if($token->ice_servers) {
			$ice_servers = (array) $token->ice_servers;
			return array('type' => 'success', 'descr' => 'stun turn success','ice_servers' => $ice_servers);
		}
		return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][110]);
	}

	//snap register new user into xmpp on signup
	function snapRegisterNewXmppUser($emailaddress) {
		global $APPCONFIG;
		include_once('../extensions/XMPPHP/XMPPHP_XMPP.php');
		$conf = $APPCONFIG['XMPP'];
		$passwd = $conf['userpasswd'];

		$userJID = cleanString($emailaddress).time().'@'.$conf['server'];
		$conn = new XMPPHP_XMPP($conf['server'],$conf['port'],$conf['adminuser'],$conf['adminpasswd'],$conf['resource'],$conf['domain']);
		$conn->autoSubscribe(true);
		$conn->useEncryption(false);
		$resp = array();
		try{
			$conn->connect();
			$conn->processUntil('session_start');
			$conn->registerNewUser($userJID, $emailaddress, $passwd);
			$conn->processUntil('done');
			$conn->disconnect();
			return array('xmppuserid' => $userJID, 'xmpppasswd' => $passwd);
		}catch(XMPPHP_Exception $e) {
			return 0;
			//die($e->getMessage());
		}
	}

	//snap load previous chat messages
	function snapGetPreviousChatMessages($tigaseDbConn,$data)	 {
		global $APPCONFIG;
		$fromjid = $data['myjid'];
		$withjid = $data['chatwithjid'];
		$recordid = $data['recordid'];

		$query = "select id,fromjid, tojid, message, entered from previous_chat_messages ";
		$query.= " where ((fromjid = ? and tojid = ?) or (fromjid = ? and tojid = ?)) and message not like '%SNAP::%' ";
		if(!empty($recordid)) {
			$query .= " and id <= $recordid ";
		}
		$query .= "order by id desc limit 10 ";


		$arrParams = array('ssss',&$fromjid,&$withjid,&$withjid,&$fromjid); 
		$result = snapDbQuery($tigaseDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][104]);

		$responseArr = array();
		if($result['rows']) {
			foreach($result['rows'] as $val) {
				$val = (array) $val;
				$message = $val['message'];
				if(preg_match('/<body>(.*)<\/body>/',$message,$matches)) {
					$message = $matches[1];
					$val['message'] = $message;
				}
				$msgdate = explode(' ',$val['entered']);
				$val['msgdate'] = date('d M Y', strtotime($msgdate[0]));
				array_push($responseArr, $val);
			}
		}
		$lastrecid = 0;
		$totrecs = count($result['rows']);
		if($totrecs > 0) $lastrecid = $responseArr[$totrecs-1]['id'];
		$responseArr = array_reverse($responseArr);
		return array('type' => 'success', 'previousmessages' => $responseArr, 'msgcount' => $totrecs, 'withjid' => $withjid, 'lastrecid' => $lastrecid);		
	}

	//snap modify password
	function snapModifyPassword($snapDbConn,$data) {
		global $APPCONFIG;
		$oldpassword = $data['oldpassword'];
		$newpassword = $data['newpassword'];
		$md5_old = md5($oldpassword);
		$md5_new = md5($newpassword);
		$query = "select count(1) from snap_users where id = ? and password = ? ";
		$arrParams = array('ss', &$_SESSION['userloginid'],&$md5_old); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams,array('count')); 
		if(!isset($result['rows']) || empty($result['rows'][0]->count) ) {
			return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][111]);
		}
		$query = "update snap_users set password = ? where id = ? limit 1 ";
		$arrParams = array('ss',&$md5_new, &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][112]);
		return array('type' => 'success', 'descr' => 'Password updated successfully');
	}

	//snap modify nickname
	function snapModifyNickname($snapDbConn,$data) {
		global $APPCONFIG;
		$nickname = $data['nickname'];
		$query = "update snap_users set username = ? where id = ? limit 1 ";
		$arrParams = array('ss',&$nickname, &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][113]);
		$_SESSION['userloginname'] =  $nickname;
		return array('type' => 'success', 'descr' => 'Nickname updated successfully', 'nickname' => $nickname );		
	}

	//snap modify profile image
	function snapUploadProfileImage($snapDbConn,$data) {
		global $APPCONFIG;

		//if no file uploaded but still submitted
		if(!isset($_FILES['upload'])) {
			return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][114]);	
		}
	
		//check file siz greater then 100KB
	    $fsize = $_FILES["upload"]["size"];
	    if($fsize > 102400) {
	    	return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][115]);		
	    }

	    //check file type (png/jpg)
	    $ftype = $_FILES["upload"]["type"];
	    if(!in_array(strtolower($ftype), array('image/jpeg','image/png', 'image/jpg'))) {
	    	return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][116]);			
	    }

	    //upload file now
	    $savePath = $APPCONFIG['profileimagepath'];
	    if(!is_dir($savePath)) {
	            $oldumask = umask(0); 
	            if (!mkdir($savePath, 0777, true)) {
	            	return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][114]);
	            }
	            umask($oldumask);
	    }
	    $fname = $_FILES["upload"]["name"];
	    $fext = pathinfo($fname,PATHINFO_EXTENSION);
	    $fileName = $_SESSION['userloginid'].".".$fext;
	    $destinFile = $savePath.$fileName;
	    $srcFile = $_FILES["upload"]["tmp_name"];
	    if(move_uploaded_file($srcFile,$destinFile)) {
			$query = "update snap_users set userimage = ? where id = ? limit 1 ";
			$arrParams = array('ss',&$fileName, &$_SESSION['userloginid']); 
			$result = snapDbQuery($snapDbConn,$query,$arrParams); 
			//if(!$result['affected_rows']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][114]);	    	
			$_SESSION['userimage'] = $fileName;
		    return array('type' => 'success', 'descr' => 'Profile image updated successfully');
		}
	    return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][114]);
	}

	//snap register / login user when using facebook acccess
	function snapFacebookLogin($snapDbConn,$data) {
		global $APPCONFIG;
		$email = $data['emailaddress'];
		$uarr = explode("@",$email);
		$username = $uarr[0];
		$rand = rand(999,99999);
		$password = base64_encode($username.'_'.$rand);

                //check if already registered
                $ret = snapCheckIsAlreadyRegistered($snapDbConn,$email);
		if(empty($ret)) {
			//already registered. hence login
			$dataArr = array(
				'emailaddress'	=>	$email,
				'password'	=>	$password,
				'source'	=>	'social'
			);
			$retAns = snapLoginUser($snapDbConn,$dataArr);
		} elseif($ret == 1) {
			//new user. hence signup
			$dataArr = array(
				'emailaddress'	=>	$email,
				'username'	=>	$username,
				'password'	=>	$password
			);
			$retAns = snapRegisterNewUser($snapDbConn,$dataArr);
		}
		return $retAns;
		
	}

	//snap register new user wrapper
	function snapRegisterNewUser($snapDbConn,$data) {
		global $APPCONFIG;
		$email = $data['emailaddress'];
		$username = $data['username'];
		$password = $data['password'];
		if(empty($username) || empty($password) || empty($email)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][103]);

		//validate email address format
		$ret = snapValidateEmailAddress($email);
		if(empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][105]);

		//check if already registered
		$ret = snapCheckIsAlreadyRegistered($snapDbConn,$email);
		if($ret == '-1') return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		elseif(empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][106]);

		//add new user to xmpp
		$ret = snapRegisterNewXmppUser($email);
		if(empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		$userData = array(
			'username' => $username,
			'password' => md5($password),
			'emailaddress' => $email,
			'xmppuserid' => $ret['xmppuserid'],
			'xmpppasswd' => $ret['xmpppasswd']
		);

		//add user to snap database
		$ret = snapRegisterNewUserDatabase($snapDbConn,$userData);
		if(empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		//snap send email verification email
		$ret = snapSendVerificationEmailLink($snapDbConn,$email);
		return array('type' => 'success', 'descr' => 'User added successfully');

	}

	//snap send email verification email
	function snapSendVerificationEmailLink($snapDbConn,$emailaddress='') {
		global $APPCONFIG;
		$snapurl = $APPCONFIG['SNAPURL'];
		$userid = $_SESSION['userloginid'];
		$username = $_SESSION['userloginname'];		
		$emailaddress = empty($emailaddress) ? $_SESSION['userloginemailaddress'] : $emailaddress;
		$time = time();

		//verifyid in url
		$verifyid = md5("$userid|||$username|||$emailaddress|||$time");
		
		//generate link data
		$linkdata = array(
			'email'		=>	$emailaddress,
			'userid'	=>	$userid,
			'username'	=> 	$username,
			'linktime'	=> 	$time,
			'verifyid'	=> 	$verifyid,
			'linktype'	=> 	'emailverify'
		);

		//insert linkdata into track table
		$ret = snapInsertTrackUrl($snapDbConn,$linkdata);
		if(empty($ret)) return 0;

		$emailverifylink = $snapurl."emailverify.php?userid=$userid&uniqid=$verifyid";
		$contentData = array(
			'EMAILVERIFYLINK'	=> $emailverifylink,
			'USERNAME'	=> $username
		);

		//send email
		snapSendFalconEmail('emailverify',$emailaddress,$contentData);
		return array('type' => 'success', 'descr' => 'Email sent successfully');
	}

	//snap save new password
	function snapSavePassword($snapDbConn,$data) {
		$newpass = md5($data['password']);
		$email = $data['emailaddress'];
		$query = "update snap_users set password = ? where emailaddress = ? limit 1 ";
		$arrParams = array('ss',&$newpass, &$email); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return 0;		
		$linkid = $data['linkid'];
		snapUpdateLinkStatus($snapDbConn,$linkid,2);
		return array('type' => 'success', 'descr' => 'Password changed successfully');
	}

	//snap update resetpass/verifyemail link status
	function snapUpdateLinkStatus($snapDbConn,$linkid,$linkstatus) {
		$query = "update snap_linktrack set linkstatus = ? where id = ? limit 1 ";
		$arrParams = array('ss',&$linkstatus, &$linkid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return 0;		
		return 1;
	}

	//snap update user email verification status
	function snapUpdateUserStatus($snapDbConn,$userid,$userstatus) {
		$query = "update snap_users set userstatus = ? where id = ? limit 1 ";
		$arrParams = array('ss',&$userstatus,&$userid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return 0;		
		return 1;
	}	

	function snapGetUserStatus($snapDbConn,$userid) {
		$query = "select userstatus from snap_users where id = ? limit 1 ";
		$arrParams = array('s', &$userid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return -1;
		$userstatus = $result['rows'][0]->userstatus;
		return $userstatus;
	}


	//snap add track url (resetpass/verifyemail)
	function snapInsertTrackUrl($snapDbConn,$linkdata) {
		$email = $linkdata['email'];
		$userid = $linkdata['userid'];
		$username = $linkdata['username'];
		$linktime = $linkdata['linktime'];
		$verifyid = $linkdata['verifyid'];
		$linktype = $linkdata['linktype'];

		$query = "insert into snap_linktrack (userid,username,email,linktime,verifyid,linktype) values(?,?,?,?,?,?) ";
		$arrParams = array('ssssss', &$userid, &$username,&$email, &$linktime, &$verifyid, &$linktype); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) return 0;
		return 1;

	}

	//snap register user into database
	function snapRegisterNewUserDatabase($snapDbConn,$data) {
		$query = "insert into snap_users (username,password,emailaddress,addedon) values(?,?,?,now()) ";
		$arrParams = array('sss', &$data['username'], &$data['password'],&$data['emailaddress']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) return 0;

		$userid = $result['insert_id'];
		$query = "insert into snap_users_webrtc (userid,xmppjid,xmpppass) values(?,?,?) ";
		$arrParams = array('sss', &$userid, &$data['xmppuserid'],&$data['xmpppasswd']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) {
			$query = "delete from snap_users where userid = ? limit 1 ";
			$arrParams = array('s', &$userid); 
			$result = snapDbQuery($snapDbConn,$query,$arrParams); 
			return 0;
		}			

		$_SESSION['userlogin'] = 1;
		$_SESSION['userloginname'] = $data['username'];
		$_SESSION['userloginid'] = $userid;
		$_SESSION['userloginxmppid'] = $data['xmppuserid'];
		$_SESSION['userloginxmpppasss'] = $data['xmpppasswd'];
		$_SESSION['userloginemailaddress'] = $data['emailaddress'];
		$_SESSION['membersince'] = date('M, Y');
		$_SESSION['useremailverification'] = 0;
		$_SESSION['userimage'] = 'user2_160.png';

		$browserdetail = $_SERVER['HTTP_USER_AGENT'];
		$remoteipaddress =  $_SERVER['REMOTE_ADDR'];
		$event = 'signup';

		$query = "insert into snap_user_event_log (userid,eventtype,eventdatetime,ipaddress,browserdetail) values(?,?,now(),?,?) ";
		$arrParams = array('ssss', &$userid, &$event,&$remoteipaddress,&$browserdetail); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams);		

		return 1;
	}

	//snap check if user already registered
	function snapCheckIsAlreadyRegistered($snapDbConn,$email,$userid=0) {
		if(!empty($userid)) {
			$query = "select count(1) from snap_users where id = ? ";
			$arrParams = array('s', &$userid);
		} else if(!empty($email)) {
			$query = "select count(1) from snap_users where emailaddress = ? ";
			$arrParams = array('s', &$email);			
		}
 		$result = snapDbQuery($snapDbConn,$query,$arrParams,array('count')); 
		if(!isset($result['rows'])) return -1;
		if($result['rows'] && $result['rows'][0]->count > 0) return 0;
		return 1;
	}

	//snap on login user
	function snapLoginUser($snapDbConn,$data) {
		global $APPCONFIG;
		$email = $data['emailaddress'];
		$pass = md5($data['password']);
		$source = $data['source'];
		if(empty($email) || empty($pass)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][107]);

		$vcount = 0;
		if(empty($source)) {
			//logged in using email and password
			$query = "select count(1) from snap_users where emailaddress = ? and password = ? ";
			$arrParams = array('ss', &$email,&$pass); 
			$result = snapDbQuery($snapDbConn,$query,$arrParams,array('count')); 
			if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
			if($result['rows'] && $result['rows'][0]->count > 0) $vcount = 1;
		}
		//logged in using social media, dont check for password
		if($source  == 'social') $vcount = 1;
	
		if($vcount > 0) {
			$query = "select a.id,username,xmppjid,xmpppass,userstatus,a.addedon,a.userimage from snap_users a inner join snap_users_webrtc b on a.id = b.userid where a.emailaddress = ? limit 1";
			$arrParams = array('s', &$email); 
			$result = snapDbQuery($snapDbConn,$query,$arrParams,array('id','user','jid','jpass','userstatus','addedon','userimage')); 
			if($result['rows']) {
				$_SESSION['userlogin'] = 1;
				$_SESSION['userloginname'] = $result['rows'][0]->user;
				$_SESSION['userloginxmppid'] = $result['rows'][0]->jid;
				$_SESSION['userloginxmpppasss'] = $result['rows'][0]->jpass;
				$_SESSION['userloginid'] = $result['rows'][0]->id;
				$_SESSION['useremailverification'] = $result['rows'][0]->userstatus;
				$_SESSION['userloginemailaddress'] = $email;
				$_SESSION['userimage'] = $result['rows'][0]->userimage;
				$_SESSION['membersince'] =  date('M, Y', strtotime($result['rows'][0]->addedon));
			}
			return array('type' => 'success', 'descr' => 'login success');
		}
		return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][107]);
	}

	//snapp validate email address
	function snapValidateEmailAddress($email) {
		return filter_var($email, FILTER_VALIDATE_EMAIL);
	}

	//snap perform database query wrapper (select/update/insert/delete)
	function snapDbQuery($mysqli,$sql, $arrParams, $arrBindNames=false) {
	    $result = new stdClass(); 
	    if ($stmt = $mysqli->prepare($sql)) { 
	        $method = new ReflectionMethod('mysqli_stmt', 'bind_param'); 
	        $method->invokeArgs($stmt, $arrParams);    
	        $stmt->execute(); 
	        $meta = $stmt->result_metadata(); 
	        if (!$meta) {            
	            $result->affected_rows = $stmt->affected_rows; 
	            $result->insert_id = $stmt->insert_id; 
	        } else { 
	            $stmt->store_result(); 
	            $params = array(); 
	            $row = array(); 
	            if ($arrBindNames) { 
	                for ($i=0,$j=count($arrBindNames); $i<$j; $i++) { 
	                    $params[$i] = &$row[$arrBindNames[$i]]; 
	                } 
	            } else { 
	                while ($field = $meta->fetch_field()) { 
	                    $params[] = &$row[$field->name]; 
	                } 
	            } 
	            $meta->close(); 
	            $method = new ReflectionMethod('mysqli_stmt', 'bind_result'); 
	            $method->invokeArgs($stmt, $params);            
	            $result->rows = array(); 
	            while ($stmt->fetch()) { 
	                $obj = new stdClass(); 
	                foreach($row as $key => $val) { 
	                    $obj->{$key} = $val; 
	                } 
	                $result->rows[] = $obj; 
	            } 
	            $stmt->free_result(); 
	        } 
	        $stmt->close(); 
	    } 
	    $result = (array) $result;
	    return $result; 		
	}

	//snap send response to controller
	function snapSendResponse($resp) {
		$resp = json_encode($resp);
		echo $resp;
	}

	//snap remove special characters from string
	function cleanString($string) {
		$string = str_replace(' ', '-', $string);
		return preg_replace('/[^A-Za-z0-9\-]/', '', $string);
	}	

	//snap connect to database
	function snapCreateDbConnect($dbtype) {
		global $APPCONFIG;
		$dbConf = $APPCONFIG[$dbtype];
		$snapDbConn = mysqli_connect('p:'.$dbConf['dbserver'],$dbConf['dbusername'],$dbConf['dbpassword'],$dbConf['dbname']);
		if (!$snapDbConn) {
			//printf("Connect failed: %s\n", mysqli_connect_error());
			return 0;
		}		
		return $snapDbConn;
	}

	//snap get contact list of logged in user
	function snapGetContactList($snapDbConn) {
		global $APPCONFIG;
		$query = "select b.contactid,username,emailaddress,xmppjid, xmpppass,a.userstatus,b.contactstatus,a.userimage from snap_users a inner join snap_user_contacts b on a.id = b.contactid ";
		$query.= "inner join snap_users_webrtc c on b.contactid = c.userid where b.userid = ? and b.contactstatus = 2 ";

		$arrParams = array('s', &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		$responseArr = array();
		if($result['rows']) {
			foreach($result['rows'] as $val) {
				$val = (array) $val;
				array_push($responseArr, $val);
			}
		}
		return array('type' => 'success', 'contactlist' => $responseArr);		
	}

	//snap load all templates required
	function snapLoadAllTemplates() {
		global $APPCONFIG;
		$templateDir = $APPCONFIG['templateDir'];
		$templateArr = array();
		if(is_dir($templateDir)) {
		    if ($dh = opendir($templateDir)) {
		        while (($file = readdir($dh)) !== false) {
		        	$flname = basename($file,".html");
		        	$templateArr[$flname] = file_get_contents($templateDir.$file);
		        }
		        closedir($dh);
		    }
		}		
		return array('type' => 'success', 'templatelist' => $templateArr);		
	}

	//snap invitee user
	function snapInviteUser($snapDbConn,$data) {
		global $APPCONFIG;
		//check if already registered
		$email = $data['emailaddress'];
		$ret = snapCheckIsAlreadyRegistered($snapDbConn,$email);
		if($ret == '-1') return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		elseif(!empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][108]);

		$query = "select id,username from snap_users where emailaddress = ? limit 1 ";
		$arrParams = array('s', &$email); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		$inviteid = $result['rows'][0]->id;
		$username = $result['rows'][0]->username;

		$query = "select count(1) from snap_user_contacts where userid = ?  and contactid = ? ";		
		$arrParams = array('ss', &$_SESSION['userloginid'],&$inviteid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams,array('count')); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		$isadded = $result['rows'][0]->count;

		if(!empty($isadded)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][109]);

		$query = "insert into snap_user_contacts (userid,contactid) values(?,?)";
		$arrParams = array('ss', &$_SESSION['userloginid'],&$inviteid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);


		$query = "select xmppjid from snap_users_webrtc where userid = ? ";
		$arrParams = array('s', &$inviteid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		$xmppjid = $result['rows'][0]->xmppjid;		

		return array('type' => 'success', 'descr' => 'Invitation sent successfully ', 'respdata' => array('username' => $username, 'xmppjid' =>  $xmppjid, 'invietoid' => $inviteid));					

	}

	//snap get list of invitees
	function snapGetInvitees($snapDbConn) {
		global $APPCONFIG;
		$userstatus = $_SESSION['useremailverification'];
		if(empty($_SESSION['useremailverification'])) $userstatus = snapGetUserStatus($snapDbConn,$_SESSION['userloginid']);
		if($userstatus == 1) $_SESSION['useremailverification'] = 1;

		$query = "select c.id,c.userid,username,emailaddress,xmppjid,c.addedon,a.userimage from snap_users a inner join snap_users_webrtc b on a.id = b.userid inner join snap_user_contacts c ";
		$query.= " on c.userid = a.id where c.contactid = ? and c.contactstatus = 1 ";
		$arrParams = array('s', &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		$responseArr = array();
		if($result['rows']) {
			foreach($result['rows'] as $val) {
				$val->addedon =  date('d M', strtotime($val->addedon));
				$val = (array) $val;
				array_push($responseArr, $val);
			}
		}
		return array('type' => 'success', 'invitelist' => $responseArr, 'emailverifystatus' => $userstatus);
	}

	//snap on accept invitee
	function snapAcceptInvite($snapDbConn,$data) {
		global $APPCONFIG;
		$contactid = $data['contactid'];

		$query = "update snap_user_contacts set contactstatus = 2 where userid = ? and contactid = ? limit 1 ";
		//echo $query." ".$contactid;
		$arrParams = array('ss',&$contactid, &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		$query = "insert into snap_user_contacts (userid,contactid,contactstatus) values(?,?,2)";
		$arrParams = array('ss', &$_SESSION['userloginid'],&$contactid); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);

		return array('type' => 'success', 'descr' => 'Invitation accepted successfully', 'contactid' => $contactid, 'tblid' => $data['tblid']);
	}

	//snap on reject invitee
	function snapRejectInvite($snapDbConn,$data) {
		global $APPCONFIG;
		$contactid = $data['contactid'];
		$query = "delete from snap_user_contacts where userid = ? and contactid = ? limit 1 ";
		$arrParams = array('ss',&$contactid, &$_SESSION['userloginid']); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['affected_rows']) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		return array('type' => 'success', 'descr' => 'Invitation rejected successfully', 'contactid' => $contactid, 'tblid' => $data['tblid']);
	}

	//snap on change password send password reset link in email
	function snapSendChangePasswordLink($snapDbConn,$data) {
		global $APPCONFIG;
		$snapurl = $APPCONFIG['SNAPURL'];
		$email = $data['emailaddress'];
		$ret = snapCheckIsAlreadyRegistered($snapDbConn,$email);
		if($ret == '-1') return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		elseif(!empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][117]);

		$query = "select id,username from snap_users where emailaddress = ? limit 1 ";
		$arrParams = array('s', &$email); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!isset($result['rows'])) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);
		$userid = $result['rows'][0]->id;
		$username = $result['rows'][0]->username;

		$time = time();
		$resetid = md5("$userid|||$username|||$email|||$time");

		//generate link data
		$linkdata = array(
			'email'		=>	$email,
			'userid'	=>	$userid,
			'username'	=> 	$username,
			'linktime'	=> 	$time,
			'verifyid'	=> 	$resetid,
			'linktype'	=> 	'resetpassword'
		);

		//insert linkdata into track table
		$ret = snapInsertTrackUrl($snapDbConn,$linkdata);
		if(empty($ret)) return array('type' => 'failed', 'descr' => $APPCONFIG['ERROR'][102]);;

		$resetpasswordlink = $snapurl."passwordreset.php?userid=$userid&uniqid=$resetid";
		$contentData = array(
			'RESETLINK'	=> $resetpasswordlink,
			'USERNAME'	=> $username
		);
		snapSendFalconEmail('resetpassword',$email,$contentData);
		return array('type' => 'success', 'descr' => 'Reset password link sent successfully');	
	}

	//snap save feedback form
	function snapSendFeedback($snapDbConn,$data) {
		global $APPCONFIG;
		$adminEmail = $APPCONFIG['EMAIL']['ADMINEMAILADDRESS'];
		$contactname = $data['name'];
		$contactemail = $data['emailaddress'];
		$message = $data['message'];
		$ipaddress = $_SERVER['REMOTE_ADDR'];
		$browser = $_SERVER['HTTP_USER_AGENT'];
		$feedbackdetails = "<p>";
		$feedbackdetails .= "Name: $contactname<br />";
		$feedbackdetails .= "Email: $contactemail<br />";
		$feedbackdetails .= "Browser: $browser<br />";
		$feedbackdetails .= "IP Address: $ipaddress<br />";
		$feedbackdetails .= "Message: $message<br />";
		$feedbackdetails .= "</p>";
		$contentData = array(
			'FEEDBACKDETAILS'	=> $feedbackdetails
		);		
		snapSendFalconEmail('feedbackform',$adminEmail,$contentData);

		$query = "insert into snap_feedback (contactname,contactemail,browser,ipaddress,message,addedon) values(?,?,?,?,?,now()) ";
		$arrParams = array('sssss', &$contactname, &$contactemail,&$browser, &$ipaddress, &$message); 
		$result = snapDbQuery($snapDbConn,$query,$arrParams); 
		if(!$result['insert_id']) return 0;

		return array('type' => 'success', 'descr' => 'Feedback / Query registered successfully');	
	}

	/****************************************SNAP SEND EMAIL USING FALCONIDE**********************************************************/

	function snapSendFalconEmail($emailtype,$toemailaddress,$emaildata=array()) {
		global $APPCONFIG;
		$emailDet = $APPCONFIG['EMAIL'];
		$fromemail = $emailDet['emailfrom'];
		$apiurl = $emailDet['apiurl'];
		$apikey = $emailDet['apikey'];
		$fromname = $emailDet['fromname'];
		$bccemail = $emailDet['CCEMAILADDRESS'];
		$templateurl = $emailDet[$emailtype]['template'];
		$subject = $emailDet[$emailtype]['subject'];
		$to = $toemailaddress;
		$content = file_get_contents($templateurl);
		foreach($emaildata as $key => $val) $content = str_replace("[$key]", $val, $content);
		$data=array();
		$data['subject'] = 	rawurlencode($subject);                                                                       
		$data['fromname']  = 	rawurlencode($fromname);                                                             
		$data['api_key'] = 	$apikey;
		$data['from'] = 	$fromemail;
		$data['content'] = 	rawurlencode($content);
		$data['recipients'] = $to;
		$data['bcc'] = $bccemail;
		$result = http_post_form($apiurl, $data);
		//file_put_contents('/tmp/res',$result);
	}
	 
	function http_post_form($url,$data,$timeout=20) {
	        $ch = curl_init();
	        curl_setopt($ch, CURLOPT_URL,$url); 
	        curl_setopt($ch, CURLOPT_FAILONERROR, 1);
	        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 
	        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); 
	        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout); 
	        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 0);
	        curl_setopt($ch, CURLOPT_POST, 1); 
	        curl_setopt($ch, CURLOPT_RANGE,"1-2000000");
	        curl_setopt($ch, CURLOPT_POSTFIELDS, $data); 
	        $result = curl_exec($ch); 
	        $result = curl_error($ch) ? curl_error($ch) : $result;
	        curl_close($ch);
	        return $result;
	}


?>
