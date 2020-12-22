const domain = document.domain;
const _local;

if (domain == 'education.stage.smartpros.com' || domain == 'education.smartpros.com')
	_local = false;
else
	_local = true;
	
const _root = '/coursefiles/FMNF/h5/';

// DATA HANDLING
const DataManager = () => {
	
	this["callGateway"] = (action, aparams, callback) => {
		let gateway;
		let callback;
		
		switch (action) {
			case "get-config-data" :
				if (_local)
					gateway = "data/xml/config.xml";
				else
					gateway = _root + "gateway/get-config-data.asp";
					
				callback = this["parseConfig"];
				break;
			
			case "get-course-data" :
				if (_local)
					gateway = "data/xml/course.xml";
				else
					gateway = _root + "gateway/get-course-data.asp";
					
				callback = this["parseCourse"];
				break;
			
			case "get-subsection-data" :
				if (_local)
					gateway = "data/xml/course.xml";
				else
					gateway = _root + "gateway/get-subsection-data.asp";
					
				callback = this["parseSubsection"];
				break;
			
			case "get-exam-data" :
				if (_local)
					gateway = "data/xml/exam-" + aparams.count + ".xml";
				else
					gateway = _root + "gateway/get-exam-data.asp";
					
				break;
			
			case "set-question-choice" :
				if (_local)
					gateway = "data/gateway.xml";
				else
					gateway = _root + "gateway/set-question-choice.asp";
					
				break;
			
			case "get-exam-grade" :
				if (_local)
					gateway = "data/xml/exam-" + aparams.count + "-grade.xml";
				else
					gateway = _root + "gateway/get-exam-grade.asp";
					
				break;
			
			case "set-bookmark" :
				if (_local)
					gateway = "data/gateway.xml";
				else
					gateway = _root + "gateway/set-bookmark.asp";
					
				break;
			
			case "set-bandwidth" :
				if (_local)
					gateway = "data/gateway.xml";
				else
					gateway = _root + "gateway/set-bandwidth.asp";
					
				break;
			
			case "set-user-stats" :
				if (_local)
					gateway = "data/gateway.xml";
				else
					gateway = _root + "gateway/set-user-stats.asp";
					
				break;
			
			case "ping-server" :
				if (_local)
					gateway = "data/gateway.xml";
				else
					gateway = _root + "gateway/ping-server.asp";
					
				break;
			
			case "send-data" :
				gateway = _root + "data/gateway.xml";
				break;
		}
		
		$.ajax({
			url:  gateway,
			type: 'GET',
			dataType: 'xml',
			success: function (data, textStatus, jqXHR) {
				if (callback) {
					if (_local)
						callback(data, data);
					else
						callback(data, data);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error('AJAX ERROR :: ' + gateway + " :: " + textStatus + " :: " + errorThrown);
				return false;
			},
			data: aparams
		});
	}
	
	this["parseConfig"] = (xml) => {
		loaded["config"] = true;
		
		if (traceeverything)
			trace("PARSE CONFIG :: " + xml);
		
		data.setConfigData(xml);
		
		go('PARSE CONFIG');
	}
	
	this["parseCourse"] = (xml) => {
		loaded["course"] = true;
		
		if (traceeverything)
			trace("PARSE COURSE");
		
		data.setCourseData(xml);
		
		go('PARSE COURSE');
	}
	
	this["parseSubsection"] = (xml, str) => {
		if (traceeverything)
			trace("PARSE SUBSECTION");
		
		let attributes = getNodeAttributes(xml, "data");
		let standalone = (attributes.standalone == "true") ? true : false ;

		if (traceeverything)
			trace("standalone == " + standalone);
		
		let section_xml = getNode(xml, "section");
		let section = new SectionData(section_xml, standalone);
		let subsectiondata = section.subsections[0];
		
		setSlideContent(subsectiondata);
	}
	
	this["parseExam"] = (xml) => {
		loaded["exam"] = true;
		
		if (traceeverything)
			trace("PARSE EXAM");
		
		let examdata = new Object();
		examdata["attributes"] = getNodeAttributes(xml, "questions");
		
		examdata["questions"] = new Array();
		
		$(xml).find("question").each(function(i) {
			let question_xml = this;
			let question = new QuestionData(question_xml);
			examdata["questions"].push(question);

			if (traceeverything)
				trace("---> " + questions[i].title + " :: " + subSections[i].attributes["timestamp"]);
		});
		
		// CREATE AND DISPLAY NEW EXAM
		setExamContent(examdata);
		setLocalExamData(examdata);
	}
	
	this["parseBookmark"] = (xml) => {
		if (traceeverything)
			trace("PARSE BOOKMARK");
		
		// RESPONSE
		let response_xml = getNode(xml, "response");
		let response_attributes = getNodeAttributes(xml, "response_attributes");
		
		data.config.bookmarking["sectionsVisited"] = response_attributes['sectionsStatus'];
		data.config.bookmarking["lastLocation"] = response_attributes['lastLocation'];
	}
	
	this["parseBandwidth"] = (xml) => {
		// RESPONSE
		let response_xml = getNode(xml, "response");
		let response_attributes = getNodeAttributes(xml, "response");
		
		if (traceeverything)
			trace("PARSE STREAM BOOKMARK :: newBookmark == " + response_attributes['newBandwidth']);
		
		data.config.streams['current'] = response_attributes['newBandwidth'];
	}
}