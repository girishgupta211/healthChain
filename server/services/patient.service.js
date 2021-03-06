'use strict'

var Patients = require('./../models/patients.model'),
	mongoose = require('mongoose'),
	Schedules = require('./../models/schedules.model'),
	PrescriptionLogs = require('./../models/prescriptionLogs.model'),
	MedicineLogs = require("./../models/medicineLogs.model")


var PatientService = function(){
//exports.TransactionService = function(){
	var _self = this;

	_self.savePatient = function(txId,patientId,name,address,dob,bloodGroup,mobileNo,cb){		
		Patients.create({
			transactionId : txId,
			patientId : patientId,
			name : name,
			address : address,
			dob : dob,
			mobileNo : mobileNo,
			bloodGroup : bloodGroup
		}, function(err, patient) {
			console.log("Error : "+err, "Patient : "+JSON.stringify(patient));
			if(err) { return cb({error : true, message : err}) };
			return cb({error : false, message : "Patient Added Successfully"});
		});
	}

	_self.addPrescription = function(patientId, prescription,cb){
		Patients.update({patientId:patientId}, {prescription:prescription}, function(err, resp){
			if(err)
				return cb({error : true, message : err}) 
			else
				cb({error : false, message : "Prescription added for user"});
		})
	}
	/*With paginations*/
	_self.getPatients = function(skipRows,limit,cb){		
		var cursor = Patients.find();
		cursor.skip(skipRows).limit(limit)
			.then(function callback(result){				
				return cb({"success":"true","data":result});
			});
	}

	/*_self.getSchedule = function(patientId,cb){
		var query = {patientId: patientId};
		//sort({_id:-1}).limit(1)
		//Schedules.findOne(query, function(err, result){
		Schedules.findOne(query, function(err, result){
			if(err){
				return cb({success : false, message : "Unable to get schedules"});
			}
			else{
				return cb({success : true, data:result._doc});
			}
		});
	}*/

	_self.getSchedule = function(patientId,fromDatecb){
		var query = {patientId: patientId};
		//db.market.find({}).sort({_id:-1}).limit(1)
		Schedules.find(query, function(err, res){
			if(err)
				return cb({success : false, message : "Unable to get schedules"});
			else
				return cb({success : true, data:res});
		});
	}

	/* With optional param*/
	/*_self.getAllTransactions = function(skipRows,limit,status,cb){
		var query = status ? {status:status} :{};
		var cursor = Transaction.find(query);
		cursor.skip(skipRows).limit(limit)
			.then(function callback(result){				
				return cb({"success":"true","data":result});
			});
	}*/////create a calander for each prescriptionIdcreate a calander for each prescriptionId

	_self.addSchedule = function(patientId,medicineName,fromDate,tillDate,timesADay,cb){
		var dateDiff = new Date(tillDate).getTime() - new Date(fromDate).getTime();
		var noOfRecords = dateDiff/(1000*60*60*24);
		var date = new Date(fromDate);
		for(var i=0; i<=noOfRecords; i++){
			//create record with pending status and increasing date
			for(var j=0; j<timesADay; j++ ){
				Schedules.create({
				patientId : patientId,
				medicineName: medicineName,
				date : date,
				time : j,
				status: 'pending'
			}, function(err, patient) {
				console.log("Error : "+err, "Schedule : "+JSON.stringify(patient));
				if(err) { return cb({error : true, message : err}) };
				return cb({error : false, message : "Schedule Added Successfully"});
			});
			}
			//date = new Date(date).getDate()+i;
			var date1 = date.getTime()+(24*60*60*1000);
			date = new Date(date1);
		}
	}

	_self.updateMedicineTakeStatus = function(patientId, medicineName,date, time, status,cb){
		var query = {'patientId':patientId, 'date':date, 'medicineName':medicineName, 'time':time};
		//Patients.update({patientId:patientId}, {prescription:prescription}, function(err, resp){
		
		Schedules.update(query,{'status':status},function(err,resp){
			if(err)
				return cb({error : true, message : err}) 
			else
				cb({error : false, message : "Status updated Successfully"});
		});
	}

	_self.addPrescriptionLog = function(patientId, prescription,cb){
		PrescriptionLogs.create({
			patientId:patientId,
			prescription:prescription}, 
			function(err, res) {
			console.log("Error : "+err, "PrescriptionLogs : "+JSON.stringify(res));
				if(err) { return cb({error : true, message : err}) };
				return cb({error : false, message : "PrescriptionLog Added Successfully"});
		});
	}

	_self.getPrescriptionLog = function(patientId, cb){
		var query = patientId ? {'patientId':patientId} : '';
		PrescriptionLogs.find(query, function(err, res){
			if(err)
				return cb({success : false, message : "Unable to get PrescriptionLogs"});
			else
				return cb({success : true, data:res});

		});
	}

	_self.countRecords = function(cb){		
		Patients.count({}, function(err, result){
			if(err){
				return cb({success : false, message : "Unable to get Transaction count"});
			}
			else{
				return cb({success : true, data:result});
			}
		});
	}

	_self.addMedicineLogs = function(patientId, medicineName, date,time, status,cb){
		MedicineLogs.create({
			patientId : patientId,
			medicineName: medicineName,
			date:date,
			time:time,
			status:status
		}, function(err, res) {
			console.log("Error : "+err, "Response form db : "+JSON.stringify(res));
			if(err) { return cb({error : true, message : err}) };
			return cb({error : false, message : "Medicine Log Added Successfully"});
		});
	}


	return {
		"savePatient" : _self.savePatient,
		"addPrescription" : _self.addPrescription,
		"getPatients" : _self.getPatients,
		"countRecords" : _self.countRecords,
		"addSchedule": _self.addSchedule,
		"getSchedule": _self.getSchedule,
		"addPrescriptionLog": _self.addPrescriptionLog,
		"getPrescriptionLog": _self.getPrescriptionLog,
		"updateMedicineTakeStatus": _self.updateMedicineTakeStatus,
		"addMedicineLogs": _self.addMedicineLogs
	}
}

/*exports.getAllTransactions = function(){
	var _self = this;
	_self.

};*/

module.exports = new PatientService();