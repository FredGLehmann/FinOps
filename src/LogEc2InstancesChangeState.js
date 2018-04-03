'use strict';

var aws = require('aws-sdk');
var elasticsearch = require('elasticsearch');

var myTag = ["Name", "Environment", "IT Owner", "Business Owner", "Support", "Role", "AppName", "Notes", "StopDailyTime", "StartDailytime", "OpeningDays", "KillDate", "Country", "Backup", "BillingCode", "DR"];


exports.handler = (event, context, callback) => {
    
    /* Get ElasticSearch connexion data from lambda var*/
    var mydata ={};
    mydata.body = {};
    mydata.index = process.env.elasticsearch_index;
    mydata.type = process.env.elasticsearch_type;
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    /* Get account number, region and event time */
    mydata.body.account=event.account;
    mydata.body.region=event.region;
    mydata.body.time=event.time;
    
    /* in events replace instance-id by instance id, because the "-" doesn't work well */
    var instancedetails = JSON.parse(JSON.stringify(event.detail).replace("-",""));
    /* get instance id and state*/
    mydata.body.instanceid = instancedetails.instanceid;
    mydata.body.instancestate = instancedetails.state;
    
    /* put instanceid in another JSON format for descrbeinstance function
     var params = {
  InstanceIds: [JSON.parse(JSON.stringify(data2.instanceid))]
 };*/
    var params ={};
    params.InstanceIds = [];
    params.InstanceIds[0] = instancedetails.instanceid;
    
    /* Get instance details (Type, Tags,...) */
    /* var ec2 = new aws.EC2({region: process.env.AWS_REGION});*/
    var ec2 = new aws.EC2({region: 'eu-west-1'});
    ec2.describeInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            /* get the instance type */
            mydata.body.instancetype = data.Reservations[0].Instances[0].InstanceType;

            /* get all the instance tags except all the unknown one*/
            for (var i=0;i<data.Reservations[0].Instances[0].Tags.length;i++) {
                for (var j=0;j<myTag.length;j++) {
                    if (String(data.Reservations[0].Instances[0].Tags[i].Key) === myTag[j]) {
                        mydata.body[data.Reservations[0].Instances[0].Tags[i].Key] = data.Reservations[0].Instances[0].Tags[i].Value;
                    }
                }
            }

            /* write the data send to ES in the log */
            console.log(mydata);
            
            var elasticclient = new elasticsearch.Client({
                hosts: [process.env.elasticsearch_endpoint]
            });
            /* Visibility test of our ElasticSearch Cluster */
            elasticclient.ping({requestTimeout: 30000,}, function(error) {
                if (error) {
                    console.error('Elasticsearch cluster is down !!');
                } else {
                    console.log('Elasticsearch cluster is reachable !!');
                    elasticclient.index(mydata, function(err,resp,status) {
                        if (err) console.log(err, err.stack);
                        else console.log("Index Status : ",resp);
                    });
                }
            });
        };
    });
    /*callback(null, 'Finished');*/
};