/*************************************SNAP CONSTANTS****************************************/

var CONTROLLERURL = "php/controller.php",
	CURRENTWEBRTCNODE = '',
	WEAKPASS = 'Password must contain atleast <ul><li>one uppercase character</li><li>one lowercase character</li><li>an integer value</li><li>length must be greater than 6 characters</li></ul>';

/*************************************SNAP AJAX****************************************/

//XHR
var snapExecAjax = function(params) {
	var jqxhr = $.post(CONTROLLERURL,{data:params})
	.done(function(data) {
		successCallback(data,params.action);
	})
	.fail(function() {
		console.log('AJAX failed');
	});
};

//XHR CALLBACK
var successCallback = function(data,requestOf) {
	var stats = data.type;
	if(stats == 'success') {
		switch(requestOf) {
			case 'snapFacebookLogin':
			case 'snapLoginUser':
			case 'snapAddNewUser':
				window.location.href = 'home.php';
				break;
			case 'snapSendChangePasswordLink':
			case 'snapSavePassword':
				snapNotifyBox(data.descr);
				$('#snapResetPassContainer').hide();
				$('#snapOnResetPassContainer').show();				
				break;
			case 'snapSendVerificationEmailLink':
			case 'snapSendFeedback':
				snapNotifyBox(data.descr);
				break;				
		}
	} else if(stats == 'failed') {
		snapNotifyBox(data.descr,'error');
	}	
};

/*************************************SNAP COMMON HELPER****************************************/

//show hide main container
var showContainer = function(showme) {
	$('#singupBox, #contactBox, #loginBox, #forgotBox').hide();
	switch(showme) {
		case 'login':
			$('#loginBox').show();
			break;
		case 'signup':
			$('#singupBox').show();	
			break;
		case 'contact':
			$('#contactBox').show();	
			break;
		case 'forgot':
			$('#forgotBox').show();
			break;						
	}
};

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
	setTimeout(function() {el.hide();},5000);	
}

//validate email address
var snapValidateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

//show error
var snapShowError = function(err) {
	$.each(err, function(key,val) {$('#'+val+'Div').addClass('has-error');});
};

//hide error
var snapHideError = function(elem) {
	var val = elem.id;
	$('#'+val+'Div').removeClass('has-error');	
};

//on enter key press
var snapCheckEnter = function(event,type) {
	if(event.which == 13) {
		if(type == 'login') snapLogin();
		else if(type == 'signup') snapSignup();
		else if(type == 'forgot') snapSendChangePassword();
		return false;
	}
	return true;
};

//is strong password check
var snapIsStrongPassword = function(password) {
	if(password.length < 6) return 0;
	if(password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)) return 1;
	return 0;
};

/*************************************SNAP LOGIN / SIGNUP****************************************/

//Login user
var snapLogin = function() {
	var emailaddress = $('#snaploginemailaddress').val();
	var password = $('#snaploginpassword').val();
	var err = new Array();
	if(emailaddress == '') err.push('snaploginemailaddress');
	if(password == '') err.push('snaploginpassword');
	if(emailaddress && !snapValidateEmail(emailaddress)) err.push('snaploginemailaddress');
	if(err.length > 0) {
		snapShowError(err);
		return;
	}
	snapLoginUser(emailaddress,password);
};

//on forgot password link click
var snapForgotPassword = function() {
	$('#snapLoginContainer').hide();
	$('#snapForgotPasswordContainer').show();
};

//change password form validator
var snapSendChangePassword = function() {
	var emailaddress = $('#snapforgotpasswordemailaddress').val();
	var err = new Array();
	if(emailaddress == '') err.push('snapforgotpasswordemailaddress');
	if(emailaddress && !snapValidateEmail(emailaddress)) err.push('snapforgotpasswordemailaddress');
	if(err.length > 0) {
		snapShowError(err);
		return;
	}
	snapSendChangePasswordLink(emailaddress);	
};

//save new password form validator
var snapSaveChangePassword = function() {
	var err = new Array();
	var emailaddress = $('#snapsaveemailaddress').val();
	if(emailaddress == '') err.push('snapsaveemailaddress');
	if(emailaddress && !snapValidateEmail(emailaddress)) err.push('snapsaveemailaddress');
	var password = $('#snapsavenewpassword').val();
	if(password == '') err.push('snapsavenewpassword');
	if(password && !snapIsStrongPassword(password)) {
		snapNotifyBox(WEAKPASS,'error');
		err.push('snapsavenewpassword');
	}
	if(err.length > 0) {
		snapShowError(err);
		return;
	}
	snapSavePassword(emailaddress,password);
}

//signup user
var snapSignup = function() {
	var username = $('#snapsignupusername').val();
	var password = $('#snapsignuppassword').val();
	var emailaddress = $('#snapsignupemailaddress').val();
	var err = new Array();
	if(username == '') err.push('snapsignupusername');
	if(password == '') err.push('snapsignuppassword');
	if(password && !snapIsStrongPassword(password)) {
		snapNotifyBox(WEAKPASS,'error');
		err.push('snapsignuppassword');
	}

	if(emailaddress == '') err.push('snapsignupemailaddress');
	if(emailaddress && !snapValidateEmail(emailaddress)) err.push('snapsignupemailaddress');
	if(err.length > 0) {
		snapShowError(err);
		return;
	}
	snapAddNewUser(username,password,emailaddress);
};

//validate feedback form
var snapSendFeedbackForm = function() {
	var emailaddress = $('#snapContactEmail').val();
	var name = $('#snapContactName').val();
	var message = $('#snapContactMessage').val();
	var err = new Array();
	if(name == '') err.push('snapContactName');
	if(message == '') err.push('snapContactMessage');	
	if(emailaddress == '') err.push('snapContactEmail');
	if(emailaddress && !snapValidateEmail(emailaddress)) err.push('snapContactEmail');
	if(err.length > 0) {
		snapShowError(err);
		return;
	}
	$('#snapContactEmail, #snapContactName, #snapContactMessage').val('')
	snapSendFeedback(emailaddress,name,message);
};


/*************************************SNAP CALL AJAX****************************************/

//xhr login user
var snapLoginUser = function(emailaddress,password) {
	var params = {
		'action': 'snapLoginUser',
		'emailaddress' : emailaddress,
		'password' : password
	};
	snapExecAjax(params);
};

//xhr add new user
var snapAddNewUser = function(username,password,emailaddress) {
	var params = {
		'action': 'snapAddNewUser',
		'username' : username,
		'emailaddress' : emailaddress,
		'password' : password
	};
	snapExecAjax(params);
};

//xhr save new password
var snapSavePassword = function(emailaddress,password) {
	var params = {
		'action': 'snapSavePassword',
		'emailaddress' : emailaddress,
		'password' : password,
		'linkid' : $('#linkid').val()
	};
	snapExecAjax(params);
};

//xhr change password (sends reset password link in email)
var snapSendChangePasswordLink = function(emailaddress) {
	var params = {
		'action': 'snapSendChangePasswordLink',
		'emailaddress' : emailaddress
	};
	snapExecAjax(params);
};

//xhr resend email verification email
var snapSendVerificationEmailLink = function() {
	var params = {'action': 'snapSendVerificationEmailLink'};
	snapExecAjax(params);	
};

//xhr send feedback form
var snapSendFeedback = function(emailaddress,name,message) {
	var params = {
		'action': 'snapSendFeedback',
		'emailaddress' : emailaddress,
		'name' : name,
		'message' : message
	};
	snapExecAjax(params);
};


/*************************************SNAP SOCIAL LOGIN****************************************/

var snapFacebookStatusChangeCallback = function(response) {
        if (response.status === 'connected') {
                console.log('facebook app allowed');
                snapFacebookLogin();
        } else if (response.status === 'not_authorized') console.log('Please allow meetonsnap');
        else console.log('not logged in facebook');
}

var checkLoginState = function() {
        FB.getLoginStatus(function(response) {snapFacebookStatusChangeCallback(response);});
}

window.fbAsyncInit = function() {
        FB.init({
                appId      : '1595702874013700',
                cookie     : true,  // enable cookies to allow the server to access 
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.2' // use version 2.2
        });
};

(function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var snapFacebookLogin = function() {
        FB.api('/me', function(response) {
                console.log('Successful login for: ' + response.name);
                var params = {
                    'action': 'snapFacebookLogin',
                    'emailaddress' : response.email,
                    };
                snapExecAjax(params);
        });
}

