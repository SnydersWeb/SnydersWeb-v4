<?php
$blnGoodData = true;

//Test to see if some fartknocker is trying to use an injection exploit.
if(eregi("Content-Transfer-Encoding",$_POST['name'].$_POST['email'].$_POST['phone'].$_POST['message'])){
	$blnGoodData = false;
} else if(eregi("MIME-Version",$_POST['name'].$_POST['email'].$_POST['phone'].$_POST['message'])){
	$blnGoodData = false;
} else if(eregi("Content-Type",$_POST['name'].$_POST['email'].$_POST['phone'].$_POST['message'])){
	$blnGoodData = false;
} else {
	//So far no shenanigans, parse the fields in.
	$name = $_POST['name'];
	$email = $_POST['email'];
	$phone = $_POST['phone'];
	$message = $_POST['message'];
	
	//Clean newline and return characters from single-line fields
	$name = preg_replace( "/\n/", " ", $name );
	$name = preg_replace( "/\r/", " ", $name );
	
	$email = preg_replace( "/\n/", " ", $email );
	$email = preg_replace( "/\r/", " ", $email );
	
	$phone = preg_replace( "/\n/", " ", $phone );
	$phone = preg_replace( "/\r/", " ", $phone );
	
	if(eregi("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$", $email)) {
		$email = $email;
	} else {
		$email = "";
	}
}

if(!$blnGoodData) {
	$byeSpammer = "<strong>Invalid or corrupt content entered!!\n<br />\n<br />If you are trying an injection exploit, I suggest you try something more productive with your life such as suicide or playing in traffic!\n<br />\n<br />This exploit attempt has been logged!</strong>\n<br />\n<br />";
}
?>
<?php echo "<?xml version=\"1.0\" encoding=\"utf-8\"?>" ?>
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="english">
<head>
	<title>SnydersWeb.com - Contact Me</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="icon" href="../favicon.ico" type="image/x-icon" />
	<link rel="shortcut icon" href="../favicon.ico" type="image/x-icon" />
	<link rel="stylesheet" href="../styleSheets/baseStyle.css" />
	<script type="text/javascript" src="../componentTemplates/topicBarComponent.js" defer></script>
	<script type="text/javascript" src="../componentTemplates/subTopicComponent.js" defer></script>
	<script type="text/javascript" src="../scripts/topicBarComponent.js" defer></script>
	<script type="text/javascript" src="../scripts/subTopicComponent.js" defer></script>
	<script type="text/javascript" src="../scripts/pageFetcher.js" defer></script>
	<script type="text/javascript" src="../scripts/maestro.js" defer></script>
</head>

<body>

<!-- Begin Print Site Logo Div - Outside of mainContainer so it can go behind it.-->
<div id="printLogo"><img src="../interfaceImages/snydersWebLogo.svg" width="169" height="145" alt="SnydersWeb" /></div>
<div id="printBanner">www.SnydersWeb.com<br /><hr /></div>
<div id="printLogoCover"></div>
<!-- End Print Site Logo Div -->

<!-- Circuit Background Elements -->
<div id="backgroundBackLayer"></div>
<div id="backgroundFrontLayer"></div>

<div id="mainContainer">
	<!-- Begin Site Logo Div -->
	<div id="logo"><img src="../interfaceImages/snydersWebLogo.svg" width="169" height="145" alt="SnydersWeb" /></div>
	<!-- End Site Logo Div -->
	
	<!-- Begin Selected Topic Bar Area -->
	<header id="selectedBar">
		<topic-bar data-id="contact" href="./index.html">
			<div class="barTextSlot">Contact Me</div>
			<div name="selectedSubTopic" class="selSubTopics">				
			</div>
			<div name="subTopics" class="subTopics">
			</div>
		</topic-bar>
	</header>
	<!-- End Selected Topic Bar Area -->

	<!-- End UnSelected Topic Bar Area -->
	<nav id="unSelectedBarArea">
		<menu role="navigation" aria-label="Main Navigation">
			<li data-id="home" class="topicBarParking"><topic-bar data-id="home" href="../index.html"><div class="barTextSlot">Home</div></topic-bar></li>
			<li data-id="aboutMe" class="topicBarParking"><topic-bar data-id="aboutMe" href="../aboutMe/index.html"><div class="barTextSlot">About Me</div></topic-bar></li>
			<li data-id="webSites" class="topicBarParking"><topic-bar data-id="webSites" href="../webSites/index.html"><div class="barTextSlot">Web Sites</div></topic-bar></li>
			<li data-id="portfolio" class="topicBarParking"><topic-bar data-id="portfolio" href="../portfolio/index.html"><div class="barTextSlot">Art Portfolio</div></topic-bar></li>
			<li data-id="destinations" class="topicBarParking"><topic-bar data-id="destinations" href="../destinations/index.html"><div class="barTextSlot">Destinations</div></topic-bar></li>
			<li data-id="contact" class="topicBarParking"></li>
		</menu>
	</nav>
	<!-- End UnSelected Topic Bar Area -->

	<!-- Begin Content Window -->
	<main id="contentPanel">
		<div class="contentTop">
			<div class="contentTopLeft"></div>
			<div class="contentTopLeftInner"></div>
			<div class="contentTopMiddle"></div>
			<div class="contentTopRightInner"></div>
			<div class="contentTopRight"></div>
		</div>
		<div class="contentBody">
			<div class="contentBodyLeft">
				<div class="leftTop"></div>
				<div class="leftThick"></div>
				<div class="leftTrans"></div>
				<div class="leftDouble"></div>
				<div class="leftDoubleEnd"></div>
			</div>
			<!-- Begin Page Content -->
			<div class="contentArea">
				<div id="content" class="bodyText" role="document" data-dir="contact/">

<!-- Begin Breadcrumb Area -->
<span class="breadCrumbHist"><a href="../index.html">Home</a> : </span>
<span class="breadCrumbCurrent"><a href="index.html">Contact Me</a></span>
<!-- End Breadcrumb Area -->
<br /><br />

<h1>Contact Me</h1>
<?php
if(!$blnGoodData) {
	echo $byeSpammer;
}

if($name == "" || $email == "" || $message == "") {
?>
<?php
} else { //Output the form
?>
	Thank you, <?php echo $name ?><br /><br />
	I appreciate your contact.<br /><br />

<?php
	//Send the email
	$to = "webFeedback@SnydersWeb.com";
	$subject = "Feedback from website";
	$body = "From: $name\r\nEmail: $email\r\nPhone: $phone\r\n\r\n$message";   
	$extra = "From:$name<$email>\r\nReply-To:$email\r\n";   
	
	if (mail($to, $subject, $body, $extra)) {
	   echo("Message successfully sent!<br /><br />\n\n");
	} else {
	   echo("Message delivery failed...<br /><br />\n\n");
	}
}
?>
				<br /><br />
			
			</div>
		</div>
		<!-- End Page Content -->
		<div class="contentBodyRight">
			<div class="rightThin"></div>
			<div class="rightDoubleEnd"></div>
			<div class="rightDouble"></div>
			<div class="rightTrans"></div>
			<div class="rightThick"></div>
			<div class="rightBottom"></div>
		</div>
	</div>
	<div class="contentBottom">
		<div class="contentBotLeft"></div>
		<div class="contentBotLeftInner"></div>
		<div class="contentBotMiddle"></div>
		<div class="contentBotRightInner"></div>
		<div class="contentBotRight"></div>
	</div>
</main>	
<!-- End Content Window -->

</div>

</body>
</html>