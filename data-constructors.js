// GLOBAL DATA CONSTRUCTOR
const Data = () => {
	const _this = this;
	
	this['valid'];
	this['user'];
	this['courseid'];
	this['config'];
	this['course'];
	this['exams'] = new Object();
	this['current'] = new CurrentData();
	
	this.setUserData = function(vid) {
		this['user'] = new UserData(vid);
	}
	
	this.setConfigData = function(xml) {
		this['config'] = new ConfigData(xml);
	}
	
	this.setCourseData = function(xml) {
		this['course'] = new CourseData(xml);
	}
	
	this.getSectionData = function(sid) {
		// DO SOMETHING
	}
	
	this.getSubsectionData = function(ssid) {
		return this.course.subsections[ssid]
	}
	
	this.updateSubsection = function(data) {
		let ssid = data.attributes['count'];
		let toupdate = this.course.subsections[ssid];
		
		toupdate.content = data.content;
		
		// trace('* * * UPDATE SUBSECTION --> ' + ssid + ' :: ' + toupdate.title + ' * * *');
	}
}

const ConfigData = xml => {
	const datavalid = getNodeValue(xml, 'courseType') ? true : false;
	hasdata["config"] = datavalid;
	
	if (datavalid) {
		this['server'] = getNodeAttributes(xml, 'server');
		this['fms'] = getNodeAttributes(xml, 'fms');
		this['colors'] = getNodeAttributes(xml, 'colors');
	
		this['bookmarking'] = getNodeAttributes(xml, 'bookmarking');
		this['bookmarking']['sectionReached'] = this['bookmarking']['sectionReached'] ? (this['bookmarking']['sectionReached'] - 1) : this['bookmarking']['sectionReached'];
		this['bookmarking']['subsectionReached'] = this['bookmarking']['subsectionReached'] ? (this['bookmarking']['subsectionReached'] - 1) : this['bookmarking']['subsectionReached'];
		this['bookmarking']['sectionsVisited'] = this['bookmarking']['sectionsVisited'] ? (this['bookmarking']['sectionsVisited'] - 1) : '';
	
		this['pecpartnerid'] = getNodeValue(xml, 'PECPartnerID');
		this['ownerpecpartnerid'] = getNodeValue(xml, 'ownerPECPartnerID');
		this['cpecatalogid'] = getNodeValue(xml, 'CPECatalogID');
	
		this['coursetype'] = getNodeValue(xml, 'courseType');	// FLV or TXT
		this['testtype'] = getNodeValue(xml, 'testType');		// restricted or full
		this['menutype'] = getNodeValue(xml, 'menuType');		// restricted or full
		this['logo'] = getNodeValue(xml, 'logoPath');
		this['expertemail'] = getNodeValue(xml, 'expertEmail');
		this['techsupportemail'] = getNodeValue(xml, 'techSupportEmail');
		this['techsupportphone'] = getNodeValue(xml, 'techSupportPhone');
		this['deliveryplatform'] = getNodeValue(xml, 'deliveryPlatform') ? getNodeValue(xml, 'deliveryPlatform') : "SmartPros eLP";
		
		this['lockedout'] = (getNodeValue(xml, 'lockedOut') == '1') ? true : false;
		this['lockedoutreason'] = urlDecode(getNodeValue(xml, 'lockedOutReason'));
		
		this['streams'] = new Object();
		this['streams']['available'] = getNodeValue(xml, 'allowableBandwidth').split('');
		this['streams']['current'] = getNodeValue(xml, 'courseBandwidth');
		
		this['finalexampassed'];
	}
}

// COURSE DATA CONSTRUCTOR
const CourseData = xml => {
	const datavalid = getNode(xml, "details") ? true : false;
	hasdata["course"] = datavalid;
	
	if (datavalid) {
		// DETAILS
		const details_xml = getNode(xml, "details");
		this["title"] = getNodeValue(details_xml, "title");
		this["media"] = getNodeAttributes(details_xml, "media");
		
		// SECTIONS
		const sections_xml = getNode(xml, "sections");
		const _sections = new Array();
		const _subsections = new Array();
	
		$(sections_xml).find("section").each(function() {
			let section_xml = this;
			let section = new SectionData(section_xml);
		
			if (traceeverything)
				trace('---------> AFTER SECTION :: ' + section['title']);
		
			_sections.push(section);
			_subsections = _subsections.concat(section['subsections']);
		});
	
		this['sections'] = _sections;
		this['subsections'] = _subsections;
	
		// COURSE MATERIALS
		const materials_xml = getNode(xml, "materials");
		const _materials = new Array();
	
		$(materials_xml).find("material").each(function() {
			let material_xml = this;
			let material = new MaterialData(material_xml);
			_materials.push(material);
		});
	
		this["materials"] = _materials;
	}
}

// SECTION DATA CONSTRUCTOR
const SectionData = (xml, standalone) => {
	// trace("SECTION == " + XMLToString(xml));
	this["title"] = cleanString($(xml).attr("title"));
	
	if (traceeverything)
		trace("NEW SECTION :: " + this["title"]);
	
	this['subsections'] = new Array();
	
	const subSections = new Array();
	
	$(xml).find("subsection").each(function(i) {
		let subsection_xml = this;
		let subsection = new SubsectionData(subsection_xml);
		subSections.push(subsection);
		// trace("---> " + subSections[i].title + " :: " + subSections[i].attributes["timestamp"]);
	});
	
	this["subsections"] = subSections;
}

// SUBSECTION DATA CONSTRUCTOR
const SubsectionData = xml => {
	// trace("NEW SUBSECTION");
	this["attributes"] = getNodeAttributes(xml);
	this["title"] = cleanString(getNodeValue(xml, "title"));
	this["content"] = cleanString(getNodeValue(xml, "content"));
	this["transcript"] = cleanString(getNodeValue(xml, "transcript"));
	this["testleadertext"] = cleanString(getNodeValue(xml, "testleadertext"));
	this["testconfirmationresponse"] = cleanString(getNodeValue(xml, "testconfirmationresponse"));
	this["testfailureresponse"] = cleanString(getNodeValue(xml, "testfailureresponse"));

	// ADJUST BASED ON SCORM VARIABLES
	if (this['attributes']['type'] == 'TFE' && isScorm()) {
		const completion_status = scormmanager.getStatus();
		trace( 'completion_status == ' + completion_status );
		if (completion_status == 'passed' || completion_status == 'completed') {
			this['attributes']['type'] = 'TXT';
			this['attributes']['fontstyle'] = 'slideFont';
			this['content'] = '<span class="textReg">You have previously passed this course.</span>';
		}
	}
	
	if (traceeverything)
		trace("NEW SUBSECTION :: " + this["title"]);
}

const UserData = vid => {
	this["valid"] = vid;
}

const CurrentData = () => {
	this['count'];
	this['section'];
	this['subsection'];
	this['question'];
	this['mode'];
}

// PARAMS CONSTRUCTOR
const ParamsData = () => {
	this['courseid'];
	this['valid'];
	this['displaylanguage'];
	this['action'];
	this['currentLocation'];
	this['courseTime'];
	this['version'];
	
	// COURSE ID
	this.setCourseID = function(cid) {
		this['courseid'] = cid;
	}
	this.getCourseID = function() {
		return this['courseid'];
	}
	
	// VALID
	this.setValid = function(vid) {
		this['valid'] = vid;
	}
	this.getValid = function() {
		return this['valid'];
	}
	
	// DISPLAY LANGUAGE
	this.setDisplayLanguage = function(lang) {
		this['displaylanguage'] = cid;
	}
	this.gettDisplayLanguage = function() {
		return this['displaylanguage'];
	}
	
	// VERSION
	this.setVersion = function(ver) {
		this['version'] = ver;
	}
	this.getVersion = function() {
		return this['version'];
	}
}

// QUESTION DATA CONSTRUCTOR
const QuestionData = xml => {
	this["attributes"] = getNodeAttributes(xml);
	this["query"] = cleanString(getNodeValue(xml, "query"));
	this["questiongraphic"] = cleanString(getNodeValue(xml, "questiongraphic"));
	this["answergraphic"] = cleanString(getNodeValue(xml, "answergraphic"));
	this["options"] = new Array();
	
	// trace("\nNEW QUESTION :: " + this["query"]);
	
	const questionoptions = new Array();
	
	$(xml).find("option").each(function(i) {
		let option_xml = this;
		let option = new OptionData(option_xml);
		questionoptions.push(option);
		// trace("---> " + subSections[i].title + " :: " + subSections[i].attributes["timestamp"]);
	});
	
	this["options"] = questionoptions;
}

// QUESTION OPTION DATA CONSTRUCTOR
const OptionData = xml => {
	this["attributes"] = getNodeAttributes(xml);
	this["text"] = cleanString(getNodeValue(xml, "text"));
	this["response"] = cleanString(getNodeValue(xml, "response"));
	
	// trace("---> NEW OPTION :: " + this["text"]);
}

// MATERIAL DATA CONSTRUCTOR
const MaterialData = xml => {
	let attributes = getNodeAttributes(xml);
	this["type"] =attributes["type"];
	this["class"] = attributes["class"];
	this["label"] = attributes["label"];

	if (isStandalone())
		this["link"] = "data/materials/" + attributes["link"];
	else
		this["link"] = "../courseMaterials/" + data.courseid + "/" + attributes["link"];
	
	// trace("---> NEW MATERIAL :: " + this["label"] + " :: " + this["link"]);
}