var aws = require('aws-sdk');

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
            Value: 'web-transparence'
        },
        {
            Name: 'StorageType',
            Value: 'StandardStorage'
         },
    ],
    Statistics: [
        'Average',
    ],
    /* Theorically we can use other units, but only bytes works */
    Unit : 'Bytes'
};

cw.getMetricStatistics(cwparams, function(err, cwdata) {
    //console.log("CallBack - ",mydata.body["name"],StorageType[StorageTypeIndex]);
    if (err) {
        console.log("ERROR !!!");
        console.log(err, err.stack); // an error occurred
    }
    else {
        console.log(cwdata.Datapoints);
    }
})