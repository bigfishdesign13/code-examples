var VideoPlayer = function(examdata, examtype) {
	var _this = this;
	var _hasflash = hasFlash();
	var _playermode = _hasflash ? 'flash' : 'html5';
	var _jw;
	var _initseek = true;
	
	this['loaded'] = false;
	this['monitorenabled'] = false;
	this['timeMonitorCallback'];
	// this['fms'] = 'elm_flash.smartpros.com';
	this['fms'];
	this['progressive'];
	this['courseid'];
	this['isplaying'] = false;
	this['userclicked'] = false;
	
	function init() {
		loaded['mediaplayer'] = true;
		go('MEDIA PLAYER');
	}
	
	init();
	
	this['setVideoPlayer'] = function(streamid) {
		var paths = getStreamPaths(streamid);
		var div = 'theVideoPlayer';
		var w = '100%';
		var h = '';
		var autostart = true;
		var controls = false;
		var abouttext = 'SmartPros Ltd';
		var aboutlink = 'http://www.smartpros.com';
	
		$('button.toggle-state').click(function() {
			_this.userclicked = true;
			
			var streamid = data ? data.config.streams['current'] : 4;
			var count = data.current["count"];
			
			if (_initseek) {
				_this.loadStream(streamid, count);
			} else {
				_this.togglePlayState();
			}
		});
		
		// HIDE MUTE BUTTON FO MOBILE DEVICES
		if (isMobile()) {
			$('button.toggle-audio').hide();
		} else {
			$('button.toggle-audio').click(function() {
				jwplayer().setMute();
			});
		}
		
		$('button.jump-back').click(function() {
			_this.jumpVideo('back');
		});
		$('button.jump-ahead').click(function() {
			_this.jumpVideo('ahead');
		});
		
		// VIDEO OVERLAY
		$('#video-overlay').click(function() {
			/* trace('click overlay'); */
			_this.userclicked = true;
			
			var streamid = data ? data.config.streams['current'] : 4;
			var count = data.current["count"];
			
			if (_initseek) {
				_this.loadStream(streamid, count);
			} else {
				_this.togglePlayState();
			}
		});
		
		var sources_obj;
		
		if (ie) {
			sources_obj = [{
							sources: [
								{ file: paths.progressive['mp4'] },
								{ file: paths.stream['ios'] },
								{ file: paths.stream['flash'] }
							]
						}];
		} else {
			sources_obj = [{
							sources: [
								{ file: paths.stream['ios'] },
								{ file: paths.progressive['mp4'] },
								{ file: paths.stream['flash'] }
							]
						}];
		}
		
		_jw = jwplayer(div).setup({
			width: w,
			height: h,
			controls: controls,
			abouttext: abouttext,
			aboutlink: aboutlink,
			autostart: autostart,
			provider: 'video',
			mediaid: 'eLP.H5',
			playlist: sources_obj
		});
		
		jwplayer().on('ready', function(evt) {
			// trace('-----> on Ready');
			onReadyHandler(evt);
		});
	
		jwplayer().on('play', function(evt) {
			// trace('-----> on Play');
			onPlayHandler(evt);
		});
	
		jwplayer().on('pause', function(evt) {
			// trace('-----> on Pause');
			onPauseHandler(evt);
		});
	
		jwplayer().on('idle', function(evt) {
			// trace('-----> on Idle');
			onIdleHandler(evt);
		});
	
		jwplayer().on('time', function(evt) {
			// trace('-----> on Time');
			timeMonitor(evt);
		});
	
		jwplayer().on('seek', function(evt) {
			// trace('-----> on Seek');
			onSeekHandler(evt);
		});
	
		jwplayer().on('mute', function(evt) {
			// trace('-----> on Mute');
			onMuteHandler();
		});
	
		jwplayer().setMute(false);
	}
	
	
	this['loadStream'] = function(streamid, cnt) {
		// trace('---------------> loadStream :: ' + streamid + ' :: ' + cnt);
	
		_initseek = true;
	
		var paths = getStreamPaths(streamid);
		var count = cnt ? cnt : 0;
		var subsection = data.course.subsections[count];
		var timestamp = subsection.attributes.timestamp ? subsection.attributes.timestamp : 0;
		
		jwplayer().load([
			{ file: paths.stream['flash'] },
			{ file: paths.stream['ios'] },
			{ file: paths.progressive['mp4'] }
		]);
		
		_this.playVideo(count);
	
		setStreamMenu(streamid);
		setStreamBookmark(streamid);
	}
	
	this['playVideo'] = function(i) {
		var subsection = data.course.subsections[i];
		var count = subsection.attributes.count;
		var timestamp = subsection.attributes.timestamp ? subsection.attributes.timestamp : 0;
		var streamid = data.config.streams['current'];
	
		// trace("---------> playVideo :: " + i + " :: " + timestamp + " :: " + streamid + " :: _initseek == " + _initseek + " :: _this.userclicked == " + _this.userclicked);
		
		if (_initseek) {
			jwplayer().play(true);
		} else {
			jwplayer().seek(timestamp);
		}
		
		if (isMobile()) {
			if (_this.userclicked)
				startCheckLoading();
			else
				mediaplayer.showNotification(true, 'error', 'Click the play button above');
		}
		
		// SET BANDWIDTH MENU
		setStreamMenu(streamid);
	}

	this['jumpVideo'] = function(direction) {
		var ctime = jwplayer().getPosition();
		var duration = jwplayer().getDuration();
		var jumptime;
		
		// trace('\n---> NEXT TIMESTAMP == ' + nextstamp + '\n');
	
		switch (direction) {
			case 'back' :
				jumptime = (ctime - 20);
				if (jumptime > 0)
					jwplayer().seek(jumptime); 
			break;
		
			case 'ahead' :
				var nextstamp = getNextTimestamp(data.current.count + 1);
				
				if ((ctime + 20) > nextstamp)
					goNext(); // jumptime = (nextstamp - 1);
				else
					jumptime = (ctime + 20);
				
				if (jumptime < duration)
					jwplayer().seek(jumptime); 
			break;
		}
	}
	
	this['togglePlayState'] = function() {
		var state = jwplayer().getState().toUpperCase();
		
		switch (state) {
			case 'PAUSED' :
				jwplayer().play(true);
			break;
			
			case 'BUFFERING' :
				jwplayer().play(true);
			break;
			
			case 'PLAYING' :
				// jwplayer().pause(true);
				_this.pauseVideo();
			break;
		}
	}
	
	this['pauseVideo'] = function() {
		jwplayer().pause(true);
	}
	
	this['getDuration'] = function() {
		return jwplayer().getDuration();
	}
	
	this['showVideo'] = function(showit) {
		switch (showit) {
			case false :
				if (isMobile())
					$( '#video-ui' ).css('margin-top', '-5000px').css('float', 'left');
				else
					$( '#video-ui' ).css('display', 'none');
				break
		
			default :
				if (isMobile())
					$( '#video-ui' ).css('margin-top', '0').css('float', '');
				else
					$( '#video-ui' ).css('display', 'block');
				break;
		}
	}
	
	this['enableFastforward'] = function(doit) {
		switch (doit) {
			case false :
				$('.jump-ahead').addClass('disabled');
				$('.jump-ahead').attr('disabled', 'true');
				break;
			
			default :
				$('.jump-ahead').removeClass('disabled');
				$('.jump-ahead').removeAttr('disabled');
				break;
		}
	}
	
	function getStreamPaths(streamid) {
		// trace('---> GET STREAM PATHS :: ' + _this.fms + ' :: ' + _this.progressive + ' :: ' + _this.courseid + ' :: ' + streamid);
	
		var filename = 'elp/' + _this.courseid + '/' + _this.courseid + '-' + streamid;
		var paths = new Object();
	
		paths['stream'] = new Object();
		paths.stream['flash'] = 'rtmp://' + _this.fms + '/vod/mp4:' + filename + '.mp4';
		paths.stream['ios'] = '//' + _this.fms + '/hls-vod/' + filename + '.mp4.m3u8';
	
		paths['progressive'] = new Object();
		paths.progressive['mp4'] = '//' + _this.fms + '/vod/' + filename + '.mp4';
		paths.progressive['webm'] = '//' + _this.fms + '/vod/' + filename + '.webm';
		paths.progressive['ogv'] = '//' + _this.fms + '/vod/' + filename + '.ogv';
		
		paths['faux'] = new Object();
		paths.faux['mp4'] = '//' + _this.progressive + '/faux-mp4.php?s=vod-combo/' + filename + '.mp4';
	
		return paths;
	}
	
	function setStreamBookmark(streamid) {
		// trace("-------> SET STREAM BOOKMARK :: " + streamid);
		
		params = new ParamsData();
		params.action = "set-bandwidth";
		params.valid = data.user['valid'];
		params.newBandwidth = streamid;
		params.version = getVer();
	
		datamanager.callGateway("set-bandwidth", params, datamanager.parseBandwidth);
	}
	
	function setStreamMenu(streamid) {
		// trace("-----> setStreamMenu :: " + streamid);
	
		$('#stream0').removeClass('current');
		$('#stream1').removeClass('current');
		$('#stream2').removeClass('current');
		$('#stream3').removeClass('current');
	
		$('#stream' + (streamid - 1)).addClass('current');
	}
	
	function showOverlay(showit) {
		// trace("-----> showOverlay :: " + showit);
		
		var overlay = $('#video-overlay');
		var icon = $('#video-overlay .pause-icon-btn');
		
		switch (showit) {
			case false :
				overlay.css({
					display: 'none'
				});
				icon.css({
					display: 'none'
				});
			break;
			
			default :
				_this.setOverlaySize();
				
				overlay.css({
					display: 'block'
				});
			break;
		}
	}
	this['showOverlay'] = function(showit) {
		// trace("-----> showOverlay :: " + showit);
		
		var overlay = $('#video-overlay');
		var icon = $('#video-overlay .pause-icon-btn');
		
		switch (showit) {
			case false :
				overlay.css({
					display: 'none'
				});
				icon.css({
					display: 'none'
				});
			break;
			
			default :
				_this.setOverlaySize();
				
				overlay.css({
					display: 'block'
				});
			break;
		}
	}
	
	this['setOverlaySize'] = function() {
		var overlay = $('#video-overlay');
		var vw;
		var vh;
		
		if ($('#video-ui').length) {
			vw = $('#video-ui').width();
			vh = $('#theVideoPlayer').height();
		} else {
			vw = $('#video-ui').width();
			vh = $('#theVideoPlayer').height();
		}
		
		overlay.css({
			width: vw,
			height: vh
		});
		
		var icon = $('#video-overlay .pause-icon-btn');
		var iw = icon.width();
		var ih = icon.height();
		var ix = (vw / 2) - (iw / 2);
		var iy = (vh / 2) - (ih / 2);
		
		icon.css({
			'margin-left': ix + 'px',
			'margin-top': iy + 'px',
			'display': 'block'
		});
	}
	
	this['setVideoPlayerSize'] = function(w, h) {
		// trace('setVideoPlayerSize == ' + w + ':' + h)
		
		if (w && h && jwplayer().resize)
			jwplayer().resize(w, h);
	}
	
	this['showNotification'] = function(showit, type, msg) {
		var mn = $('#media-notification');
		var c = $('#video-controls');
		var cposition = c.position();
		var mntop = cposition.top + c.height() + 7;
		
		switch (type) {
			case 'error' :
				mn.addClass('error');
				break;
			
			default :
				mn.removeClass('error');
				break;
		}
		
		switch (showit) {
			case false :
				mn.hide();
				break;
			
			default :
				// mn.css('top', mntop);
				mn.css('bottom', -18);
				mn.html(msg);
				mn.show();
				break;
		}
	}
	
	this['getPlayerMode'] = function() {
		var mode = jwplayer().getRenderingMode();
		return mode;
	}
	
	/* TIME MONITOR * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	function timeMonitor(evt) {
		var ctime = evt.position;
		var duration = evt.duration;
		
		// trace('---> timeMonitor -- ' + ctime + ' :: ' + duration + ' :: ' + _this.monitorenabled);
	
		$('#stopwatch').html( secondsToTime(ctime) + " / " + secondsToTime( duration ) );
		
		stopCheckLoading();
		
		if (_this.monitorenabled) {
			_this.showNotification(false);
			
			if(this['timeMonitorCallback'])
				this['timeMonitorCallback'](ctime);
		}
		
		
		if (_initseek) {
			var timestamp;
			
			if (data) {
				var count = data.current.count;
				var subsection = data.course.subsections[count];
				timestamp = subsection.attributes.timestamp;
			} else {
				timestamp = 300;
			}
			
			if (timestamp) {
				jwplayer().seek(timestamp);
			}
			
			_initseek = false;
		}
		
	}
	
	var loadingtime;
	var checkloadingtimer;
	
	function startCheckLoading() {
		// trace('startCheckLoading');
		loadingtime = 0;
		checkloadingtimer = setInterval(checkLoading, 1000);
	}
	
	function stopCheckLoading() {
		if (checkloadingtimer) {
			// trace('stopCheckLoading');
			clearInterval(checkloadingtimer);
			checkloadingtimer = false;
		}
	}
	
	function checkLoading() {
		// trace('checkLoading');
		loadingtime++;
		if (loadingtime == 1)
			_this.showNotification(true, 'default', 'Loading video...');
	}
	
	/* EVENT HANDLERS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	function onReadyHandler(evt) {
		// trace('* * * * * * onReady * * * * * *');
		_initseek = true;
		showOverlay(true);
		
		/*
		if (isMobile())
			trace('* * * * * * IS MOBILE * * * * * *');
		*/
	}
	function onPlayHandler(evt) {
		// trace('-----> onPlay :: oldstate == ' + evt.oldstate + ' :: _initseek == ' + _initseek + ' :: monitorenabled == ' + _this.monitorenabled);
		
		var toggle_btn = $('#video-controls button.toggle-state');
		toggle_btn.addClass('playing').attr('title', 'Pause media');
	
		var audio_btn = $('#video-controls button.toggle-audio');
		var muted = jwplayer().getMute();
		
		if (muted)
			audio_btn.addClass('muted').attr('title', 'Enable audio');
		else
			audio_btn.removeClass('muted').attr('title', 'Mute audio');
		
		_this.monitorenabled = false ? true : true;
		_this.isplaying = true;
		
		// _this.showNotification(false);
		
		showOverlay(false);
	}
	function onPauseHandler(evt) {
		// trace('-----> onPause :: oldstate == ' + evt.oldstate + ' :: ' + _initseek);
	
		var btn = $('#video-controls button.toggle-state');
		btn.removeClass('playing').attr('title', 'Play media');
		
		_this.monitorenabled = true ? false : false;
		_this.showNotification(true, 'default', 'P A U S E D');
		
		showOverlay(true);
	}
	function onSeekHandler(evt) {
		// trace("-------------> onSeek :: " + evt.position + " :: " + evt.offset);
	}
	function onMuteHandler(evt) {
		var btn = $('#video-controls button.toggle-audio');
		var muted = jwplayer().getMute();
		
		if (muted)
			btn.addClass('muted').attr('title', 'Unmute audio');
		else
			btn.removeClass('muted').attr('title', 'Mute audio');
	}
}