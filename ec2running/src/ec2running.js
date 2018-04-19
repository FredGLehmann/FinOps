'use strict';

var aws = require('aws-sdk');
var elasticsearch = require('elasticsearch');

var myTag = ["Name", "Role", "AppName", "Notes", "ITOwner"];


exports.handler = (event, context, callback) => {
    
    /* Get ElasticSearch connexion data from lambda var*/
    var mydata ={};
    mydata.body = {};
    
    /* Get instance details (Type, Tags,...) */
    var ec2 = new aws.EC2({region: 'eu-west-1'});

    ec2.describeInstances(function(err, data) {
        if (err){ 
            console.log(err, err.stack);
        } else {
            
            for (var k in data.Reservations) {
                /* get the instance type */
                mydata.body.instancetype = data.Reservations[k].Instances[0].InstanceType;
                mydata.body.instanceid = data.Reservations[k].Instances[0].InstanceId;
                mydata.body.state = data.Reservations[k].Instances[0].State.Name;
                mydata.body.date = new Date;
                
                console.log("Instance : ",mydata.body.instanceid);
                
                /* get all the instance tags except all the unknown one*/
                for (var i=0;i<data.Reservations[k].Instances[0].Tags.length;i++) {
                    for (var j=0;j<myTag.length;j++) {
                        if (String(data.Reservations[k].Instances[0].Tags[i].Key) === myTag[j]) {
                            mydata.body[data.Reservations[k].Instances[0].Tags[i].Key] = data.Reservations[k].Instances[0].Tags[i].Value;
                        }
                    }
                }
                SendToEs(mydata);
                mydata = {};
                mydata.body = {};
            }
        }
    });
};

function SendToEs(data2send) {
    
    data2send.index = process.env.elasticsearch_index;
    data2send.type = process.env.elasticsearch_type;
    
    var elasticclient = new elasticsearch.Client({
        hosts: [process.env.elasticsearch_endpoint]
    });
    
    /* Visibility test of our ElasticSearch Cluster */
    elasticclient.ping({requestTimeout: 30000,}, function(error) {
        if (error) {
            console.error('Elasticsearch cluster is down !!');
        } else {
            console.log('Elasticsearch cluster is reachable !!');
            elasticclient.index(data2send, function(err,resp,status) {
                if (err) console.log(err, err.stack);
                else console.log("Index Status : ",resp);
            });
        }
    });
}
