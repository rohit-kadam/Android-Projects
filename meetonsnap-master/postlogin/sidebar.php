<aside class="main-sidebar" id='snapSideBox'>
  <section class="sidebar">
    <ul class="sidebar-menu"><li class="header">SNAP INVITE</li></ul>
    <form action="#" method="get" class="sidebar-form" onsubmit="return false;">
    	<div class="input-group">
		<input type="text" class="form-control" placeholder="Type here..." id='snapinviteemailaddress' maxlength="100" />
		<span class="input-group-btn"><button type='button' name='invite' id='search-btn' class="btn btn-flat" onclick='snapInvite();' title='Send invitation'><i class="fa fa-arrow-circle-o-right"></i></button></span>
	</div>
    </form>
    <ul class="sidebar-menu"><li class="header">SNAP CONTACTS</li></ul>
    </section>
    <section id='sidebar'>
        <div class='sidebarLoader' id='sidebarLoader'></div>
        <ul class='sidebar-menu' id='sidebar_ul'>
        </ul>
    </section>
</aside>

