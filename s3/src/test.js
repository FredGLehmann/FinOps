var aws = require('aws-sdk');
aws.config.update({region: 'eu-west-1'});

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
            Value: 'zohir-bouzid-transdev'
        },
        {
            Name: 'StorageType',
            Value: 'StandardStorage'
        },
    ],
    Statistics: [
        'Average',
    ],
    //Unit: 'Bytes'
};

cw.getMetricStatistics(cwparams, function(err, cwdata) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
        if (cwdata.Datapoints == "" ) {
            //console.log("0");           // successful response
            console.log("Size : ",0)
        } else {
            //console.log(cwdata.Datapoints[0].Average);           // successful response
            console.log("Size : ",cwdata.Datapoints[0].Average)
        }
    }
});
  