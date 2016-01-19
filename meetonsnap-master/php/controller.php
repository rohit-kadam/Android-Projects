<?php
	error_reporting(E_ALL);
	include_once('config.php');
	include_once('function.php');
	include_once('notification.php');

	session_start();

	header('Content-Type: application/json');

	$excludeSession = array(
		'snapAddNewUser',
		'snapLoginUser',
		'snapSavePassword',
		'snapSendFeedback',
		'snapSendChangePasswordLink',
		'snapFacebookLogin'
	);
	
	$action = $_POST['data']['action'];
	if($_POST['action'] == 'snapUploadProfileImage') $action = 'snapUploadProfileImage';

	if(empty($action)) {
		$resp = array('type'=>'failed','descr'=> $APPCONFIG['ERROR'][101]);
		snapSendResponse($resp);
		return;		
	}

	$snapDbConn = snapCreateDbConnect('snapdb');
	if(!$snapDbConn) {
		$resp = array('type'=>'failed','descr'=> $APPCONFIG['ERROR'][102]);
		snapSendResponse($resp);
		return;				
	}

	if(empty($_SESSION['userlogin']) && !in_array($action, $excludeSession)) {
			$_SESSION['userlogin'] = 0;		
			session_destroy();
			$resp = array('type'=>'failed','descr'=> $APPCONFIG['ERROR'][555]);
			snapSendResponse($resp);			
			return;
	}

	$data = $_POST['data'];

	switch($action) {

		case 'snapLoadAllTemplates':
			$resp = snapLoadAllTemplates();
			snapSendResponse($resp);
			break;
		
		case 'snapAddNewUser':
			$resp = snapRegisterNewUser($snapDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapLoginUser':
			$resp = snapLoginUser($snapDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapLoadStunTurn':
			$resp = snapLoadStunTurnCreds();
			snapSendResponse($resp);
			break;

		case 'snapGetContactList':
			$resp = snapGetContactList($snapDbConn);
			snapSendResponse($resp);
			break;		

		case 'snapInviteUser':
			$resp = snapInviteUser($snapDbConn,$data);
			snapSendResponse($resp);
			break;		

		case 'snapGetInvitees':
			$resp = snapGetInvitees($snapDbConn);
			snapSendResponse($resp);
			break;

		case 'snapAcceptInvite':
			$resp = snapAcceptInvite($snapDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapRejectInvite':
			$resp = snapRejectInvite($snapDbConn,$data);
			snapSendResponse($resp);
			break;					

		case 'snapSendChangePasswordLink':
			$resp = snapSendChangePasswordLink($snapDbConn,$data);
			snapSendResponse($resp);
			break;			

		case 'snapSavePassword':
			$resp = snapSavePassword($snapDbConn,$data);
			snapSendResponse($resp);
			break;			

		case 'snapSendVerificationEmailLink':
			$resp = snapSendVerificationEmailLink($snapDbConn);
			snapSendResponse($resp);
			break;

		case 'snapSendFeedback':
			$resp = snapSendFeedback($snapDbConn,$data);
			snapSendResponse($resp);
			break;			

		case 'snapGetPreviousChatMessages':
			$tigaseDbConn = snapCreateDbConnect('tigasedb');
			if(!$tigaseDbConn) {
				$resp = array('type'=>'failed','descr'=> $APPCONFIG['ERROR'][102]);
				snapSendResponse($resp);
				return;				
			}		
			$resp = snapGetPreviousChatMessages($tigaseDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapModifyPassword':
			$resp = snapModifyPassword($snapDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapModifyNickname':
			$resp = snapModifyNickname($snapDbConn,$data);
			snapSendResponse($resp);
			break;

		case 'snapUploadProfileImage':
			$resp = snapUploadProfileImage($snapDbConn,$data);
			snapSendResponse($resp);
			break;			

		case 'snapFacebookLogin':
			$resp = snapFacebookLogin($snapDbConn,$data);
			snapSendResponse($resp);
			break;			

		default:
			$resp = array('type'=>'failed','descr'=> $APPCONFIG['ERROR'][103]);
			snapSendResponse($resp);
			break;



	};

?>
