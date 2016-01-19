<!--NOTIFICATION BOX-->
<div style='position:relative;'>
  <!--WARNING MSG BOX-->
  <div class="alert alert-warning alert-dismissable snapBox" id='snapWarning'>
    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
    <i class="icon fa fa-warning"></i><span id='warnTxt'></span>
  </div>
  <!--ERROR MSG BOX-->
  <div class="alert alert-danger alert-dismissable snapBox" id='snapError'>
    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
    <i class="icon fa fa-ban"></i><span id='errorTxt'></span>
  </div>
  <!--SUCCESS MSG BOX-->
  <div class="alert alert-success alert-dismissable snapBox" id='snapSuccess'>
    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
    <i class="icon fa fa-check"></i><span id='successTxt'></span>
  </div>
</div>

<div class="login-page">

    <!--LOGIN BOX-->
    <div class="login-box" id="loginBox">
      <div class="login-box-body">
        <p class="login-box-msg">Login to start your session</p>
        <form method="post" onsubmit="return false;" >
          <div class="form-group has-feedback" id="snaploginemailaddressDiv">
            <input type="email" class="form-control" placeholder="email address" value="" id="snaploginemailaddress" onfocus='snapHideError(this);' maxlength="100" />
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback" id="snaploginpasswordDiv">
            <input type="password" class="form-control" placeholder="password" value="" id="snaploginpassword" onfocus='snapHideError(this);' maxlength="100" onkeypress='return snapCheckEnter(event,"login");'  />
            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
          </div>
          <div class="row">
            <div class="col-xs-8"></div>
            <div class="col-xs-4"><button class="btn btn-primary btn-block btn-flat" onclick='snapLogin();'>Login</button></div>

          </div>
        </form>
	<div class="social-auth-links text-center">
          <p>- OR -</p>
	  <fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>
        </div>
        <a href="javascript:void(0);" onclick="showContainer('forgot');">I forgot my password</a><br>
        <a href="javascript:void(0);" class="text-center" onclick="showContainer('signup');">Register a new membership</a>
      </div>
    </div>

    <!--SIGNUP BOX-->
    <div class="login-box" id="singupBox" style="display:none">
      <div class="login-box-body">
        <p class="login-box-msg">Register a new account</p>
        <form method="post" onsubmit="return false;">
          <div class="form-group has-feedback" id="snapsignupusernameDiv">
            <input type="text" class="form-control" placeholder="nick name" id="snapsignupusername" onfocus='snapHideError(this);' maxlength="100" value="" />
            <span class="glyphicon glyphicon-user form-control-feedback"></span>
          </div>        
          <div class="form-group has-feedback" id="snapsignupemailaddressDiv">
            <input type="email" class="form-control" placeholder="email address" value='' id='snapsignupemailaddress' onfocus='snapHideError(this);' maxlength="100"  onkeypress='return snapCheckEnter(event,"signup");' />
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback" id="snapsignuppasswordDiv">
            <input type="password" class="form-control" placeholder="password" id="snapsignuppassword" onfocus='snapHideError(this);' maxlength="100" />
            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
          </div>
          <div class="row">
            <div class="col-xs-8"></div>
            <div class="col-xs-4"><button class="btn btn-primary btn-block btn-flat" onclick='snapSignup();'>Register</button></div>
          </div>
        </form>
	<div class="social-auth-links text-center">
          <p>- OR -</p>
	  <fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>
        </div>
        <a href="javascript:void(0);" class="text-center" onclick="showContainer('login');">I already have a membership</a>
      </div>
    </div>

    <!--FEEDBACK BOX-->
    <div class="login-box" id="contactBox" style="display:none">
      <div class="login-box-body">
        <p class="login-box-msg">Say Hello</p>
        <form method="post" onsubmit="return false;">
          <div class="form-group has-feedback" id="snapContactNameDiv">
            <input type="text" class="form-control" placeholder="name" id="snapContactName" onfocus='snapHideError(this);' maxlength="100" />
            <span class="glyphicon glyphicon-user form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback" id="snapContactEmailDiv">
            <input type="email" class="form-control" placeholder="email address" id="snapContactEmail" onfocus='snapHideError(this);' maxlength="100" />
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="form-group has-feedback" id="snapContactMessageDiv">
            <textarea class="form-control" rows="3" placeholder="message" id="snapContactMessage" onfocus='snapHideError(this);' maxlength="250"></textarea>
          </div>
          <div class="row">
            <div class="col-xs-8"></div>
            <div class="col-xs-4"><button class="btn btn-primary btn-block btn-flat" onclick="snapSendFeedbackForm();">Send</button></div>
          </div>
        </form>
      </div>
    </div>    

    <!--FORGOT PASSWORD BOX-->
    <div class="login-box" id="forgotBox" style="display:none">
      <div class="login-box-body">
        <p class="login-box-msg">Forgot Password</p>
        <form method="post" onsubmit="return false;">
          <div class="form-group has-feedback" id="snapforgotpasswordemailaddressDiv">
            <input type="email" class="form-control" placeholder="email address" value='' id='snapforgotpasswordemailaddress' onfocus='snapHideError(this);' maxlength="100" onkeypress='return snapCheckEnter(event,"forgot");' />
            <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
          </div>
          <div class="row">
            <div class="col-xs-8"></div>
            <div class="col-xs-4"><button class="btn btn-primary btn-block btn-flat" onclick="snapSendChangePassword();">Reset</button></div>
          </div>
        </form>
      </div>
    </div>    

</div>

