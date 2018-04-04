'use strict';

var aws = require('aws-sdk');
/*var elasticsearch = require('elasticsearch');*/

exports.handler = (event, context, callback) => {
    
    /* Get ElasticSearch connexion data from lambda var*/
    var mydata ={};
    mydata.body = {};
    mydata.index = process.env.elasticsearch_index;
    mydata.type = process.env.elasticsearch_type;
    
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
                mydata.body[bucket[i].name = data.Buckets[i].Name;
            }
        }
    });
};