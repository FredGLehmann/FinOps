'use strict';

var aws = require('aws-sdk');
var mydata = {};
mydata.bucket = {};
/*var elasticsearch = require('elasticsearch');*/

exports.handler = (event, context, callback) => {
    
    /* Get ElasticSearch connexion data from lambda var*/
    var elasticdata ={};
    elasticdata.body = {};
    elasticdata.index = process.env.elasticsearch_index;
    elasticdata.type = process.env.elasticsearch_type;
    
    /* get bucket list */
    var params = {};
    
    /* Get instance details (Type, Tags,...) */
    /* var ec2 = new aws.EC2({region: process.env.AWS_REGION});*/
    var s3 = new aws.S3();
    
    s3.listBuckets(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            for (var i=0;i<data.Buckets.length;i++) {
                console.log(i," : ",data.Buckets[i].Name);
                mydata.bucket["name"] = data.Buckets[i].Name;
                
                var cw = new aws.CloudWatch();
                var cwparams = {
                    MetricName: 'BucketSizeBytes',
                    Namespace: 'AWS/S3',
                    StartTime: new Date,
                    EndTime: new Date,
                    Period: 500,
                    Dimensions: [
                        {
                            Name: 'BucketName',
                            Value: data.Buckets[i].Name
                        },
                        {
                            Name: 'StorageTYpe',
                            Value: 'StandardStorage'
                        },
                    ],
                    Statistics: [
                        'Average',
                    ],
                    Unit: 'Gigabytes'
                };
                cw.getMetricStatistics(cwparams, function(err, cwdata) {
                    if (err) console.log(err, err.stack); // an error occurred
                else     console.log(cwdata);           // successful response
                });
            }
        }
    });
};