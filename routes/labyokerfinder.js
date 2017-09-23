var pg = require("pg");
var moment = require('moment-timezone');
var MailOptions = require('../config/emailClient').MailOptions;
var MailOptionsWithCC = require('../config/emailClient').MailOptionsWithCC;
var config = require("../config/database");
var conString = process.env.DATABASE_URL || "pg://" + config.username + ":"
		+ config.password + "@" + config.host + ":" + config.port + "/"
		+ config.database;
console.log("connection db could be: " + process.env.DATABASE_URL);
console.log("connection db is: " + conString);
//pg.defaults.ssl = true;
var client = new pg.Client(conString);
client.connect();
var crypt = require('bcrypt-nodejs');
var accounting = require('./accounting');

LabYokeFinder = function(today) {
	this.now = today
};

LabYokeGlobal = function(param) {
	this.param = param;
};

LabYokeAgents = function(email,mylab,labs,dept,labadmin) {
	this.email = email;
	this.mylab = mylab;
	this.labs = labs;
	this.dept = dept;
	this.labadmin = labadmin;
};

LabyokerLab = function(lab) {
	this.lab = lab;
};

LabyokerLabs = function(lab,adminemail) {
	this.adminemail = adminemail;
	this.lab = lab;
};

LabYokerChangeShare = function(table, agent, vendor,catalognumber,email,requestor,checked,datenow,date,lab,res,userlang) {
	this.agent = agent;
	this.vendor = vendor;
	this.catalognumber = catalognumber;
	this.checked = checked;
	this.table = table;
	this.email = email;
	this.date = date;
	this.datenow = datenow;
	this.requestor = requestor;
	this.lab = lab;
	this.res = res;
	this.userlang = userlang;
};

LabyokerUserDetails = function(column, value, email,curname,cursurname,res) {
	this.column = column;
	this.value = value;
	this.email = email;
	this.curname = curname;
	this.cursurname = cursurname;
	this.res = res;
}

LabYokeReporterOrders = function(datefrom, dateto, lab, labs, mylab, res) {
	this.datefrom = datefrom;
	this.dateto = dateto;
	this.lab = lab;
	this.labs = labs;
	this.mylab = mylab;
	this.res = res;
	//this.category = category;
};

LabYokeReporterShares = function(datefrom, dateto, mylab, labs, res) {
	this.datefrom = datefrom;
	this.dateto = dateto;
	this.mylab = mylab;
	this.labs = labs;
	this.res = res;
	//this.category = category;
};

LabYokeReporterSavings = function(datefrom,dateto,agent,vendor,catalognumber,lab, mylab,labs,res) {
	this.datefrom = datefrom;
	this.dateto = dateto;
	this.vendor = vendor;
	this.lab = lab;
	this.agent = agent;
	this.catalognumber = catalognumber;
	this.mylab = mylab;
	this.labs = labs;
	this.res = res;
};

LabyokerInit = function(email, mylab) {
	this.email = email;
	this.mylab = mylab;
};

LabYokeSearch = function(searchText, email, searchType) {
	this.searchText = searchText;
	this.email = email;
	this.searchType = searchType;
};

LabYokeUploader = function(jsonResults) {
	this.jsonResults = jsonResults;
};

LabyokerConfirm = function(registerid) {
	this.registerid = registerid;
};

LabYokerOrder = function(lab,agent,vendor,catalognumber,email,location,sendemail,quantity,mylab,res,userlang,ownerlang,labadmin) {
	this.agent = agent;
	this.vendor = vendor;
	this.catalognumber = catalognumber;
	this.email = email;
	this.location = location;
	this.sendemail = sendemail;
	this.lab = lab;
	this.quantity = quantity;
	this.mylab = mylab;
	this.res = res;
	this.userlang = userlang;
	this.ownerlang = ownerlang;
	this.labadmin = labadmin;
};

LabyokerTeam = function(lab) {
	this.lab = lab;
};

LabYokerGetOrder = function(sendemail,lab,labs) {
	this.sendemail = sendemail;
	//this.lab = lab;
	this.lab = lab;
	this.labs = labs;
};

LabyokerRegister = function(user, password,lab,firstname,lastname,email,tel,res,userlang) {
	this.username = user;
	this.password = password;
	this.lab = lab;
	this.firstname = firstname;
	this.lastname = lastname;
	this.email = email;
	this.tel = tel;
	this.res = res;
	this.userlang = userlang;
};

LabyokerPasswordChange = function(hash, password) {
	this.hash = hash;
	this.password = password;

};

LabYokeTest = function(resp) {
	this.resp = resp;
};

LabYokeUploader.prototype.upload = function(callback) {
	var results = this.jsonResults;
	var jsonnum = results;
	console.log("location: " + location);
	var values = "";
	var checkvalues = "";
	var now = moment(new Date).tz("America/New_York").format('MM-DD-YYYY');

	if(results != null){
		for(var prop in results){
			var agent = results[prop].name_of_reagent;
			var vendor = results[prop].vendor;
			var catalognumber = results[prop].catalog_number;
			var location = results[prop].location;
			var email = results[prop].user;
			//var category = results[prop].category;
			var price = 100;//results[prop].price;

			checkvalues = checkvalues + "(agent='" + agent + "' and vendor= '" + vendor + "' and catalognumber= '" + catalognumber + "' and email='" + email + "' )";
			if(prop < (results.length-1)){
				checkvalues = checkvalues + " or ";
			}

			values = values + "('" + agent + "', '" + vendor + "', '" + catalognumber + "', '" + location + "', '" + email + "','" + now + "','new',0,1,null," + price + ")";
			if(prop < (results.length-1)){
				values = values + ",";
			}
		}
		console.log("checkvalues: " + checkvalues);
		console.log("values: " + values);
	}
	console.log("All checkvalues " + checkvalues);

	if(values!= null){
		var query3 = client.query("Select * from vm2016_agentsshare where " + checkvalues);

		query3.on("row", function(row, result3) {
			result3.addRow(row);
		});
		query3.on("end", function(result3) {
			var rows = result3.rows
			var l = rows.length;
			console.log("results: " + l);
			var existingReagents = "";
			if (result3 != null && rows.length > 0) {
				for(var i in rows){
					if(i == 0){
						existingReagents = "(";
					}
					existingReagents = existingReagents + rows[i].rid;
					if(i < (rows.length -1)){
						existingReagents = existingReagents + ",";
					}
					if(i == (rows.length -1)){
						existingReagents = existingReagents + ")";
					}
				}
				console.log("existingReagents: " + existingReagents);
				//callback(null, "successfulUpload");

				var query5 = client.query("DELETE FROM vm2016_agentsshare WHERE rid in " + existingReagents);

				query5.on("row", function(row, result5) {
					result5.addRow(row);
				});
				query5.on("end", function(result5) {
					var query2 = client.query("INSERT INTO vm2016_agentsshare VALUES " + values);
					query2.on("row", function(row, result2) {
						result2.addRow(row);
					});
					query2.on("end", function(result2) {
						console.log("successfulUpload");
						callback(null, "successfulUpload");
					});
				});
				
			} else {
					var query2 = client.query("INSERT INTO vm2016_agentsshare VALUES " + values);

					query2.on("row", function(row, result2) {
						result2.addRow(row);
					});
					query2.on("end", function(result2) {
						console.log("successfulUpload in database");
						callback(null, "successfulUpload");
					});
				//callback(null, "successfulUpload");
			}
		});
	} else {
		//Change Password already sent
		console.log("cannotUploadMissingData.");
		callback(null, "cannotUploadMissingData");
	}	
};

LabYokeReporterSavings.prototype.dataMoney = function(callback) {
	var results;
	var mylab = this.mylab.replace(/ /g,"").toLowerCase();
	var datefrom = this.datefrom;
	var dateto = this.dateto;
	var vendor = this.vendor;
	var lab = this.lab;
	var labs = this.labs;
	var agent = this.agent;
	var catalognumber = this.catalognumber;
	var selected = "a.agent, count(a.agent) as counting, b.lab, a.price";
	var where = "a.agent = b.agent and a.catalognumber = b.catalognumber ";
	var groupby = "a.agent, b.lab, a.price";
	console.log("report on savings- datefrom: " + datefrom);
	console.log("report on savings- dateto: " + dateto);
	var query;

var labyokerLab = new LabyokerLab(this.mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.date";
		if(where.length>0)
			where +=" and ";
		where += "b.date between '" + datefrom + "' and '" + dateto + "'";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.date";
	} else {
		datefrom = "all";
	}

	if(lab != null && lab !=undefined && lab !="all"){
		//if(where.length>0)
		//	where +=" and ";
		//where += "b.lab = '" + lab + "'";
	} 

	if(agent != null && agent !=undefined && agent !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.agent";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.agent";
	} 
	if(vendor != null && vendor !=undefined && vendor !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.vendor";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.vendor";
	}
	if(catalognumber != null && catalognumber !=undefined && catalognumber !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.catalognumber";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.catalognumber";
	}

//	var qrstr = "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby + " order by a.agent asc";
//	console.log("qrstr = " + qrstr);
//	query = client.query(qrstr);

	var labsstr = "";
	var i = 0;
	var a = "a";
	var requestor = "";
	var date = "";
	var select = "";

	if(lab != null && lab !=undefined && lab =="all"){
console.log("datamoney - all");
	where = where + " and (";
console.log("datamoney - labsindept: " + labsindept.length);
	for(var prop in labsindept){
		where = where + " b.lab = '" + labsindept[prop].labname + "' or ";
	}
	where = where.replace(/or\s*$/, "");
	where = where + ")";

console.log("datamoney - labsindept: " + labs.length);
	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders b ";
		select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+labsstr+" where " + where + " group by " + groupby + " UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
} else {
	console.log("datamoney - not all ");
	select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby;
}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	

	console.log("get orders labsstr: " + labsstr);
	console.log("full query: " + select);

	//var qrstr = "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby + " order by a.agent asc";
	var qrstr = select + " order by agent asc";
	console.log("qrstr = " + qrstr);
	query = client.query(qrstr);

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);
		var savings = 0;
		if(results != null && results != ""){
			console.log("data money: " + results);
			for(var prop in results){
				savings += results[prop].counting * results[prop].price;
			}
		}
		callback(null, savings)
	});
	});
};

LabYokeReporterSavings.prototype.reportMoney = function(callback) {
	var results;
	var resultsbundled = [];
	var dataonly = [];
	var headeronly = [];
	var datefrom = this.datefrom;
	var dateto = this.dateto;
	var vendor = this.vendor;
	var lab = this.lab;
	var i18n = this.res;
	var agent = this.agent;
	var catalognumber = this.catalognumber;
	var mylab = this.mylab.replace(/ /g,"").toLowerCase();
	var labs = this.labs;
	//var selected = "a.agent, sum(a.agent) as counting, b.lab, a.price";
		var selected = "a.agent, sum(a.price) as counting, b.lab";

	var where = "a.agent = b.agent and a.catalognumber = b.catalognumber ";
	var groupby = "a.agent, b.lab";
	var params = "";
	var columns ="<td>" + i18n.__("index.reportsMoney.param1") + "</td>";
	headeronly.push(i18n.__("index.reportsMoney.param1"));
	var html = "<div><span id='reporttitle' style='font-weight:bold;font-size:36pt;'>" + i18n.__("index.reportsMoney.param2") + ".</span></div><br/><div style='font-size:11pt;text-align:left'>"
				+ "" + "";
	console.log("report on savings- datefrom: " + datefrom);
	console.log("report on savings- dateto: " + dateto);
	var query;

var labyokerLab = new LabyokerLab(this.mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
console.log("report on savings- dateto: " + labsindept);

	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		if(params == ""){
			params += "<div style='font-weight:bold'>" + i18n.__("index.reportsMoney.param3") + "</div>";
		}
		params += "<div><span style='font-weight:bold'>" + i18n.__("index.reportsMoney.param4") + ": </span><span>" + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY')  + "</span></div>";
		params += "<div><span style='font-weight:bold'>" + i18n.__("index.reportsMoney.param5") + ": </span><span>" + moment(dateto).tz("America/New_York").format('MM-DD-YYYY')  + "</span></div>";
		if(selected.length>0)
			selected +=", ";
		selected += "b.date";
		if(where.length>0)
			where +=" and ";
		where += "b.date between '" + datefrom + "' and '" + dateto + "'";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.date";
		html += "<p>" + i18n.__("index.reportsMoney.param6") + " " + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsMoney.param7") + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + "</p></div>"
	} else {
		datefrom = "all";
		html += "<p>" + i18n.__("index.reportsMoney.param8") + ":</p></div>"
	}

	if(lab != null && lab !=undefined && lab !="all"){
		if(params == ""){
			params += "<div style='font-weight:bold'>" + i18n.__("index.reportsMoney.param3") + "</div>";
		}
		params += "<div><span style='font-weight:bold'>" + i18n.__("index.reportsMoney.param1") + ": </span><span>" + lab + "</span></div>";
		//if(where.length>0)
		//	where +=" and ";
		//where += "b.lab = '" + lab + "'";
	} 

	if(agent != null && agent !=undefined && agent !=""){
		/*if(selected.length>0)
			selected +=", ";
		selected += "b.agent";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.agent";*/
		headeronly.push(i18n.__("index.reportsMoney.param9"));
		columns+="<td>" + i18n.__("index.reportsMoney.param9") + "</td>";
	} 
	if(vendor != null && vendor !=undefined && vendor !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.vendor";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.vendor";
		headeronly.push(i18n.__("index.reportsMoney.param10"));
		columns+="<td>" + i18n.__("index.reportsMoney.param10") + "</td>";
	}
	if(catalognumber != null && catalognumber !=undefined && catalognumber !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "b.catalognumber";
		if(groupby.length>0)
			groupby +=" , ";
		groupby += "b.catalognumber";
		headeronly.push(i18n.__("index.reportsMoney.param11"));
		columns+="<td>" + i18n.__("index.reportsMoney.param11") + "</td>";
	}
	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		headeronly.push(i18n.__("index.reportsMoney.param12"));
		columns+="<td>" + i18n.__("index.reportsMoney.param12") + "</td>";
	}



	var labsstr = "";
	var i = 0;
	var a = "a";
	var requestor = "";
	var date = "";
	var select = "";

	if(lab != null && lab !=undefined && lab =="all"){

	where = where + " and (";
	
	for(var prop in labsindept){
		where = where + " b.lab = '" + labsindept[prop].labname + "' or ";
	}
	where = where.replace(/or\s*$/, "");
	where = where + ")";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders b ";
		select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+labsstr+" where " + where + " group by " + groupby + " UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
} else {
	//select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby;


	where = where + " and ";
		console.log("init select query for " + lab + ": " + select);
		where = where + " b.lab = '" + lab + "' ";
	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders b ";
		select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+labsstr+" where " + where + " group by " + groupby + " UNION ";
		i++;
		console.log("select query for " + lab + ": " + select);
	}
	select = select.replace(/UNION\s*$/, "");

//select = select + "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby;

}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	

	console.log("get orders labsstr: " + labsstr);
	console.log("full query: " + select);


	/*if(selected.length>0)
		selected +=", ";
	selected +="count(a.category)";*/
	headeronly.push(i18n.__("index.reportsMoney.param13"));
	dataonly.push(headeronly);
	columns+="<td>" + i18n.__("index.reportsMoney.param13") + "</td>";
	//var qrstr = "SELECT " + selected + " from vm2016_agentsshare a, "+mylab+"_orders b where " + where + " group by " + groupby + " order by a.agent asc";
	var qrstr = select + " order by agent asc";
	console.log("qrstr = " + qrstr);
	query = client.query(qrstr);

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);

		html += params;
		var savings = 0;
		var isempty = true;
		if(results != null && results != ""){
		html +="<table style='margin-top:25px;float:left'><tbody><tr style='color: white;background-color: #3d9dcb;font-size:12px'>" + columns + "</tr>"
		
			for(var prop in results){
				var rowonly = [];
				isempty = false;
				rowonly.push(results[prop].lab);
				html += "<tr><td style='font-size: 12px;'>" + results[prop].lab + "</td>";

				if(agent != null && agent !=undefined && agent !=""){
					rowonly.push(results[prop].agent);
				html += "<td style='font-size: 12px;'>" + results[prop].agent + "</td>";
				}
				if(vendor != null && vendor !=undefined && vendor !=""){
					rowonly.push(results[prop].vendor);
				html += "<td style='font-size: 12px;'>" + results[prop].vendor + "</td>";
				}
				if(catalognumber != null && catalognumber !=undefined && catalognumber !=""){
				rowonly.push(results[prop].catalognumber);
				html += "<td style='font-size: 12px;'>" + results[prop].catalognumber + "</td>";
				}
				if(datefrom != null && datefrom !=undefined && datefrom !="" && dateto != null && dateto !=undefined && dateto !="" ){
				rowonly.push(moment(results[prop].date).tz("America/New_York").format('MM-DD-YYYY'));
				html += "<td style='font-size: 12px;'>" + moment(results[prop].date).tz("America/New_York").format('MM-DD-YYYY') + "</td>";
				}
				var total = results[prop].counting /* * results[prop].price*/;
				
				console.log("counting is: " + total);
				savings += parseInt(total);
				html += "<td style='font-size: 12px;'>" + accounting.formatMoney(total, { symbol: "",  format: "%v %s", precision : 0 }) /*accounting.formatMoney(total)*/ + "</td>";
				rowonly.push(accounting.formatMoney(total, { symbol: "",  format: "%v %s", precision : 0 }));
				dataonly.push(rowonly);
				html += " </tr>";
				console.log("savings is: " + savings);
		
			}
			html += "</tbody></table><div>" + i18n.__("index.reportsMoney.param14") + "<span style='font-size:30pt'>" + accounting.formatMoney(savings, { symbol: "",  format: "%v %s", precision : 0 }) /*accounting.formatMoney(savings)*/ + "</span></div><br/><p style='margin-top:50px'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>";
			console.log("html money: " + html);

		}
		if(!isempty){
			resultsbundled.push(html);
			resultsbundled.push(dataonly);
			callback(null, resultsbundled);
		} else {
			callback(null, results);
		}
	});
});
};

LabYokeReporterSavings.prototype.reportInsuff = function(callback) {
	var results;
	var resultsbundled = [];
	var dataonly = [];
	var headeronly = [];
	var mylab = this.mylab.replace(/ /g,"").toLowerCase();
	var labs = this.labs;
	var datefrom = this.datefrom;
	var dateto = this.dateto;
	var vendor = this.vendor;
	var lab = this.lab;
	var agent = this.agent;
	var catalognumber = this.catalognumber;
	var i18n = this.res;
	var selected = "a.agent, b.lab";
	var where = "a.email = b.email and a.insufficient = 0";
	//var groupby = "a.category, b.lab, a.price";
	var params = "";
	var columns ="<td>" + i18n.__("index.reportsMoney.param9") + "</td><td>" + i18n.__("reports.insuff.labselect") + "</td>";
	headeronly.push(i18n.__("index.reportsMoney.param9"));
	headeronly.push(i18n.__("reports.insuff.labselect"));
	var html = "<div><span id='reporttitle' style='font-weight:bold;font-size:36pt;'>" + i18n.__("index.reportsInsuff.param1") + ".</span></div><br/><div style='font-size:11pt;text-align:left'>"
				+ "" + "";
	console.log("report on savings- datefrom: " + datefrom);
	console.log("report on savings- dateto: " + dateto);
	var query;

var labyokerLab = new LabyokerLab(this.mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
console.log("report on insuff: " + labsindept);
	if(lab != null && lab !=undefined && lab !="all"){
		if(params == ""){
			params += "<div style='font-weight:bold'>" + i18n.__("index.reportsMoney.param3") + "</div>";
		}
		params += "<div><span style='font-weight:bold'>" + i18n.__("index.reportsMoney.param1") + ": </span><span>" + lab + "</span></div>";
		if(where.length>0)
			where += i18n.__("index.reportsMoney.param7") ;
		where += "b.lab = '" + lab + "'";
	} 

	if(agent != null && agent !=undefined && agent !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "a.agent";
		headeronly.push(i18n.__("index.reportsMoney.param9"));
		columns+="<td>" + i18n.__("index.reportsMoney.param9") + "</td>";
	} 
	if(vendor != null && vendor !=undefined && vendor !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "a.vendor";
		headeronly.push(i18n.__("index.reportsMoney.param10"));
		columns+="<td>" + i18n.__("index.reportsMoney.param10") + "</td>";
	}
	if(catalognumber != null && catalognumber !=undefined && catalognumber !=""){
		if(selected.length>0)
			selected +=", ";
		selected += "a.catalognumber";
		headeronly.push(i18n.__("index.reportsMoney.param11"));
		columns+="<td>" + i18n.__("index.reportsMoney.param11") + "</td>";
	}

	/*if(selected.length>0)
		selected +=", ";
	selected +="count(a.category)";*/
	headeronly.push(i18n.__("index.reportsMoney.param12"));
	columns+="<td>" + i18n.__("index.reportsMoney.param12") + "</td>";
	console.log("headeronly: "  + headeronly);
	dataonly.push(headeronly);
	console.log("dataonly0: "  + dataonly);
	


if(lab != null && lab !=undefined && lab =="all"){
	where = where + " and (";
	
	for(var prop in labsindept){
		where = where + " b.lab = '" + labsindept[prop].labname + "' or ";
	}
	where = where.replace(/or\s*$/, "");
	where = where + ")";
}


	var qrstr = "SELECT " + selected + " from vm2016_agentsshare a, vm2016_users b where " + where + " order by a.agent asc";
	console.log("qrstr = " + qrstr);
	query = client.query(qrstr);

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);
		html += params;
		var isempty = true;
		if(results != null && results != ""){
		html +="<table style='margin-top:25px;'><tbody><tr style='color:white;background-color:#3d9dcb;font-size:12px'>" + columns + "</tr>"
		
			for(var prop in results){
				var rowonly = [];
				isempty = false;
				rowonly.push(results[prop].agent);
				rowonly.push(results[prop].lab);

				html += "<tr>" + "<td style='font-size: 12px;'>" + results[prop].agent + "</td>" + "<td style='font-size: 12px;'>" + results[prop].lab + "</td>";

				if(agent != null && agent !=undefined && agent !=""){
				html += "<td style='font-size: 12px;'>" + results[prop].agent + "</td>";
				}
				if(vendor != null && vendor !=undefined && vendor !=""){
					rowonly.push(results[prop].vendor);
				html += "<td style='font-size: 12px;'>" + results[prop].vendor + "</td>";
				}
				if(catalognumber != null && catalognumber !=undefined && catalognumber !=""){
					rowonly.push(results[prop].catalognumber);
				html += "<td style='font-size: 12px;'>" + results[prop].catalognumber + "</td>";
				}
				rowonly.push(moment(results[prop].insuffdate).tz("America/New_York").format('MM-DD-YYYY'));
				html += "<td style='font-size: 12px;'>" + moment(results[prop].insuffdate).tz("America/New_York").format('MM-DD-YYYY')+ "</td>";
				html += " </tr>";
				dataonly.push(rowonly);
				console.log("dataonly1: "  + dataonly);
		
			}
			html += "</tbody></table><br/><p style='margin-top:25px'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>";
			console.log("html insuff: " + html);
			console.log("dataonly1: "  + dataonly);
		}
		if(!isempty){
			resultsbundled.push(html);
			resultsbundled.push(dataonly);
			callback(null, resultsbundled);
		} else {
			callback(null, results)
		}
		
	});
});
};


LabYokeReporterShares.prototype.reportShares = function(callback) {
	var results;
	var resultsbundled = [];
	var dataonly = [];
	var headeronly = [];
	var i18n = this.res;
	var datefrom = this.datefrom;
	var dateto = this.dateto;
	//var category = this.category;
	var params = "";
	var where = "";
	var isempty = true;
	var mylab = this.mylab;
	//var mylab = this.mylab.replace(" ","").toLowerCase();
	console.log("report on something: datefrom: " + datefrom);
	console.log("report on something: dateto: " + dateto);
	//console.log("report on something: agent: " + agent);
	var query;
	var labyokerLab = new LabyokerLab(mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
console.log("report on shares: " + labsindept);
console.log("report on shares my lab: " + mylab);
	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		if(params == ""){
			params += i18n.__("index.reportsShares.params");//"<div style='font-weight:bold'>Parameters</div>";
		}
		params += i18n.__("index.reportsShares.params1", {datefrom: datefrom}); //"<div><span style='font-weight:bold'>Date From: </span><span>" + datefrom + "</span></div>";
		params += i18n.__("index.reportsShares.params2", {dateto: dateto}); //"<div><span style='font-weight:bold'>Date To: </span><span>" + dateto + "</span></div>";
		if(where == "")
			where =" where ";
		where += "date between '" + datefrom + "' and '" + dateto + "'";
	} else {
		datefrom = "all";
	}
	/*if(category != null && category !=undefined && category !="all"){
		if(params == ""){
			params += "<div style='font-weight:bold'>Parameters</div>";
		}
		params += "<div><span style='font-weight:bold'>Category: </span><span>" + category + "</span></div>";
		if(where == ""){
			where =" where ";
		}
		if(where.trim() != "where")
			where +=" and ";
		where += " lower(category) like '%" + category.toLowerCase() + "%'";
	} */
	console.log("where: " +  where);
	if(where == "")
		where = " where ";
	else
		where = where + " and ";
	where = where + " b.email = a.email and (";
	console.log("where0: " +  where);
	for(var prop in labsindept){
		where = where + " b.lab = '" + labsindept[prop].labname + "' or ";
	}
	
	console.log("where1: " +  where);
	where = where.replace(/or\s*$/, "");
	where = where + ")";

	console.log("where2: " +  where);

	var qryStr = "SELECT * FROM vm2016_agentsshare a, vm2016_users b" + where + " order by a.date desc";
	console.log("query report shares: " + qryStr);
	query = client.query(qryStr);

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);
		var html = "<div style='margin-left:50px;margin-bottom:25px;'>";

		if(results != null && results != ""){
		html += i18n.__("index.reportsShares.html1", {dateto: dateto}); //"<div><span style='font-weight:bold;font-size:36pt;margin-bottom:20px;float:left'>Inventory.</span></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px; width:50%;float:left\">";

		if(datefrom == 'all'){
			html += i18n.__("index.reportsShares.html2"); //"<p>This report is listing all the inventory uploaded:</p></div>"
		} else {
			html += i18n.__("index.reportsShares.html3") + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsShares.html4") + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsShares.html5");
			//"<p>This report is listing the inventory uploaded between " + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + " and " + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + "</p></div>"
		}
		headeronly.push(i18n.__("index.reportsMoney.param9"));
		headeronly.push(i18n.__("index.reportsMoney.param10"));
		headeronly.push(i18n.__("index.reportsMoney.param11"));
		headeronly.push(i18n.__("index.reportsMoney.param15"));
		headeronly.push(i18n.__("index.reportsMoney.param16"));
		headeronly.push(i18n.__("index.reportsMoney.param12"));
		dataonly.push(headeronly);
		html += params;
		html += i18n.__("index.reportsShares.html6");
		//"<table><tbody><tr style='color: white;background-color: #3d9dcb;'><td style='font-size: 12px;'>Reagent</td><td style='font-size: 12px;'>Vendor</td><td style='font-size: 12px;'>Catalog#</td><td style='font-size: 12px;'>Location</td><td style='font-size: 12px;'>User</td><td>Date</td></tr>"
		
			for(var prop in results){
				var rowonly = [];
				isempty = false;
				var agent = results[prop].agent;
				var vendor = results[prop].vendor;
				var catalognumber = results[prop].catalognumber;
				var location = results[prop].location;
				var email = results[prop].email;
				//var category = results[prop].category;
				var date = results[prop].date;
				rowonly.push(agent);
				rowonly.push(vendor);
				rowonly.push(catalognumber);
				rowonly.push(location);
				rowonly.push(email);
				rowonly.push(moment(date).tz("America/New_York").format('MM-DD-YYYY'));
				html += " <tr><td style='font-size: 12px;'>" + agent + "</td>";
				html += " <td style='font-size: 12px;'>" + vendor + "</td>";
				html += " <td style='font-size: 12px;'>" + catalognumber + "</td>";
				html += " <td style='font-size: 12px;'>" + location + "</td>";
				html += " <td style='font-size: 12px;'>" + email + "</td>";
				//html += " <td style='font-size: 12px;'>" + category + "</td>";
				html += " <td style='font-size: 12px;'>" + moment(date).tz("America/New_York").format('MM-DD-YYYY') + "</td></tr>";
				dataonly.push(rowonly);
			}
			html += "</tbody></table><p style='margin-top: 25px;'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>";
			//html += "</tbody></table><p><i><b>The LabYoke Team.</b></i></p><img style='width: 141px; margin: 0 20px;float:left' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/>";
		}
		if(!isempty){
			resultsbundled.push(html+ "</div>");
			resultsbundled.push(dataonly);
			callback(null, resultsbundled );
		} else {
			callback(null, results);
		}
	});
});
};


LabYokeReporterShares.prototype.reportSharesIntro = function(callback) {
	var results;
	var i18n = this.res;
	var resultsbundled = [];
	var dataonly = [];
	var headeronly = [];
	//var datefrom = this.datefrom;
	//var dateto = this.dateto;
	//var category = this.category;
	var params = "";
	var where = "";
	var isempty = true;
	var mylab = this.mylab;
	var dateto = moment(new Date).tz("America/New_York").format('MM-DD-YYYY');
	var datefrom = moment(new Date).weekday(-7).format('MM-DD-YYYY');
	console.log('prev start', moment(new Date).weekday(-7).format('MM-DD-YYYY'));
	console.log("now: " + dateto);

	//var mylab = this.mylab.replace(" ","").toLowerCase();
	console.log("report on something: datefrom: " + datefrom);
	console.log("report on something: dateto: " + dateto);
	//console.log("report on something: agent: " + agent);
	var query;
	var labyokerLab = new LabyokerLab(mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
console.log("report on shares: " + labsindept);
console.log("report on shares my lab: " + mylab);
	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		if(params == ""){
			params += i18n.__("index.reportsShares.params");//"<div style='font-weight:bold'>Parameters</div>";
		}
		params += i18n.__("index.reportsShares.params1", {datefrom: datefrom}); //"<div><span style='font-weight:bold'>Date From: </span><span>" + datefrom + "</span></div>";
		params += i18n.__("index.reportsShares.params2", {dateto: dateto}); //"<div><span style='font-weight:bold'>Date To: </span><span>" + dateto + "</span></div>";
		if(where == "")
			where =" where ";
		where += "date between '" + datefrom + "' and '" + dateto + "'";
	} else {
		datefrom = "all";
	}
	/*if(category != null && category !=undefined && category !="all"){
		if(params == ""){
			params += "<div style='font-weight:bold'>Parameters</div>";
		}
		params += "<div><span style='font-weight:bold'>Category: </span><span>" + category + "</span></div>";
		if(where == ""){
			where =" where ";
		}
		if(where.trim() != "where")
			where +=" and ";
		where += " lower(category) like '%" + category.toLowerCase() + "%'";
	} */
	console.log("where: " +  where);
	if(where == "")
		where = " where ";
	else
		where = where + " and ";
	where = where + " b.email = a.email and (";
	console.log("where0: " +  where);
	for(var prop in labsindept){
		where = where + " b.lab = '" + labsindept[prop].labname + "' or ";
	}
	
	console.log("where1: " +  where);
	where = where.replace(/or\s*$/, "");
	where = where + ")";

	console.log("where2: " +  where);

	var qryStr = "SELECT * FROM vm2016_agentsshare a, vm2016_users b" + where + " order by a.date desc";
	console.log("query report shares: " + qryStr);
	query = client.query(qryStr);

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);
		var html = "<div style='margin-left:50px;margin-bottom:25px;'>";

		html += i18n.__("index.reportsShares.html1", {dateto: dateto}); //"<div><span style='font-weight:bold;font-size:36pt;margin-bottom:20px;float:left'>Inventory.</span></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px; width:50%;float:left\">";

		if(datefrom == 'all'){
			html += i18n.__("index.reportsShares.html2"); //"<p>This report is listing all the inventory uploaded:</p></div>"
		} else {
			html += i18n.__("index.reportsShares.html3") + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsShares.html4") + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsShares.html5");
			//"<p>This report is listing the inventory uploaded between " + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + " and " + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + "</p></div>"
		}
		html += params;
		
		if(results != null && results != ""){
			headeronly.push(i18n.__("index.reportsMoney.param9"));
			headeronly.push(i18n.__("index.reportsMoney.param10"));
			headeronly.push(i18n.__("index.reportsMoney.param11"));
			headeronly.push(i18n.__("index.reportsMoney.param15"));
			headeronly.push(i18n.__("index.reportsMoney.param16"));
			headeronly.push(i18n.__("index.reportsMoney.param12"));
			dataonly.push(headeronly);
		//"<table><tbody><tr style='color: white;background-color: #3d9dcb;'><td style='font-size: 12px;'>Reagent</td><td style='font-size: 12px;'>Vendor</td><td style='font-size: 12px;'>Catalog#</td><td style='font-size: 12px;'>Location</td><td style='font-size: 12px;'>User</td><td>Date</td></tr>"
			html += i18n.__("index.reportsShares.html6");
			for(var prop in results){
				var rowonly = [];
				isempty = false;
				var agent = results[prop].agent;
				var vendor = results[prop].vendor;
				var catalognumber = results[prop].catalognumber;
				var location = results[prop].location;
				var email = results[prop].email;
				//var category = results[prop].category;
				var date = results[prop].date;

				html += " <tr><td style='font-size: 12px;'>" + agent + "</td>";
				html += " <td style='font-size: 12px;'>" + vendor + "</td>";
				html += " <td style='font-size: 12px;'>" + catalognumber + "</td>";
				html += " <td style='font-size: 12px;'>" + location + "</td>";
				html += " <td style='font-size: 12px;'>" + email + "</td>";
				//html += " <td style='font-size: 12px;'>" + category + "</td>";
				html += " <td style='font-size: 12px;'>" + moment(date).tz("America/New_York").format('MM-DD-YYYY') + "</td></tr>";
				rowonly.push(agent);
				rowonly.push(vendor);
				rowonly.push(catalognumber);
				rowonly.push(location);
				rowonly.push(email);
				rowonly.push(moment(date).tz("America/New_York").format('MM-DD-YYYY'));
				dataonly.push(rowonly);
			}
			html += "</tbody></table><p style='margin-top: 25px;'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>";
			//html += "</tbody></table><p><i><b>The LabYoke Team.</b></i></p><img style='width: 141px; margin: 0 20px;float:left' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/>";
			
		}
		if(!isempty){
			resultsbundled.push(html + "</div>");
			resultsbundled.push(dataonly);
			callback(null, resultsbundled);
		} else {
			callback(null, html + i18n.__("index.reportsShares.nodataIntro") + "<p style='margin-top: 25px;'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>" + "</div>");
		}
	});
});
};



LabYokeReporterOrders.prototype.reportOrders = function(callback) {
	var i18n = this.res;
	var results;
	var resultsbundled = [];
	var dataonly = [];
	var headeronly = [];
	var datefrom = this.datefrom;
	var dateto = this.dateto;
	var lab = this.lab;
	var labs = this.labs;
	var mylab = this.mylab.replace(/ /g,"").toLowerCase();
	//var category = this.category;
	var params = "";
	var where = "";
	var isempty = true;
	console.log("report on something: datefrom: " + datefrom);
	console.log("report on something: dateto: " + dateto);
	console.log("report on something: lab: " + lab);
	//console.log("report on something: category: " + category);
	var query;

	var labyokerLab = new LabyokerLab(this.mylab);
		labyokerLab.getLabsInDept(function(error, labsindept) {
console.log("report on orders: " + labsindept);

	if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		if(params == ""){
			params += i18n.__("index.reportsShares.params"); //"<div style='font-weight:bold'>Parameters</div>";
		}
		params += i18n.__("index.reportsShares.params1", {datefrom: datefrom}); // "<div><span style='font-weight:bold'>Date From: </span><span>" + datefrom + "</span></div>";
		params += i18n.__("index.reportsShares.params2", {dateto: dateto}); // "<div><span style='font-weight:bold'>Date To: </span><span>" + dateto + "</span></div>";
		if(where == "")
			where =" where ";
		where += "date between '" + datefrom + "' and '" + dateto + "'";
	} else {
		datefrom = "all";
	}
	if(lab != null && lab !=undefined && lab !="all"){
		if(params == ""){
			params += i18n.__("index.reportsShares.params"); //"<div style='font-weight:bold'>Parameters</div>";
		}
		params += "<div><span style='font-weight:bold'>" + i18n.__("index.reportsOrders.html1") + "</span><span>" + lab + "</span></div>";
		if(where == "")
			where =" where ";
		if(where.trim() != "where")
			where +=" and ";
		where += "lab = '" + lab + "'";
	} 
	/*if(category != null && category !=undefined && category !="all"){
		if(params == ""){
			params += "<div style='font-weight:bold'>Parameters</div>";
		}
		params += "<div><span style='font-weight:bold'>Category: </span><span>" + category+ "</span></div>";
		if(where == "")
			where =" where ";
		if(where.trim() != "where")
			where +=" and ";
		where += " lower(category) like '%" + category.toLowerCase()  + "%'";
	}*/


	var labsstr = "";
	var i = 0;
	var a = "a";
	var requestor = "";
	var date = "";
	var select = "";

	if(lab != null && lab !=undefined && lab =="all"){
	if(where == ""){
			where =" where ";
	} else {
		where += " and ";
	}
	
	for(var prop in labsindept){
		where = where + " lab = '" + labsindept[prop].labname + "' or ";
	}
	where = where.replace(/or\s*$/, "");

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders ";
		select = select + "SELECT * FROM " + labsstr + where + " UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
} else {
	select = "SELECT * FROM " + lab.replace(/ /g,"").toLowerCase() + "_orders " + where;
}
	console.log("get orders labsstr: " + labsstr);
	console.log("full query: " + select);
	
	var qryStr = select + " order by date desc";


	//var qryStr = "SELECT * FROM " + mylab + "_orders " + where + " order by date desc";
	console.log("qry report orders: " + qryStr)
	query = client.query(qryStr);
	/*if(datefrom != null && dateto != null && datefrom !=undefined && dateto !=undefined && datefrom !="" && dateto !=""){
		query = client.query("SELECT * FROM vm2016_orders where date between '" + datefrom + "' and '" + dateto + "' order by date desc");
	} else {
		query = client.query("SELECT * FROM vm2016_orders order by date desc");
		datefrom = "all";
	}*/
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("results : " + results);
		var html = "";
		if(results != null && results != ""){
		html = "<div><span id='reporttitle' style='font-weight:bold;font-size:36pt;'>" + i18n.__("index.reportsOrders.html2") + "</span></div><br/><div style='font-size:11pt;text-align:left'>";
		if(datefrom == 'all'){
			html += i18n.__("index.reportsOrders.html3"); //"<p>This report is listing all the orders requested:</p></div>"
		} else {
			html += i18n.__("index.reportsOrders.html4") + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + i18n.__("index.reportsShares.html4") + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + "</p></div>"
			//html += "<p>This report is listing the orders requested between " + moment(datefrom).tz("America/New_York").format('MM-DD-YYYY') + " and " + moment(dateto).tz("America/New_York").format('MM-DD-YYYY') + "</p></div>"
		}
		html += params;
		html += i18n.__("index.reportsOrders.html5");
		headeronly.push(i18n.__("index.reportsMoney.param9"));
		headeronly.push(i18n.__("index.reportsMoney.param10"));
		headeronly.push(i18n.__("index.reportsMoney.param11"));
		headeronly.push(i18n.__("index.reportsMoney.param15"));
		headeronly.push(i18n.__("index.reportsMoney.param17"));
		headeronly.push(i18n.__("index.reportsMoney.param12"));
		dataonly.push(headeronly);
		//html +="<table><tbody><tr style='color: white;background-color: #3d9dcb;'><td style='font-size: 12px;'>Reagent</td><td style='font-size: 12px;'>Vendor</td><td style='font-size: 12px;'>Catalog#</td><td style='font-size: 12px;'>Owner</td><td style='font-size: 12px;'>Requestor</td><td>Date</td></tr>"
		
			for(var prop in results){
				var rowonly = [];
				isempty = false;
				var agent = results[prop].agent;
				var vendor = results[prop].vendor;
				var catalognumber = results[prop].catalognumber;
				var location = results[prop].email;
				var email = results[prop].requestoremail;
				var date = results[prop].date;

				rowonly.push(agent);
				rowonly.push(vendor);
				rowonly.push(catalognumber);
				rowonly.push(location);
				rowonly.push(email);
				rowonly.push(moment(date).tz("America/New_York").format('MM-DD-YYYY'));
				html += " <tr><td style='font-size: 12px;'>" + agent + "</td>";
				html += " <td style='font-size: 12px;'>" + vendor + "</td>";
				html += " <td style='font-size: 12px;'>" + catalognumber + "</td>";
				html += " <td style='font-size: 12px;'>" + location + "</td>";
				html += " <td style='font-size: 12px;'>" + email + "</td>";
				html += " <td style='font-size: 12px;'>" + moment(date).tz("America/New_York").format('MM-DD-YYYY') + "</td></tr>";
				dataonly.push(rowonly);
			}
			html += "</tbody></table><p style='margin-top:25px'><i><b>" + i18n.__("index.reportsShares.html7") + "</b></i></p>";
		}
		
		if(!isempty){
			resultsbundled.push(html);
			resultsbundled.push(dataonly);
			callback(null, resultsbundled);
		} else {
			callback(null, results);
		}
	});
});
};

LabYokeAgents.prototype.getLabyoker = function(callback) {
	var results;
	var query = client.query("SELECT * FROM vm2016_users where email='" + this.email
			+ "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("get user details " + results);
		callback(null, results);
	});
};

LabyokerLabs.prototype.getlabs = function(callback) {
	var results;
	var lab = this.lab;
	var adminemail = this.adminemail;
	var where = "";
	console.log("get lab " + lab);
	console.log("get admin " + adminemail);
	if(adminemail != null && adminemail.length>0){
		where = " where admin='" + adminemail + "'";
	}
	if(lab != null && lab.length>0){
		where = " where lab='" + lab + "'";
	}
	var query = client.query("SELECT * FROM labs" + where);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("get labs results" + results);
		callback(null, results);
	});
};

LabYokeGlobal.prototype.getlatestshares = function(callback) {
	var results;
	var labs = this.param;
	var LATEST_SHARES_NUM = 9;

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "select agent,lab from (";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT distinct agent, lab, date FROM " + labsstr + " group by agent,lab,date UNION ";
		i++;
	}

	select = select.replace(/UNION\s*$/, "");
	select = select + ") t group by agent,lab,date order by date desc limit " + LATEST_SHARES_NUM;

	console.log("get getlatestshares labsstr: " + labsstr);
	console.log("full getlatestshares query: " + select);

	var query = client
			.query(select);
	query.on("row", function(row, result) {
		result.addRow(row);
	});


	console.log("getlatestshares");
	query.on("end", function(result) {
		results = result.rows;
		console.log("getlatestshares results: " + results);
		callback(null, results)
	});
};

LabYokeAgents.prototype.findmyshares = function(callback) {
	var results = [];
	var labs = this.labs;
	var mylab = this.mylab;
	var department = this.dept;
	var mylabtable = mylab.replace(/ /g,"").toLowerCase();
	console.log("findmyshares: " + this.email);
	var query = client
			.query("SELECT * FROM vm2016_agentsshare where email='"
					+ this.email + "' order by date desc");
	var email = this.email;
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";

	/*for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT a.agent, count(a.agent), b.insufficient as insuff from vm2016_agentsshare a, " + labsstr + " b where a.agent = b.agent and a.catalognumber = b.catalognumber and b.email='"
					+ email + "' and b.lab='" + mylab + "' group by a.agent, b.insufficient UNION ";
		i++;
	}*/

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	//select = select.replace(/UNION\s*$/, "");

	console.log("get getLabOrders_2 labsstr: " + labsstr);

	console.log("get getLabOrders_2 select: " + select /*+ " order by agent asc limit 6"*/);

		var query2 = client.query("SELECT a.agent, count(a.agent), b.insufficient as insuff from vm2016_agentsshare a, " + mylabtable + "_orders b where a.agent = b.agent and a.catalognumber = b.catalognumber and b.email='"
					+ email + "' group by a.agent, b.insufficient order by agent asc limit 6");
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);

	/*var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT * from " + labsstr + "_orders where email='" + email + "' and lab='" + mylab + "' UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	*/
			var select = "";
			for(var prop in labs){
				var labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders";
				select = select + "SELECT * FROM " + labsstr +  " where email='" + email + "' UNION ";
			}
			select = select.replace(/UNION\s*$/, "") + " order by date desc";
			console.log("Partages select: " + select);
			//var query4 = client.query("SELECT * from " + mylabtable + "_orders where email='" + email + "'  order by date desc");
			var query4 = client.query(select);
			query4.on("row", function(row, result4) {
				result4.addRow(row);
			});
			query4.on("end", function(result4) {
				var test4 = result4.rows;
				results.push(test4.length);
				results.push(test4);

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + " update "+ labsstr + " set status='' where status='new' and email='" + email+ "'; ";
	}
	var q = "BEGIN TRANSACTION; " + select + " COMMIT;";
	*/
	//var q = "update "+ mylabtable + "_orders set status='' where status='new' and email='" + email+ "'";
	//console.log("q update: " + q);
	//		var query3 = client.query(q);


				//var query3 = client.query("update " + mylabtable + "_orders set status='' where status='new' and email='" + email+ "'");

	/*			query3.on("row", function(row, result3) {
					result3.addRow(row);
				});
				query3.on("end", function(result3) {*/

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + " where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
	}
	select = select.replace(/UNION\s*$/, "");
	var q = select + " order by agent asc limit 5";
	*/
	var q = "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date )";
	console.log("q monthly: " + q);
	var query5 = client.query(q);
	

					//var query5 = client
					//	.query("SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email
					//+ "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) order by agent asc limit 5");
					query5.on("row", function(row, result5) {
						result5.addRow(row);
					});
					query5.on("end", function(result5) {
						results.push(result5.rows);
						console.log("orders findmyshares result5: " + result5.rows);

						var q = client
								.query("select b.lab, a.catalognumber, c.labname from vm2016_agentsshare a, vm2016_users b, labs c where c.department='"
										+ department + "' and a.email = b.email and b.lab = c.labname and c.isvenn = 1 group by c.labname, a.catalognumber,b.lab order by c.labname");
	

						console.log("q all reagents in current department: " + q);
						var query6 = client.query(q);
						query6.on("row", function(row, result6) {
							result6.addRow(row);
						});
						query6.on("end", function(result6) {
							console.log("finishing up getting share data");
							results.push(result6.rows);
							console.log("getting all products loaded: " + result6.rows)
							callback(null, results);
						});

						//callback(null, results)
					});
				//});

			});
			//callback(null, results)
		});
	});
};

LabYokeAgents.prototype.findallshares = function(callback) {
	var results = [];
	var labs = this.labs;
	var mylab = this.mylab;
	var department = this.dept;
	var mylabtable = mylab.replace(/ /g,"").toLowerCase();
	console.log("findmyshares: " + this.email);
	var query = client
			.query("SELECT * FROM vm2016_agentsshare a,labs b, vm2016_users c where b.labname='"
					+ mylab + "' and a.email=c.email and b.labname=c.lab and a.email = c.email order by date desc");
	var email = this.email;
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";
	var checklab = [];

	//for(var prop in labs){
		//var lb = labs[prop].labname;
		//if(checklab.indexOf(lb)<0){
		//	checklab.push(lb);

		a = "a" + i;
		labsstr = mylabtable + "_orders "; //+ a + " ";
		console.log("get all labs shares labsstr: " + labsstr);
		select = select + "SELECT a.agent, count(a.agent), b.insufficient as insuff from vm2016_agentsshare a, " + labsstr + " b where a.agent = b.agent and a.catalognumber = b.catalognumber and b.email='"
					+ email + "' and b.lab='" + mylab + "' group by a.agent, b.insufficient UNION ";
		i++;
		//}
	//}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	

	console.log("get allshares select: " + select /*+ " order by agent asc limit 6"*/);

		var query2 = client.query(select);
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);

	/*var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT * from " + labsstr + "_orders where email='" + email + "' and lab='" + mylab + "' UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	*/
			var select = "";
			//for(var prop in labs){
				var labsstr = mylab.replace(/ /g,"").toLowerCase() + "_orders";
				select = select + "SELECT * FROM " + labsstr +  " UNION ";
			//}
			select = select.replace(/UNION\s*$/, "") + " order by date desc";
			console.log("Partages select: " + select);
			//var query4 = client.query("SELECT * from " + mylabtable + "_orders where email='" + email + "'  order by date desc");
			var query4 = client.query(select);
			query4.on("row", function(row, result4) {
				result4.addRow(row);
			});
			query4.on("end", function(result4) {
				var test4 = result4.rows;
				results.push(test4.length);
				results.push(test4);

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + " update "+ labsstr + " set status='' where status='new' and email='" + email+ "'; ";
	}
	var q = "BEGIN TRANSACTION; " + select + " COMMIT;";
	*/
	/*var q = "update "+ mylabtable + "_orders set status='' where status='new' and email='" + email+ "'";
	console.log("q update: " + q);
			var query3 = client.query(q);

				query3.on("row", function(row, result3) {
					result3.addRow(row);
				});
				query3.on("end", function(result3) {

	*/

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + " where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
	}
	select = select.replace(/UNION\s*$/, "");
	var q = select + " order by agent asc limit 5";
	*/

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + "_orders where insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	var q = select;//"SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date )";
	console.log("q allshares monthly: " + q);
	var query5 = client.query(q);
	

					//var query5 = client
					//	.query("SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email
					//+ "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) order by agent asc limit 5");
					query5.on("row", function(row, result5) {
						result5.addRow(row);
					});
					query5.on("end", function(result5) {
						results.push(result5.rows);
						console.log("orders findmyshares result5: " + result5.rows);

						var q = client
								.query("select b.lab, a.catalognumber, c.labname from vm2016_agentsshare a, vm2016_users b, labs c where c.department='"
										+ department + "' and a.email = b.email and b.lab = c.labname and c.isvenn = 1 group by c.labname, a.catalognumber,b.lab order by c.labname");
	

						console.log("q all reagents in current department: " + q);
						var query6 = client.query(q);
						query6.on("row", function(row, result6) {
							result6.addRow(row);
						});
						query6.on("end", function(result6) {
							console.log("finishing up getting share data");
							results.push(result6.rows);
							console.log("getting all products loaded: " + result6.rows)
							callback(null, results);
						});

						//callback(null, results)
					});
				//});

			});
			//callback(null, results)
		});
	});
};

LabYokeAgents.prototype.findallsharesadmins = function(callback) {
	var results = [];
	var labs = this.labs;
	var mylab = this.mylab;
	var department = this.dept;
	var mylabtable = mylab.replace(/ /g,"").toLowerCase();
	console.log("findmyshares: " + this.email);
	var query = client
			.query("SELECT * FROM vm2016_agentsshare a,labs b, vm2016_users c where b.labname='"
					+ mylab + "' and a.email=c.email and b.labname=c.lab and a.email = c.email order by date desc");
	var email = this.email;
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";
	var checklab = [];


		select = "select * from (SELECT a.email as emailinsuff, count(a.email)  as insuff from vm2016_agentsshare a , vm2016_users b where  a.insufficient=1 and a.email = b.email  and b.lab='" + mylab + "' group by a.email)  y left join (SELECT c.email,count(c.email)  as noninsuff from vm2016_agentsshare c , vm2016_users d  where  c.insufficient=0 and c.email = d.email and d.lab='"+mylab+"' group by c.email) z on y.emailinsuff = z.email";

		//select = "SELECT b.email as email, count(a.agent) as counting, a.insufficient as insuff from vm2016_agentsshare a, vm2016_users  b where a.email = b.email and b.lab = '" + mylab + "' group by a.insufficient, b.email order by b.email";	

	console.log("get allshares admin select: " + select /*+ " order by agent asc limit 6"*/);

		var query2 = client.query(select);
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);
			var select = "";
			var labsstr = mylab.replace(/ /g,"").toLowerCase() + "_orders";
			select = select + "SELECT * FROM " + labsstr +  " UNION ";
			select = select.replace(/UNION\s*$/, "") + " order by date desc";
			console.log("Partages select: " + select);
			var query4 = client.query(select);
			query4.on("row", function(row, result4) {
				result4.addRow(row);
			});
			query4.on("end", function(result4) {
				var test4 = result4.rows;
				results.push(test4.length);
				results.push(test4);

							callback(null, results);


			});
		});
	});
};


LabYokeAgents.prototype.findallshares2 = function(callback) {
	var results = [];
	var labs = this.labs;
	var mylab = this.mylab;
	var department = this.dept;
	var mylabtable = mylab.replace(/ /g,"").toLowerCase();
	console.log("findmyshares: " + this.email);
	var query = client
			.query("SELECT * FROM vm2016_agentsshare a,labs b, vm2016_users c where b.department='"
					+ department + "' and a.email=c.email and b.labname=c.lab and a.email = c.email order by date desc");
	var email = this.email;
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";
	var checklab = [];

	for(var prop in labs){
		var lb = labs[prop].labname;
		//if(checklab.indexOf(lb)<0){
		//	checklab.push(lb);

		a = "a" + i;
		labsstr = lb.replace(/ /g,"").toLowerCase() + "_orders "; //+ a + " ";
		console.log("get all labs shares labsstr: " + labsstr);
		select = select + "SELECT a.agent, count(a.agent), b.insufficient as insuff from vm2016_agentsshare a, " + labsstr + " b where a.agent = b.agent and a.catalognumber = b.catalognumber and b.email='"
					+ email + "' and b.lab='" + mylab + "' group by a.agent, b.insufficient UNION ";
		i++;
		//}
	}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	

	console.log("get allshares select: " + select /*+ " order by agent asc limit 6"*/);

		var query2 = client.query(select);
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);

	/*var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT * from " + labsstr + "_orders where email='" + email + "' and lab='" + mylab + "' UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	*/
			var select = "";
			for(var prop in labs){
				var labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders";
				select = select + "SELECT * FROM " + labsstr +  " where email='" + email + "' UNION ";
			}
			select = select.replace(/UNION\s*$/, "") + " order by date desc";
			console.log("Partages select: " + select);
			//var query4 = client.query("SELECT * from " + mylabtable + "_orders where email='" + email + "'  order by date desc");
			var query4 = client.query(select);
			query4.on("row", function(row, result4) {
				result4.addRow(row);
			});
			query4.on("end", function(result4) {
				var test4 = result4.rows;
				results.push(test4.length);
				results.push(test4);

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders "; //+ a + " ";
		select = select + " update "+ labsstr + " set status='' where status='new' and email='" + email+ "'; ";
	}
	var q = "BEGIN TRANSACTION; " + select + " COMMIT;";
	*/
	/*var q = "update "+ mylabtable + "_orders set status='' where status='new' and email='" + email+ "'";
	console.log("q update: " + q);
			var query3 = client.query(q);

				query3.on("row", function(row, result3) {
					result3.addRow(row);
				});
				query3.on("end", function(result3) {

	*/

	labsstr = "";
	select = "";

	/*for(var prop in labs){
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + " where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
	}
	select = select.replace(/UNION\s*$/, "");
	var q = select + " order by agent asc limit 5";
	*/

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + "_orders where insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	var q = select;//"SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email + "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date )";
	console.log("q allshares monthly: " + q);
	var query5 = client.query(q);
	

					//var query5 = client
					//	.query("SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + mylabtable + "_orders where email='" + email
					//+ "' and insufficient=1 group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) order by agent asc limit 5");
					query5.on("row", function(row, result5) {
						result5.addRow(row);
					});
					query5.on("end", function(result5) {
						results.push(result5.rows);
						console.log("orders findmyshares result5: " + result5.rows);

						var q = client
								.query("select b.lab, a.catalognumber, c.labname from vm2016_agentsshare a, vm2016_users b, labs c where c.department='"
										+ department + "' and a.email = b.email and b.lab = c.labname and c.isvenn = 1 group by c.labname, a.catalognumber,b.lab order by c.labname");
	

						console.log("q all reagents in current department: " + q);
						var query6 = client.query(q);
						query6.on("row", function(row, result6) {
							result6.addRow(row);
						});
						query6.on("end", function(result6) {
							console.log("finishing up getting share data");
							results.push(result6.rows);
							console.log("getting all products loaded: " + result6.rows)
							callback(null, results);
						});

						//callback(null, results)
					});
				//});

			});
			//callback(null, results)
		});
	});
};


LabYokeAgents.prototype.reportAllSharesByCategory = function(callback) {
	var results;
	console.log("reportAllSharesByCategory: " + this.email);
	var mylab = this.mylab.replace(/ /g,"").toLowerCase();
	var query = client
			.query("SELECT b.agent, count(b.agent) FROM " + mylab + "_orders a, vm2016_agentsshare b where a.agent = b.agent group by b.agent");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results)
	});
};

LabyokerLab.prototype.getLabsInDept = function(callback) {
	var results;
	var lab = this.lab;
	var query = client
			.query("SELECT distinct labname FROM labs where department in (select department from labs where labname='"+lab+"')");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results)
	});
};



LabYokerOrder.prototype.order = function(callback) {
	var i18n = this.res;
	var results;
	var agent = this.agent;
	var vendor = this.vendor;
	var catalognumber = this.catalognumber;
	var email = this.email;
	var sendemail = this.sendemail;
	var location = this.location;
	var labadmin = this.labadmin;
	//var category = this.category;
	var lab = this.lab;
	var quantity = this.quantity;
	var mylab = this.mylab; //.replace(" ","").toLowerCase();
	var userlang = this.userlang;
	var ownerlang = this.ownerlang;

	console.log("quantity: " + quantity);
	quantity = parseInt(quantity) + 100;
	console.log("currentquantity2: " + quantity);
	var now = moment(new Date).tz("America/New_York").format('MM-DD-YYYY');
	console.log("order location: " + location);
	var query = client.query("INSERT INTO " + lab.replace(/ /g,"").toLowerCase() + "_orders VALUES ('" + agent + "', '" + vendor + "', '" + catalognumber + "','" + email + "', '" + sendemail + "', '" + now + "', 'new','" + mylab + "',1 )");

	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;

		var subject = /*"LabYoke - Pending Order for "*/ i18n.__({phrase: "index.orders.subject", locale: ownerlang}) + agent;
		var subjectReq = /*"LabYoke - Your Request to order "*/ i18n.__({phrase: "index.orders.resubject", locale: userlang}) + agent;
		var body="<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
			
		body += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style='\"font-family:'calibri'; 'font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: ownerlang}) + " " + location
				+ ",<br/><br/>";
		var bodyReq = "<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
			
		bodyReq += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + ",<br/><br/>";
		body += i18n.__({phrase: "index.orders.body1", locale: ownerlang}); //"This is a kind request to share 100 units from the following inventory:";
		bodyReq += i18n.__({phrase: "index.orders.body2", locale: userlang}); //"You have requested 100 units from the following inventory:";
		body += "<br><b>" + i18n.__({phrase: "index.orders.reagent", locale: ownerlang}) + ": </b> " + agent;
		bodyReq += "<br><b>" + i18n.__({phrase: "index.orders.reagent", locale: userlang}) + ": </b> " + agent;
		body += "<br><b>" +  i18n.__({phrase: "index.orders.vendor", locale: ownerlang}) + ": </b> " + vendor;
		bodyReq += "<br><b>" + i18n.__({phrase: "index.orders.vendor", locale: userlang}) + ": </b> " + vendor;
		body += "<br><b>" + i18n.__({phrase: "index.orders.catalog", locale: ownerlang}) + ": </b> " + catalognumber;
		bodyReq += "<br><b>" + i18n.__({phrase: "index.orders.catalog", locale: userlang}) + ": </b> " + catalognumber;
		body += "<br><b>" + i18n.__({phrase: "index.orders.email", locale: ownerlang}) + ": </b> " + email;
		body += "<br><b>" + i18n.__({phrase: "index.orders.sendemail", locale: ownerlang}) + ": </b> " + sendemail;
		bodyReq += "<br><b>" + i18n.__({phrase: "index.orders.email", locale: userlang}) + ": </b> " + email;
		body += "<br><b>" + i18n.__({phrase: "index.orders.labrequestor", locale: ownerlang}) + ": </b> " + mylab;
		bodyReq += "<br><b>" + i18n.__({phrase: "index.orders.labowner", locale: userlang}) + ": </b> " + lab;
		body += "<p>" + i18n.__({phrase: "index.orders.best", locale: ownerlang});
		bodyReq += "<p>" + i18n.__({phrase: "index.orders.best", locale: userlang});
		body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: ownerlang}) + "</i></b></div>";
		bodyReq += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
		body += "</div>";
		bodyReq += "</div>";
		console.log("order body: " + body);
		var tes = "UPDATE vm2016_agentsshare SET quantity = " + quantity + " WHERE agent='" + agent + "' AND vendor='" + vendor + "' AND catalognumber='" + catalognumber + "' AND email='" + email + "'";
		console.log("order tes: " + tes);
		var query2 = client.query(tes);
		console.log("query2: " + query2);
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {

			var mailOptions = new MailOptionsWithCC(email, subject, body, labadmin);
			var mailOptionsReq = new MailOptionsWithCC(sendemail, subjectReq, bodyReq);
			mailOptions.sendAllEmails();
			mailOptionsReq.sendAllEmails();

			callback(null, "successfulOrder")
		});
	});
};

LabYokerGetOrder.prototype.getLabOrders = function(callback) {
	var results = [];
	console.log("getLabOrders");
	var mylab = this.lab.replace(/ /g,"").toLowerCase();
	var query = client.query("SELECT lab, count(lab) as counting FROM samalab_orders where lab='Sama Lab' group by lab");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);
		var query2 = client.query("SELECT lab, count(lab) as counting FROM sougnoulab_orders where lab='Sougnou Lab' group by lab");
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);
			var query3 = client.query("SELECT lab, count(lab) as counting FROM senelab_orders where lab='SeneLab' group by lab");
			query3.on("row", function(row, result3) {
				result3.addRow(row);
			});
			query3.on("end", function(result3) {
				results.push(result3.rows);
				callback(null, results)
			});
		});

	});
};

LabYokerGetOrder.prototype.getLabOrders_2 = function(callback) {
	var results;
	var labs = this.labs;

	var labsstr = "";
	var i = 0;
	var a = "a";
	var select = "select lab,sum(counting) counting from (";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders "; //+ a + " ";
		select = select + "SELECT agent, count(agent) as counting, lab FROM " + labsstr + " group by agent,lab UNION ";
		i++;
	}



	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");
	select = select + ") t group by lab";

	console.log("get getLabOrders_2 labsstr: " + labsstr);
	console.log("full getLabOrders_2 query: " + select);

	var query = client
			.query(select);
	query.on("row", function(row, result) {
		result.addRow(row);
	});


	console.log("getLabOrders");
	/*var mylab = this.mylab.replace(" ","").toLowerCase();
	var query = client.query("SELECT lab, count(lab) as counting FROM " + mylab + "_orders group by lab");
	query.on("row", function(row, result) {
		result.addRow(row);
	});*/
	query.on("end", function(result) {
		results = result.rows;
		console.log("getLabOrders results: " + results);
		callback(null, results)
	});
};


LabYokerGetOrder.prototype.getorders = function(callback) {
	var results = [];
	var email = this.sendemail;
	var lab = this.lab;
	var mylab = this.lab.replace(/ /g,"").toLowerCase();
	console.log("getorders: " + email);
	var labs = this.labs;
	var labsstr = "";
	var i = 0;
	var a = "a";
	var requestor = "";
	var date = "";
	var select = "";

	console.log("getorders labs: " + labs.length);

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders " + a + " ";
		requestor = a + ".requestoremail = '"+ email + "' ";
		date = a + ".date ";
		select = select + "SELECT * FROM " + labsstr + " where " + requestor + " UNION ";
		i++;
	}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	console.log("get orders labsstr: " + labsstr);
	console.log("get orders date: " + date);
	console.log("get orders requestor: " + requestor);
	console.log("full query: " + select + " order by date desc");

	var query = client
			.query(select + " order by date desc");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);

	 /*labsstr = "";
	 i = 0;
	 a = "a";
	 requestor = "";

	 select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(" ","").toLowerCase() + "_orders " + a + " ";
		select = select + "SELECT agent, count(agent) as counting FROM " + labsstr + " where lab='"+lab+"' and insufficient=1 group by agent UNION ";
		i++;
	}
*/
	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = "SELECT agent, count(agent) as counting FROM " + mylab + "_orders where insufficient=1 group by agent";
	console.log("getorders: total number of orders - " + select + " order by counting desc limit 10");
		var query2 = client.query(select + " order by counting desc limit 10");
		//("SELECT b.category, count(b.category) FROM vm2016_orders a, vm2016_agentsshare b where a.agent = b.agent and a.lab='"+lab+"' group by b.category");
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);

		var query3 = client
				.query("SELECT count(agent) as counting from vm2016_agentsshare where email='" + email
			+ "' and status='new' ");
		query3.on("row", function(row, result3) {
			result3.addRow(row);
		});
		query3.on("end", function(result3) {
			//results.push(result2.rows);

	 labsstr = "";
	 i = 0;
	 a = "a";
	 select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders " + a + " ";
		select = select + "SELECT agent, count(agent) as counting, EXTRACT(MONTH FROM date_trunc( 'month', date )) as monthorder, EXTRACT(year FROM date_trunc( 'year', date )) as yearorder from " + labsstr + " where insufficient = 1 and requestoremail='" + email
			+ "' group by agent, date_trunc( 'month', date ), date_trunc( 'year', date ) UNION ";
		i++;
	}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	console.log("get orders for month orders labsstr: " + labsstr);

	console.log("full for month orders query: " + select + " order by counting desc");
	//console.log("full for month orders query: " + select + " order by agent asc limit 5");


		var query4 = client.query(select + " order by counting desc");
		//var query4 = client.query(select + " order by agent asc limit 5");
		query4.on("row", function(row, result4) {
			result4.addRow(row);
		});
		query4.on("end", function(result4) {
			//results.push(result2.rows);
			var test3 = result3.rows;
			results.push(test3[0].counting);
			results.push(result4.rows);
			console.log("shares found: " + test3[0].counting)

	 labsstr = "";
	 i = 0;
	 a = "a";
	 requestor = "";

	 select = "";

	for(var prop in labs){
		//a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders" ; //+ a + " ";
		select = select + "SELECT a.agent, count(a.agent) counting FROM " + labsstr + " a, vm2016_users b where b.lab='"+lab+"' and a.insufficient=1 and a.requestoremail=b.email group by a.agent UNION ";
		i++;
	}
	select = select.replace(/UNION\s*$/, "");
	console.log("reportorderbycategories: " + select + " order by counting desc limit 10");

	var query5 = client.query(select + " order by counting desc limit 10");

			//var query5 = client.query("SELECT a.agent, count(a.agent) FROM " + mylab + "_orders a, vm2016_users b where b.lab='"+lab+"' and a.insufficient=1 and a.requestoremail=b.email group by a.agent order by count(a.agent) desc limit 10");
		query5.on("row", function(row, result5) {
			result5.addRow(row);
		});
		query5.on("end", function(result5) {

		
		select = "select sum(counting) counting from (SELECT agent, count(agent) as counting, email FROM " + mylab + "_orders where insufficient=1 group by agent, email) t";
		var query6 = client.query(select);
		//("SELECT b.category, count(b.category) FROM vm2016_orders a, vm2016_agentsshare b where a.agent = b.agent and a.lab='"+lab+"' group by b.category");
		query6.on("row", function(row, result6) {
			result6.addRow(row);
		});
		query6.on("end", function(result6) {
			console.log("getorders results6: " + select);

			results.push(result5.rows);
			results.push(result6.rows);
			callback(null, results)
			});
		});

		});

		});

			//callback(null, results)
		});
	});
};

LabYokeSearch.prototype.search = function(callback) {
	var results = [];
	console.log("searchText: " + this.searchText);
	console.log("searchType: " + this.searchType);
	var query;
	if(this.searchType == "catalog") {
		query = client
			.query("SELECT * FROM vm2016_agentsshare a, vm2016_users b where a.email = b.email and (lower(a.catalognumber) like lower('%"
					+ this.searchText + "%')) and a.insufficient = 1 and a.email != '" + this.email+ "' and (b.disable <> 0 or b.disable is null) order by a.agent");
	} else {
		query = client
			.query("SELECT * FROM vm2016_agentsshare a, vm2016_users b where a.email = b.email and (lower(a.agent) like lower('%"
					+ this.searchText + "%')) and a.insufficient = 1 and a.email != '" + this.email+ "' and (b.disable <> 0 or b.disable is null) order by a.agent");

	}
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results.push(result.rows);
		var query2 = client.query("SELECT distinct agent, catalognumber FROM vm2016_agentsshare order by agent, catalognumber");
		
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results.push(result2.rows);
				callback(null, results)
		});
		//callback(null, results)
	});
};

LabYokeSearch.prototype.findagents = function(callback) {
	var results;
	var query = client.query("SELECT distinct agent, catalognumber FROM vm2016_agentsshare order by agent, catalognumber");
	
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
			callback(null, results)
	});
};

//var crypt = require('bcrypt-nodejs');
var salt = crypt.genSaltSync(1);

Labyoker = function(username, password,res,userlang) {
	this.username = username;
	this.password = password;
	this.res = res;
	this.userlang = userlang;
};

LabYokeFinder.prototype.getLabyoker = function(callback) {
	var results;
	var query = client.query("SELECT * FROM vm2016_users where id='" + id
			+ "' and password='" + password + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results);
	});
};

LabYokeFinder.prototype.test = function(callback) {
	var results;
	var query = client.query("SELECT * FROM vm2016_users where id='"
			+ this.username + "'"/* and password='"+password+"'" */);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		callback(null, results);
	});
	// return false;
};

LabYokeTest.prototype.test = function(callback) {
	var results;
	var i18n = this.resp;
	console.log("resp is: " + i18n);
	var test = i18n.__("login.morning")
	console.log("a translation1: " + test)
	var test2 = i18n.__({phrase: "login.morning", locale: 'fr'});
	console.log("a translation2: " + test2)
	var test3 = i18n.__({phrase: test, locale: 'fr'});
	console.log("a translation3: " + test3)
	callback(null, test);
	
	// return false;
};


LabyokerInit.prototype.initialShares = function(callback) {
	var email = this.email;
console.log("shares email: " + email);
//var mylab = this.mylab.replace(" ","").toLowerCase();
//console.log("mylab is: " +  mylab);
	var resultsLogin;

var labyokerLabs = new LabyokerLabs('','');
			labyokerLabs.getlabs(function(error, labs) {

	var labsstr = "";
	var i = 0;
	var a = "a";
	var requested = "";
	var select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders " + a + " ";
		requested = a + ".email = '"+ email + "' ";
		select = select + "SELECT * FROM " + labsstr + " where " + requested + " and status='new' UNION ";
		i++;
	}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	console.log("get shares labsstr: " + labsstr);
	console.log("get shares requestor: " + requested);
	console.log("full query: " + select + " order by date desc");

	var query = client
			.query(select + " order by date desc");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		//results.push(result2.rows);
		var test = result.rows;
		//resultsLogin.push(results);
		resultsLogin = test.length;
		console.log("shares found: " + test.length)
		callback(null, resultsLogin)
	});
});
};

LabyokerInit.prototype.initialOrders = function(callback) {
var email = this.email;
var labyokerLabs = new LabyokerLabs('','');
			labyokerLabs.getlabs(function(error, labs) {
	
	//var mylab = this.mylab.replace(" ","").toLowerCase();
	var resultsLogin;

	var labsstr = "";
	var i = 0;
	var a = "a";
	var requestor = "";
	var select = "";

	for(var prop in labs){
		a = "a" + i;
		labsstr = (labs[prop].labname).replace(/ /g,"").toLowerCase() + "_orders " + a + " ";
		requestor = a + ".requestoremail = '"+ email + "' ";
		select = select + "SELECT * FROM " + labsstr + " where " + requestor + " and status='new' UNION ";
		i++;
	}

	//labsstr = labsstr.replace(/,\s*$/, "");
	//date = date.replace(/,\s*$/, "");
	select = select.replace(/UNION\s*$/, "");

	console.log("get orders labsstr: " + labsstr);
	console.log("get orders requestor: " + requestor);
	console.log("full query: " + select + " order by date desc");

	var query = client
			.query(select + " order by date desc");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		//results.push(result2.rows);
		var test = result.rows;
		//resultsLogin.push(results);
		resultsLogin = test.length;
		console.log("orders found: " + test.length)
		callback(null, resultsLogin)
	});
});
};

Labyoker.prototype.login = function(callback) {
	var password = this.password;
	var username = this.username;

	var results;
	var results2;
	var resultsLogin = [];
	var query = client.query("SELECT * FROM vm2016_users where id='" + username
			+ "'"/* and password='"+password+"'" */);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		if (results != null && results.length == 1) {
			resultsLogin.push(results);
			var pass = results[0].password;
			var active = results[0].active;
			var email = results[0].email;
			var lab = results[0].lab;
			var query2 = client.query("SELECT * from labs where labname='" + lab + "'");
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			results2 = result2.rows;
			console.log("LOGIN DEPT: " + results2[0].department);
			console.log("LOGIN ADMIN: " + results2[0].admin);
			resultsLogin.push(results2[0].department);
			resultsLogin.push(results2[0].admin);
			//console.log("dept is: " + results2[0].email);
			// var hash = crypt.hashSync(pass, salt);
			//if (active == 1) {
				var c = crypt.compareSync(password, pass);
				console.log("compare is: " + c);
				if (c) {

		/*var query2 = client
				.query("SELECT count(agent) as counting from vm2016_orders where email='" + email
			+ "' and status='new'");
		query2.on("row", function(row, result2) {
			result2.addRow(row);
		});
		query2.on("end", function(result2) {
			//results.push(result2.rows);

		var query3 = client
				.query("SELECT count(agent) as counting from vm2016_orders where requestoremail='" + email
			+ "' and status='new'");
		query3.on("row", function(row, result3) {
			result3.addRow(row);
		});
		query3.on("end", function(result3) {
			//results.push(result2.rows);
			var test3 = result3.rows;
			var test2 = result2.rows;
			//resultsLogin.push(results);
			resultsLogin.push(test2[0].counting);
			resultsLogin.push(test3[0].counting);
			console.log("shares found: " + test2[0].counting)
			console.log("orders found: " + test3[0].counting)*/
			callback(null, resultsLogin)
		/*});
			
		});*/

					//callback(null, results);
				} else {
					callback(null, null);
				}
			/*} else {
				var query = client
						.query("SELECT * FROM vm2016_users where id='"
								+ username + "'");
				query.on("row", function(row, result) {
					result.addRow(row);
				});
				query.on("end", function(result) {
					callback(null, result.rows);
				});
			}*/
			});
		} else {
			callback(null, null);
		}
		
	});
};

LabyokerPasswordChange.prototype.checkIfChangePassword = function(callback) {
	var results;
	var now = moment(new Date).tz("America/New_York").format(
				'MM-DD-YYYY');
	var pwd = this.password;
	var query = client
			.query("SELECT * FROM vm2016_users where changepwd_id='"
					+ this.hash + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;

		if (results != null && results.length == 1){
			var changepwd_date = results[0].changepwd_date;
			if(changepwd_date != null) {
		
		console.log("now is " + now);
		console.log("changepwd_date is " + ( changepwd_date == now));
			/*var query2 = client.query("SELECT * FROM vm2016_users where changepwd_id='"
				+ this.id + "' and changepwd_date like '" + now + "'");
			*/
			if(now == results[0].changepwd_date){
			var email = results[0].email;
			var name = results[0].name;
			var userid = results[0].id;

			/*query2.on("row", function(row, result2) {
				result2.addRow(row);
			});
			query2.on("end", function(result2) {
				results2 = result2.rows;
				if (results2 != null && results2.length == 1) {*/
					console.log("changing password now for: " + name);
					console.log("changing password pwd: " + pwd);
					var hash_new_password = crypt.hashSync(pwd);
					console.log("test0 " + hash_new_password);
					var query3 = client.query("UPDATE vm2016_users SET password='" + hash_new_password
							+ "', active=1, changepwd_date='', changepwd_status=1, changepwd_id='' where id='" + userid + "'");
					console.log("test1");
					query3.on("row", function(row, result3) {
						result3.addRow(row);
						console.log("test2");
					});
					console.log("changing password pwd: " + pwd);
					query3.on("end", function(result3) {
						var results3 = result3.rows;
						if (results3 != null) {
							var results3 = result3.rows;
							callback(null, "passwordReset");
						} else {
							callback(null, "errorFound");
						}
					});
				} else {
					callback(null, "dateExpired");
				}
			//});
		} else {
			callback(null, "cannotFindRequest");
		}
	}
	});
}

LabyokerRegister.prototype.register = function(callback) {
	var i18n = this.res;
	var username = this.username;
	var password = this.password;
	var lab = this.lab;
	var firstname = this.firstname;
	var lastname = this.lastname;
	var email = this.email;
	var tel = this.tel;
	var userlang = this.userlang;

	var results;
	//var check = 

			console.log("labyoker username: " + username);
			console.log("labyoker password: " + password);
			console.log("labyoker lab: " + lab);
			console.log("labyoker firstname: " + firstname);
			console.log("labyoker lastname: " + lastname);
			console.log("labyoker email: " + email);
			console.log("labyoker tel: " + tel);
			console.log("labyoker userlang: " + userlang);

	if(tel != null && tel.length>0 && username != null && username.length>0 && firstname != null && firstname.length>0 && lastname != null && lastname.length>0 && email != null && email.length>0 && password != null && password.length>0 && lab != null && lab.length>0 ){
	console.log("processing registration2...");
	var query = client.query("SELECT * FROM vm2016_users where id='" + username
			+ "'"/* and password='"+password+"'" */);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("id entered: " + username);
		if (results != null && results.length > 0) {
			
			/*for (i = 0; i < results.length; i++) { 
				console.log("results[i].email: " + results[i].email);
				if(results[i].email == email){*/
					console.log("in use?: idalreadyInUse");
					callback(null, "idalreadyInUse");
			/*	}
			}*/

		} else {
				var hash_register_id = crypt.hashSync(username);
				console.log("before registerid: " + hash_register_id);
				hash_register_id = hash_register_id.replace(/\//g, "");
				console.log("registerid: " + hash_register_id);
			var hash = crypt.hashSync(password);
			var query2 = client.query("INSERT INTO vm2016_users VALUES ('" + username
				+ "', '" + hash + "', '" + firstname + "',  0, null, null, '" + email + "', null, '" + lab + "', '" + lastname + "', '" + tel + "', 0, '','" + hash_register_id + "', null,'" + userlang + "')");


				query2.on("row", function(row, result2) {
					result2.addRow(row);
				});
				query2.on("end", function(result2) {

					
					console.log("email: " + email);

					/*if (email.length == 4 || email.length == 2) {
						email += "@netlight.com";
					}*/
					// HERE i18n.__({phrase: "login", locale: userlang})

					var subject = i18n.__({phrase: "index.register.subject", locale: userlang}); //"Labyoke - Start Labyoking";
					var body="<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
					body = "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + " " + firstname
							+ ",<br/><br/>";
					body += i18n.__({phrase: "index.register.body1", locale: userlang}); //"Thanks for registering with @LabYoke.";
					body += i18n.__({phrase: "index.register.body2", locale: userlang}); //"You are one step away from labyoking! Please click on this link:<br/>";
					body += "<p style=\"text-align:center\"><span style=''><br/>";
					body += "<form action='https:\/\/team-labyoke.herokuapp.com\/confirmreg/"
							+ hash_register_id + "?lang=" + userlang + "'><button type='submit' value='Confirm Registration' name='submit' style='margin: 20px;color: #fff;background-color: #8a6d3b;border-color: #8a6d3b;padding: 10px 16px;font-size: 18px;line-height: 1.3333333;border-radius: 6px;width: 278px;border: 0;-webkit-appearance: button;cursor: pointer;'>Confirm Registration</button></form>";

					//body +="<a href='https:\/\/team-labyoke.herokuapp.com\/confirmreg/"
					//		+ hash_register_id + "?lang=" + userlang + "'>https:\/\/team-labyoke.herokuapp.com\/confirmreg?id="
					//		+ hash_register_id
					//		+ "?lang=" + userlang + "</a>";
					body += "</span></p>";
					body += i18n.__({phrase: "index.register.body3", locale: userlang}) + "<a href=\"https:\/\/team-labyoke.herokuapp.com\/share\"> " + i18n.__({phrase: "index.register.body2", locale: userlang}) + "</a>" + i18n.__({phrase: "index.register.body4", locale: userlang});
					body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
					body += "</div>";
					console.log("body: " + body);

					var mailOptions = new MailOptions(email, subject, body);
					mailOptions.sendAllEmails();

					callback(null, "success");

				});
				
		}
	});
} else if(tel != null && tel.length>0 && firstname != null && firstname.length>0 && lastname != null && lastname.length>0 && email != null && email.length>0 ){
	var rendered = false;
	console.log("processing registration...");
	var query = client.query("SELECT * FROM vm2016_users where email='" + email
			+ "'"/* and password='"+password+"'" */);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("email entered: " + email);
		if (results != null && results.length > 0) {
			
			//for (i = 0; i < results.length; i++) { 
				console.log("results[0].email: " + results[0].email);
				if(results[0].email == email){
					rendered = true;
					console.log("in use?: alreadyInUse");
					callback(null, "alreadyInUse");
				}
			//}

		}
		console.log("rendered: " + rendered);
		if(!rendered){
			callback(null, "firstsection");
		}
	});

} else {
	callback(null, null);
}
};

Labyoker.prototype.requestChangePassword = function(callback) {
	var i18n = this.res;
	var username = this.username;
	var dateStripped = this.password;
	var userlang = this.userlang;

	var results;
	var query = client.query("SELECT * FROM vm2016_users where id='" + username
			+ "'"/* and password='"+password+"'" */);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		console.log("dateStripped: " + dateStripped);
		if (results != null && results.length == 1 && dateStripped != null) {
			var changepwd_status = results[0].changepwd_status;
			userlang = results[0].lang;
			var now = moment(new Date).tz("America/New_York").format(
				'MM-DD-YYYY');
			var changepwd_date = results[0].changepwd_date;
			console.log("diff: " + changepwd_date + " - " + now);
			if(changepwd_date == null || (changepwd_date != null && changepwd_date=='') || (changepwd_date != null && changepwd_date!=now)){
				var hash = crypt.hashSync(username);
				console.log("before requestChangePassword: " + hash);
				hash = hash.replace(/\//g, "");
				console.log("requestChangePassword: " + hash);
				var query2 = client.query("UPDATE vm2016_users SET changepwd_id='" + hash
				+ "', changepwd_status=0, changepwd_date='" + dateStripped + "' where id='" + username + "'");
				
				var email = results[0].email;
				var name = results[0].name;

				query2.on("row", function(row, result2) {
					result2.addRow(row);
				});
				query2.on("end", function(result2) {

					
					console.log("email: " + email);

					/*if (email.length == 4 || email.length == 2) {
						email += "@netlight.com";
					}*/


					var subject = i18n.__({phrase: "index.change.subject", locale: userlang}); //"Labyoke - Change Password Request";
					var body = "<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
					body += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + " " + name
							+ ",<br/><br/>";
					body += i18n.__({phrase: "index.change.body1", locale: userlang}); //"You have requested to change your password @LabYoke. Please click on this link:<br/>";
					body += "<p style=\"text-align:center\"><span><br/>";
					//<a href='https:\/\/team-labyoke.herokuapp.com\/changepassword/"
					//		+ hash + "?lang="+userlang+"'>https:\/\/team-labyoke.herokuapp.com\/changepassword?id="
					//		+ hash
					//		+ "?lang=" + userlang + "</a>";
					body += "<form action='https:\/\/team-labyoke.herokuapp.com\/changepassword/"
							+ hash + "?lang="+userlang+"'><button type='submit' value='Change Password' name='submit' style='margin: 20px;margin-top:10px;color: #fff;background-color: #8a6d3b;border-color: #8a6d3b;/*padding: 10px 16px;*/font-size: 18px;line-height: 1.3333333;border-radius: 6px;width: 278px;border: 0;-webkit-appearance: button;cursor: pointer;'>Change Password</button></form>";
					body += "</span></p>";
					//body += "<p><span>You have <b><span style='color:red;'>1 day</span></b> to change your password. But don't worry you can always send us another " + "<a href=\"https:\/\/team-labyoke.herokuapp.com\/forgot\">" + "request" + "</a>" + " once this one has expired." + "</span> </p>";
					body +=  i18n.__({phrase: "index.change.body2", locale: userlang}) + "<a href=\"https:\/\/team-labyoke.herokuapp.com\/forgot\">" + i18n.__({phrase: "index.change.body3", locale: userlang}) + "</a>" + i18n.__({phrase: "index.change.body4", locale: userlang}) + "</span> </p>";
					//body += "<p>[PS: Have you " + "<a href=\"https:\/\/team-labyoke.herokuapp.com\/share\">" + "shared" + "</a>" + " some chemicals today?]";
					body += i18n.__({phrase: "index.change.body5", locale: userlang}) + "<a href=\"https:\/\/team-labyoke.herokuapp.com\/share\">" + i18n.__({phrase: "index.change.body6", locale: userlang}) + "</a>" + i18n.__({phrase: "index.change.body7", locale: userlang});
					body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
					body += "</div>";
					console.log("body: " + body);

					var mailOptions = new MailOptions(email, subject, body);
					mailOptions.sendAllEmails();

				});
				callback(null, results);
			} else {
				//Change Password already sent
				console.log("alreadySent.");
				callback(null, "alreadySent");
			}
		} else {
			callback(null, null);
		}
});
};

Labyoker.prototype.changepassword = function(callback) {
	var hash = crypt.hashSync(this.password);
	var results;
	var query = client.query("UPDATE vm2016_users SET password='" + hash
			+ "', active=1 where id='" + this.username + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results);
	});
};

LabyokerTeam.prototype.getTeam = function(callback) {
	var results;
	var query = client.query("Select * from vm2016_users where lab='" + this.lab + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results);
	});
};

LabyokerConfirm.prototype.confirm = function(callback) {
	var results;
	var registerid = this.registerid;
	var query = client
			.query("SELECT * FROM vm2016_users where register_id='"
					+ registerid + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;

		if (results != null && results.length == 1){
			var userid = results[0].id;
			console.log("confirm registration now for: " + userid);

			var query2 = client.query("UPDATE vm2016_users SET active=1, register_id='' where id='" + userid + "'");
			query2.on("row", function(row, result2) {
				result2.addRow(row);
			});
			console.log("confirming reg: " + registerid);
			query2.on("end", function(result2) {
				var results2 = result2.rows;
				if (results2 != null) {
					callback(null, "confirmReset");
				} else {
					callback(null, "errorFound");
				}
			});
		} else {
			callback(null, "cannotFindRequest");
		}
	});
};

LabyokerUserDetails.prototype.changeDetails = function(callback) {
	var column = this.column;
	var value = this.value;
	var email = this.email;
	var curname = this.curname;
	var cursurname = this.cursurname;
	var i18n = this.res;
	var results;
	var query = client.query("UPDATE vm2016_users SET " + column + "='" + value
			+ "' where email='" + email + "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		var qStr = "";
		var where = "";
		var location = "";
		var name = curname;
		var surname = cursurname;
		var update = false;
		if(column == "name"){
			if(where==""){
				where = " where email='" + email + "'";
			}
			name = value.charAt(0);
			location = name.toUpperCase() + ". " + surname;
			console.log("location name: " + location);
			update = true;

		}
		if(column == "surname"){
			if(where==""){
				where = " where email='" + email + "'";
			}
			update = true;
			surname = value;
			name = name.charAt(0);
			location = name.toUpperCase() + ". " + surname;
			console.log("location surname: " + location);
		}
		if(update){
			qStr = "update vm2016_agentsshare set location='" + location + "' " + where;
			console.log("qstr changedetails update share tbl: " + qStr);
			var query2 = client.query(qStr);
			query2.on("row", function(row, result2) {
				result2.addRow(row);
			});
			query2.on("end", function(result2) {

			});

		}
		results = "<span style='font-weight:bold;color: #e6c293;'>" + i18n.__("index.account." + column) + "</span> " +  i18n.__("index.account.to")  + " <span style='color: #e6c293;font-weight:bold'>" + value + "</span>";
		callback(null, results);
	});
};

LabYokerChangeShare.prototype.cancelShare = function(callback) {
	var agent = this.agent;
	var vendor = this.vendor;
	var catalognumber = this.catalognumber;
	var checked = this.checked;
	var lab = this.lab.replace(/ /g,"").toLowerCase();
	var table = this.table;
	var email = this.email;
	var datenow = this.datenow;
	var requestor = this.requestor;
	var i18n = this.res;
	var userlang = this.userlang;
	
	var date = this.date;
	console.log("date2: " + date);
	console.log("requestor: " + requestor);
	console.log("checked: " + checked);
	console.log("lab: " + lab);
	console.log("table: " + table);
	console.log("userlang: " + userlang);
	var results;
	var orderonly = "";
	if(checked == "0" && requestor != undefined){
		console.log("checking that it's insufficient: " + checked);
		orderonly = " and requestoremail='" + requestor + "'";
	}

	var str = "UPDATE " + table + " SET insufficient=" + checked
			+ ", insuffdate='" + datenow + "' where email='" + email + "' and date between '" + date + "' and '" + date + "' and agent='" + agent + "' and vendor='" + vendor + "' and catalognumber='" + catalognumber + "'" + orderonly;
	console.log("str: " + str);
	var query = client.query(str);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = "success";

		if(/*table == lab+"_orders" && */checked == 0){
			
			var subject = i18n.__({phrase: "index.cancelled.subject", locale: userlang}) + agent;//"LabYoke Order - Cancelled for " + agent;
			var body="<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
			body += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + ",<br/><br/>";
			//body += "Unfortunately your order has been cancelled due to insufficient quantities from the following inventory:" + " <br><b>Reagent: </b> " + agent;
			body += i18n.__({phrase: "index.cancelled.body1", locale: userlang}) + " <br><b>" + i18n.__({phrase: "index.orders.reagent", locale: userlang}) + ": </b> " + agent;
			body += "<br><b>" + i18n.__({phrase: "index.orders.vendor", locale: userlang}) + ": </b> " + vendor;
			body += "<br><b>" + i18n.__({phrase: "index.orders.catalog", locale: userlang}) + ": </b> " + catalognumber;
			body += "<br><b>" + i18n.__({phrase: "index.orders.email", locale: userlang}) + ": </b> " + email;
			body += "<p>" + i18n.__({phrase: "index.orders.best", locale: userlang});
			body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
			body += "</div>";
			console.log("order body: " + body);
			var mailOptions = new MailOptionsWithCC(requestor, subject, body, email);
			mailOptions.sendAllEmails();
		}

		callback(null, results);
	});
//callback(null, results);
};

LabYokerChangeShare.prototype.fulfillShare = function(callback) {
	var agent = this.agent;
	var vendor = this.vendor;
	var catalognumber = this.catalognumber;
	var checked = parseInt(this.checked);
	var lab = this.lab.replace(/ /g,"").toLowerCase();
	var table = this.table;
	var email = this.email;
	var datenow = this.datenow;
	var requestor = this.requestor;
	var i18n = this.res;
	var userlang = this.userlang;
	
	var date = this.date;
	console.log("fulfill shares");
	console.log("date2: " + date);
	console.log("requestor: " + requestor);
	console.log("checked: " + checked);
	console.log("lab: " + lab);
	console.log("table: " + table);
	console.log("userlang: " + userlang);
	console.log("email: " + email);
	console.log("checked: " + checked);
	console.log("checking status 0: " + (checked === 0));
	//email = "metsnake316@hotmail.com";
	//requestor = "metsnake217@gmail.com";
	var results;
	var status = "";
	var orderonly = "";
	if(checked == "0" && requestor != undefined){
		orderonly = " and requestoremail='" + requestor + "'";
	}
	if(checked == 0){
		status = "fulfilled";
	}
	//var str = "select * from labs";
	var str ="UPDATE " + table + " SET status='" + status
			+ "' where email='" + email + "' and requestoremail='" + requestor + "' and date between '" + date + "' and '" + date + "' and agent='" + agent + "' and vendor='" + vendor + "' and catalognumber='" + catalognumber + "'" + orderonly;
	console.log("str: " + str);
	var query = client.query(str);
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = "success";

		if(/*table == lab+"_orders" && */checked == 0){
			
			var subject = i18n.__({phrase: "index.fulfilled.subject", locale: userlang}) + agent;//"LabYoke Order - Cancelled for " + agent;
			var body="<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
			body += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + ",<br/><br/>";
			//body += "Unfortunately your order has been cancelled due to insufficient quantities from the following inventory:" + " <br><b>Reagent: </b> " + agent;
			body += i18n.__({phrase: "index.fulfilled.body1", locale: userlang}) + " <br><b>" + i18n.__({phrase: "index.orders.reagent", locale: userlang}) + ": </b> " + agent;
			body += "<br><b>" + i18n.__({phrase: "index.orders.vendor", locale: userlang}) + ": </b> " + vendor;
			body += "<br><b>" + i18n.__({phrase: "index.orders.catalog", locale: userlang}) + ": </b> " + catalognumber;
			body += "<br><b>" + i18n.__({phrase: "index.orders.email", locale: userlang}) + ": </b> " + email;
			body += "<p>" + i18n.__({phrase: "index.orders.best", locale: userlang});
			body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
			body += "</div>";
			console.log("fulfill body: " + body);
			var mailOptions = new MailOptionsWithCC(requestor, subject, body, email);
			mailOptions.sendAllEmails();
		} else if(checked == 1){
			var subject = i18n.__({phrase: "index.fulfilled.not.subject", locale: userlang}) + agent;//"LabYoke Order - Cancelled for " + agent;
			var body="<div style='box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); box-sizing: content-box; padding-right: 15px; margin-top: 20px;'>"
			body += "<div style='text-align:center;padding-top: 20px;'><img style='width: 141px; margin: 0 20px;' src='https:\/\/team-labyoke.herokuapp.com\/images\/yoke4.png', alt='The Yoke',  title='Yoke', class='yokelogo'/></div><div style=\"font-family:'calibri'; font-size:11pt;padding: 20px;\">" + i18n.__({phrase: "index.orders.hello", locale: userlang}) + ",<br/><br/>";
			//body += "Unfortunately your order has been cancelled due to insufficient quantities from the following inventory:" + " <br><b>Reagent: </b> " + agent;
			body += i18n.__({phrase: "index.fulfilled.not.body1", locale: userlang}) + " <br><b>" + i18n.__({phrase: "index.orders.reagent", locale: userlang}) + ": </b> " + agent;
			body += "<br><b>" + i18n.__({phrase: "index.orders.vendor", locale: userlang}) + ": </b> " + vendor;
			body += "<br><b>" + i18n.__({phrase: "index.orders.catalog", locale: userlang}) + ": </b> " + catalognumber;
			body += "<br><b>" + i18n.__({phrase: "index.orders.email", locale: userlang}) + ": </b> " + email;
			body += "<p>" + i18n.__({phrase: "index.orders.best", locale: userlang});
			body += "</p><b><i>" + i18n.__({phrase: "index.reportsShares.html7", locale: userlang}) + "</i></b></div>";
			body += "</div>";
			console.log("fulfill body: " + body);
			var mailOptions = new MailOptionsWithCC(requestor, subject, body, email);
			mailOptions.sendAllEmails();			
		}

		callback(null, results);
	});
//callback(null, results);
};


/*LabyokerUserDetails.prototype.changesurname = function(callback) {
	var surname = this.placeholder;
	var results;
	var query = client.query("UPDATE vm2016_users SET surname='" + surname
			+ "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results);
	});
};

LabyokerUserDetails.prototype.changetel = function(callback) {
	var tel = this.placeholder;
	var results;
	var query = client.query("UPDATE vm2016_users SET tel='" + tel
			+ "'");
	query.on("row", function(row, result) {
		result.addRow(row);
	});
	query.on("end", function(result) {
		results = result.rows;
		callback(null, results);
	});
};
*/

var analyze = function(matchresults, participantsResults) {
	for (var i = 0; i < participantsResults.length; i++) {
		var participant = participantsResults[i];
		var points = 0;
		var matchmargin = matchresults.scoretyp - matchresults.scorehemma;
		var participantmargin = participant.scoretyp - participant.scorehemma;
		var predictedteam = participant.predictedteam;
		var winner = matchresults.winner;

		if (predictedteam != winner) {
			points = 0;
		} else if (participant.scoretyp == matchresults.scoretyp
				&& participant.scorehemma == matchresults.scorehemma) {
			points = 6;
		} else if (predictedteam == winner && matchmargin == participantmargin
				&& matchresults.scorehemma != matchresults.scoretyp) {
			points = 4;
		} else if (predictedteam == winner
				|| (participant.scoretyp == matchresults.scoretyp && participant.scorehemma == matchresults.scorehemma)) {
			points = 3;
		}

		var email = participant.id;

		if (email.length == 4 || email.length == 2) {
			email += "@netlight.com";
		}
		var subject = "Your Prediction Results for - " + matchresults.typ
				+ " v " + matchresults.hemma;
		var body = "<div style=\"font-family:'calibri'; font-size:11pt\">Hello There,<br/><br/>";
		body += "Thanks for participating in the BrazilianLight tournament! Here is the result of the game:<br/>";
		body += "<p style=\"text-align:center\"><span style='font-size:20pt'><b>"
				+ matchresults.typ
				+ "</b></span> <span style='color:red; font-size:18pt'><b>"
				+ matchresults.scoretyp + "</b></span>";
		body += " v " + "<span style='color:red; font-size:18pt'><b>"
				+ matchresults.scorehemma
				+ "</b></span> <span style='font-size:20pt'><b>"
				+ matchresults.hemma + "</b></span></p>";
		body += "You predicted the score to be <b>" + participant.scoretyp
				+ ":" + participant.scorehemma + "</b>.";
		body += "<br/>You have earned: <span style='color:red'><b>" + points
				+ " points</b></span>.";
		body += "<br/><br/>Have you played today? Come and play with us again <a href=\"http:\/\/labyoke@gmail.com\">@BrazilianLight</a>";
		body += "<br/><br/><b><i>The BrazilianLight Team -</i></b></div>";

		var mailOptions = new MailOptions(email, subject, body);
		mailOptions.sendAllEmails();

		var results;
		var queryString = "UPDATE vm2014_predictsingleteam SET points = "
				+ points + " where bet = " + matchresults.bet + " and id = '"
				+ participant.id + "'";
		var query = client.query(queryString);
		query.on("row", function(row, result) {
			result.addRow(row);
		});
		query.on("end", function(result) {
			results = result.rows;
			return results;
		});
	}
}

exports.Labyoker = Labyoker;
exports.LabyokerUserDetails = LabyokerUserDetails;
exports.LabYokeReporterOrders = LabYokeReporterOrders;
exports.LabYokeAgents = LabYokeAgents;
exports.LabYokeSearch = LabYokeSearch;
exports.LabyokerRegister = LabyokerRegister;
exports.LabYokerGetOrder = LabYokerGetOrder;
exports.LabYokerOrder = LabYokerOrder;
exports.LabYokeFinder = LabYokeFinder;
exports.LabYokeUploader = LabYokeUploader;
exports.LabyokerPasswordChange = LabyokerPasswordChange;
exports.LabYokerChangeShare = LabYokerChangeShare;
exports.LabyokerConfirm = LabyokerConfirm;
exports.LabyokerInit = LabyokerInit;
exports.LabyokerLabs = LabyokerLabs;
exports.LabYokeReporterSavings = LabYokeReporterSavings;
exports.LabYokeReporterShares = LabYokeReporterShares;
exports.LabyokerTeam = LabyokerTeam;
exports.LabyokerLab = LabyokerLab;
exports.LabYokeGlobal = LabYokeGlobal;
exports.LabYokeTest = LabYokeTest;