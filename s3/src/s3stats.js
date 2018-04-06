'use strict';

var aws = require('aws-sdk');
aws.config.update({region: 'eu-west-1'});

var StorageType = ["StandardStorage", "StandardIAStorage", " ReducedRedundancyStorage", "AllStorageTypes"]

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
    
    s3.listBuckets(params, function(err, List) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            for (var i=0;i<List.Buckets.length;i++) {
                //console.log(i," : ",List.Buckets[i].Name);
                mydata.bucket["name"] = List.Buckets[i].Name;
                
                for (var j=0;j<StorageType.length;j++) {
                    GetBucketSize(List.Buckets[i].Name,StorageType[j])
                }
                for (var k=0;k<5;k++) {
                    console.log(".");
                }
                //console.log(mydata.bucket);
                //console.log(mydata.bucket["name"]," / ",mydata.bucket["size"])
            }
        }
    });
};


/* Get the bucket size          */
/* In : the bucketname          */
/* Out : the bucket size in Go  */
function GetBucketSize(BucketName,StorageType) {
    
    var startdate = new Date (new Date - 259200000);
    var enddate = new Date (new Date - 172800000);

    
    var cw = new aws.CloudWatch();
    var cwparams = {
        MetricName: 'BucketSizeBytes',
        Namespace: 'AWS/S3',
        StartTime: startdate,
        EndTime: enddate,
        Period: 7200,
        Dimensions: [
            {
                Name: 'BucketName',
                Value: BucketName
            },
            {
                Name: 'StorageType',
                Value: StorageType
             },
        ],
        Statistics: [
            'Average',
        ],
    };
    //console.log (cwparams);
    cw.getMetricStatistics(cwparams, function(err, cwdata) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if (cwdata.Datapoints == "" ) {
                //console.log("0");           // successful response
                mydata.bucket[StorageType] = 0;
                console.log(BucketName," / ",StorageType,":",0)
            } else {
                //console.log(cwdata.Datapoints[0].Average);           // successful response
                mydata.bucket[StorageType] = cwdata.Datapoints[0].Average;
                console.log(BucketName," / ",StorageType,":",mydata.bucket[StorageType])
            }
        }
    });
}