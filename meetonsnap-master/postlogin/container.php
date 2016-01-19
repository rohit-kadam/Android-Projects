<div class="content-wrapper" id='content-wrapper' style='position:relative;'>

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
 
  <!--WELCOME BOX-->
  <div class="box box-solid snapEmailVerifyBox" id='snapEmailVerifyBox'>
    <div class="lockscreen" id="snapEmailVerifyBoxLock">
      <div class="lockscreen-wrapper">
        <div class="lockscreen-logo">
          <a href="javascrip:void(0);"><b>Email Verification</b></a>
        </div>
        <div class="lockscreen-item">
          <div class="lockscreen-image">
            <img src="profileimages/<?php echo $_SESSION['userimage']; ?>" alt="user image"/>
          </div>
          <form class="lockscreen-credentials" onsubmit="return false;">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="nick name" value='<?php echo $_SESSION['userloginname']; ?>' readonly="true" style="background-color:#fff;" />
            </div>
          </form>
        </div>
        <div class="help-block text-center">You received an email for confirming your registration<br /></div>
        <div class="help-block text-center">Please check your email, if you have not received the email yet <br /></div>
        <div class="help-block text-center"><a href='javascript:void(0)' onclick='snapSendVerificationEmailLink();'>click here</a> to re-send the verification email<br /></div>
        <div class="help-block text-center"><br /></div>
        <div class="help-block text-center">Best viewed on<br />
            <img src="postlogin/img/chrome.png" />
            <img src="postlogin/img/firefox.png" />
            <img src="postlogin/img/opera.png" />
        </div>
      </div>
    </div>
  </div>

  <!--WELCOME BOX-->
  <div class="box box-solid snapEmailVerifyBox" id='snapWelcomeBox'>
    <div class="lockscreen" id='snapWelcomeBoxLock'>
      <div class="lockscreen-wrapper">
        <div class="lockscreen-logo">
          <a href="javascrip:void(0);"><b>Welcome to MeetOnSnap</b></a>
        </div>
        <div class="lockscreen-item">
          <div class="lockscreen-image">
            <img src="profileimages/<?php echo $_SESSION['userimage']; ?>" alt="user image"/>
          </div>
          <form class="lockscreen-credentials" onsubmit="return false;">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="nick name" value='<?php echo $_SESSION['userloginname']; ?>' readonly="true" style="background-color:#fff;" />
            </div>
          </form>
        </div>
        <div class="help-block text-center">An online communication solution to connect with your friends, family & others.<br /></div>
        <div class="help-block text-center">Audio / Video calls without any installation<br /></div>
        <div class="help-block text-center">Free & an experimental solution<br /></div>
        <div class="help-block text-center">Based on HTML5 & WebRTC<br /></div>
        <div class="help-block text-center"><br /></div>
        <div class="help-block text-center">Best viewed on<br />
            <img src="postlogin/img/chrome.png" />
            <img src="postlogin/img/firefox.png" />
            <img src="postlogin/img/opera.png" />
        </div>
      </div>
    </div>
  </div>

  <!--MYACCOUNT BOX-->
  <div class="box box-primary snapEmailVerifyBox" id='snapMyAccountBox'>

        <div class="box box-solid">

          <div class="box-header with-border">
            <h3 class="box-title">My Account</h3>
          </div>

          <div class="box-body">
            <div class="box-group" id="accordion">
          
              <!--CHANGE PASSWORD-->    
              <div class="panel box box-primary">
                <div class="box-header">
                  <h4 class="box-title">
                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" class="collapsed">
                      Change Password
                    </a>
                  </h4>
                </div>
                <div id="collapseOne" class="panel-collapse collapse" aria-expanded="false" style="height: 0px;">
                  <div class="box-body">
                    <form role="form" onsubmit="return false;">
                      <div class="box-body">
                        <div class="form-group" id="oldpasswordDiv">
                          <label for="exampleInputPassword1">Old Password</label>
                          <input type="password" class="form-control" id="oldpassword" placeholder="old password" onfocus='snapHideError(this);' maxlength="100">
                        </div>
                        <div class="form-group" id="newpasswordDiv">
                          <label for="exampleInputPassword1">New Password</label>
                          <input type="password" class="form-control" id="newpassword" placeholder="new password" onfocus='snapHideError(this);' maxlength="100">
                        </div>
                        <div class="form-group" id="renewpasswordDiv">
                          <label for="exampleInputPassword1">Re-type Password</label>
                          <input type="password" class="form-control" id="renewpassword" placeholder="retype password" onfocus='snapHideError(this);' maxlength="100">
                        </div>                        
                      </div>
                      <div class="box-footer">
                        <button type="button" class="btn btn-primary" onclick='saveAccountDetails();'>Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <!--CHANGE PROFILE IMAGE--> 
              <div class="panel box box-primary">
                <div class="box-header">
                  <h4 class="box-title">
                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" class="collapsed" aria-expanded="false">
                      Change Profile Image
                    </a>
                  </h4>
                </div>
                <div id="collapseTwo" class="panel-collapse collapse" aria-expanded="false" style="height: 0px;">
                  <div class="box-body">
                    <div class="lockscreen-item">
                      <div class="lockscreen-image">
                        <img src="profileimages/<?php echo $_SESSION['userimage']; ?>" alt="user image"/>
                      </div>
                      <form class="lockscreen-credentials" onsubmit="return false;" enctype='multipart/form-data' method="post">
                        <div class="form-group" id="myprofilepicDiv">
                          <input type="file" class="form-control" id="myprofilepic" placeholder="select file" onfocus='snapHideError(this);' />
                          <div class='help-block text-center' style='font-size:10px;'>Note: png & jpg image allowed (size < 100 KB)</div>
                        </div>
                      </form><br />
                      <div class="box-footer">
                        <button type="button" class="btn btn-primary" onclick='saveMyProfilePic();'>Save</button>
                      </div>
                    </div>                    
                  </div>
                </div>
              </div>
              
              <!--CHANGE NICKNAME--> 
              <div class="panel box box-primary">
                <div class="box-header">
                  <h4 class="box-title">
                    <a data-toggle="collapse" data-parent="#accordion" href="#collapseThree" class="" aria-expanded="true">
                      Change Nickname
                    </a>
                  </h4>
                </div>
                <div id="collapseThree" class="panel-collapse collapse in" aria-expanded="true">
                  <div class="box-body">

                    <form role="form" onsubmit="return false;">
                      <div class="box-body">
                        <div class="form-group" id="mynicknameDiv">
                          <label for="exampleInputPassword1">Nickname</label>
                          <input type="text" class="form-control" id="mynickname" placeholder="Nick name" onfocus='snapHideError(this);' maxlength="100">
                        </div>
                      </div>
                      <div class="box-footer">
                        <button type="button" class="btn btn-primary" onclick='saveMyNickName();'>Save</button>
                      </div>
                    </form>


                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>



  </div>


  <div class="row" id='snapChatRow'>
    <section class="col-lg-7 connectedSortable ui-sortable" id='snapContainerDiv'></section>
  </div>
</div>

