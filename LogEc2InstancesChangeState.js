'use strict';

var aws = require('aws-sdk');
var elasticsearch = require('elasticsearch');

var myTag = ["Name", "Environment", "IT Owner", "Business Owner", "Support", "Role", "AppName", "Notes", "StopDailyTime", "StartDailytime", "OpeningDays", "KillDate", "Country", "Backup", "BillingCode", "DR"];

var ESIndex = {"index":{"_index": "EC2StartStopLogs","_type":"EC2StartStopLog","_id":1}};


exports.handler = (event, context, callback) => {
    console.log('LogEC2InstanceStateChange');
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    /* replace instance-id by instance id, because the "-" doesn't work well */
    var instancedetails = JSON.parse(JSON.stringify(event.detail).replace("-",""));
    
    /* get instanceid and instance state and put them in JSON format */
    var instancestate = {InstanceState: JSON.parse(JSON.stringify(instancedetails.state))};
    var instanceid = {InstanceId: JSON.parse(JSON.stringify(instancedetails.instanceid))};
    
    /* beginning the construction of our JSON data */
    var mydata = (JSON.stringify(instanceid) + JSON.stringify(instancestate)).replace(/}{/i, ",");
    
    /* put instanceid in another JSON format for descrbeinstance function */
    var params = {
        InstanceIds: [JSON.parse(JSON.stringify(instancedetails.instanceid))]
    };
    /* Get instance details (Type, Tags,...) */
    /* var ec2 = new aws.EC2({region: process.env.AWS_REGION});*/
    var ec2 = new aws.EC2({region: 'eu-west-1'});
    ec2.describeInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            /* get the instance type */
            mydata = (mydata + JSON.stringify({ InstanceType : data.Reservations[0].Instances[0].InstanceType })).replace(/}{/i, ",");
   
            /* get all the instance tags except all the unknown one*/
            for (var i=0;i<data.Reservations[0].Instances[0].Tags.length;i++) {
                for (var j=0;j<myTag.length;j++) {
                    if (String(data.Reservations[0].Instances[0].Tags[i].Key) === myTag[j]) {
                        mydata = (mydata + JSON.stringify({ [data.Reservations[0].Instances[0].Tags[i].Key] : data.Reservations[0].Instances[0].Tags[i].Value })).replace(/}{/i, ",");
                    }
                }
            }

        /* last check for wired separator */
        mydata = mydata.replace(/}{/i, ",");
        /* put the ElasticSerach index information*/
        mydata = (JSON.stringify(ESIndex) + mydata);
        /* print them for debug */
        console.log(mydata);
        } 
    });
    
    var elasticclient = new elasticsearch.Client({
        hosts: [process.env.elasticsearch_endpoint]
    });
    /* Visibility test of our ElasticSearch Cluster */
    elasticclient.ping({
        requestTimeout: 30000,
    }, function(error) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('Everything is ok');
        }
    });
 
    callback(null, 'Finished');
};