<script type="text/javascript">var PROFILEIMAGE = 'profileimages/<?php echo $_SESSION['userimage']; ?>';</script>
<header class="main-header">
  <!-- Logo -->
  <a href="home.php" class="logo"><span class="logo-lg"><b>MeetOn</b>SNAP</span></a>
  <!-- Header Navbar: style can be found in header.less -->
  <nav class="navbar navbar-static-top" role="navigation">
    <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button"><span class="sr-only">Toggle navigation</span></a>
    <div class="navbar-custom-menu">
      <ul class="nav navbar-nav">
        <!-- Messages: style can be found in dropdown.less-->
        <li class="dropdown messages-menu" title='Show invitation received'>
          <a href="#" class="dropdown-toggle" data-toggle="dropdown">
            <i class="fa fa-envelope-o"></i>
            <span class="label label-success" id='inviteCount'></span>
          </a>
          <ul class="dropdown-menu">
            <li class="header" id='headCount'></li>
            <li>
              <ul class="menu" id='snapInviteBox'>
              </ul>
            </li>
          </ul>
        </li>
        <li class="dropdown user user-menu">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown">
            <img src="profileimages/<?php echo $_SESSION['userimage']; ?>" class="user-image" alt="User Image"/>
            <span class="hidden-xs"><?php echo $_SESSION['userloginname']; ?></span>
          </a>
          <ul class="dropdown-menu">
          <!-- User image -->
            <li class="user-header">
              <img src="profileimages/<?php echo $_SESSION['userimage']; ?>" class="img-circle" alt="User Image" />
                <p><?php echo $_SESSION['userloginname']; ?><small>Member since <?php echo $_SESSION['membersince']; ?></small></p>
            </li>
            <!-- Menu Footer-->
            <li class="user-footer">
              <div class="pull-left"><a href="#" class="btn btn-default btn-flat" onclick='showMyAccount();'>Profile</a></div>
              <div class="pull-right"><a href="index.php?page=logout" class="btn btn-default btn-flat">Sign out</a></div>
            </li>
          </ul>                
        </li>
      </ul>
    </div>
  </nav>
</header>
