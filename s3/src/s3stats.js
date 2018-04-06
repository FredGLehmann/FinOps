
/* REQUIRE */
var aws = require('aws-sdk');
var elasticsearch = require('elasticsearch');

/* SOME VAR */
var StorageType = ["StandardStorage", "StandardIAStorage", " ReducedRedundancyStorage", "AllStorageTypes"]
var mydata = {};
mydata.body = {};
var totaldata = {};
totaldata.body = {};

/* SET AWS REGION   */
aws.config.update({region: 'eu-west-1'});

/* Let's Go     */
exports.handler = (event, context, callback) => {
    
    console.log("HOST : ",process.env.elasticsearch_endpoint);
    
    /* init the total tab */
    InitTotaldata();
    
    /* include Elasticsearch data in the JSON var   */
    PutEsData;
    
    /* get bucket list */
    var s3 = new aws.S3();
    
    var params = {};
    s3.listBuckets(params, function(err, List) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            /* for each bucket get its name */
            for (var i=0;i<List.Buckets.length;i++) {
                //console.log(i," : ",List.Buckets[i].Name);
                mydata.body["name"] = List.Buckets[i].Name;
                
                /* for each bucket get's the data volume for each storage type */
                for (var j=0;j<StorageType.length;j++) {
                    GetBucketSize(mydata.body["name"],StorageType[j]);
                }
                
                /* Spend some times t be sure that the data are available*/
                for (var k=0;k<50;k++) {
                    console.log(".");
                }
                
                /* send the data to ES  */
                SendBucketData;
            }
        }
    });
    /* Send the data for all the stage  */
    SendTotalData();
    
};


function InitTotaldata() {
    totaldata.body["name"] == "TOTAL_" + process.env.STAGE;
    
    for (var j=0;j<StorageType.length;j++) {
        totaldata.body[StorageType[j]]=0
    }
}

/* Get the bucket size                          */
/* In : the bucketname  and Storage Type        */
/* Mydata completed                             */
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
                mydata.body[StorageType] = 0;
            } else {
                //console.log(cwdata.Datapoints[0].Average);           // successful response
                mydata.body[StorageType] = cwdata.Datapoints[0].Average;
                total.body[StorageType] = total.body[StorageType] + cwdata.Datapoints[0].Average;
            }
        }
    });
}

/* Integration of Index and Index type data     */
/* in the JSON variable                         */
function PutEsData() {
    mydata.index = process.env.elasticsearch_index;
    mydata.type = process.env.elasticsearch_type;
    totaldata.index = process.env.elasticsearch_index;
    totaldata.type = process.env.elasticsearch_type;
}

/* Send the JSON bucket data to Elasticsearch          */
function SendBucketData() {
    
    var elasticclient = new elasticsearch.Client({
        hosts: [process.env.elasticsearch_endpoint]
    });
    
    /* Visibility test of our ElasticSearch Cluster */
    elasticclient.ping({requestTimeout: 30000,}, function(error) {
        if (error) {
            console.error('Elasticsearch cluster is down !!');
        } else {
            console.log('Elasticsearch cluster is reachable !!');
            console.log(mydata);
            //elasticclient.index(mydata, function(err,resp,status) {
            //    if (err) console.log(err, err.stack);
            //    else console.log("Index Status : ",resp);
            //});
        }
    });
}

/* Send the JSON total data to Elasticsearch          */
function SendTotalData() {
    
    var elasticclient2 = new elasticsearch.Client({
        hosts: [process.env.elasticsearch_endpoint]
    });
    
    /* Visibility test of our ElasticSearch Cluster */
    elasticclient2.ping({requestTimeout: 30000,}, function(error) {
        if (error) {
            console.error('Elasticsearch cluster is down !!');
        } else {
            console.log('Elasticsearch cluster is reachable !!');
            console.log(totaldata);
            //elasticclient2.index(totaldata, function(err,resp,status) {
            //    if (err) console.log(err, err.stack);
            //    else console.log("Index Status : ",resp);
            //});
        }
    });
}