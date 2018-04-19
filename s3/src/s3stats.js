
/* REQUIRE */
var aws = require('aws-sdk');
var elasticsearch = require('elasticsearch');

/* SOME VAR */
var StorageType = ["StandardStorage", "StandardIAStorage", "ReducedRedundancyStorage"]
var toto = ["zohir-bouzid-transdev", "cloud.transdevlabs.net-email"]
var mydata = {};
mydata.body = {};
var totaldata = {};
totaldata.body = {};

/* SET AWS REGION   */
aws.config.update({region: 'eu-west-1'});

/* Let's Go     */
exports.handler = (event, context, callback) => {
    
    /* get bucket list */
    var s3 = new aws.S3();
    
    var params = {};
    s3.listBuckets(params, function(err, List) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            /* Get the size of each storage type */
            GetBucketSize(List.Buckets,0,0);
        }
    });
};



/* Get the bucket size                          */
/* In : the bucketname  and Storage Type        */
/* Mydata completed                             */
function GetBucketSize(List,BucketNameIndex,StorageTypeIndex) {
    
    mydata.body["name"] = List[BucketNameIndex].Name;
    //console.log("Bucket : ",mydata.body["name"],"Type : ",StorageTypeIndex);
    
    var startdate = new Date (new Date - 259200000);
    mydata.body["Date"] = new Date (new Date - 172800000);

    var cw = new aws.CloudWatch();
    var cwparams = {
        MetricName: 'BucketSizeBytes',
        Namespace: 'AWS/S3',
        StartTime: startdate,
        EndTime: mydata.body["Date"],
        Period: 7200,
        Dimensions: [
            {
                Name: 'BucketName',
                Value: mydata.body["name"]
            },
            {
                Name: 'StorageType',
                Value: StorageType[StorageTypeIndex]
             },
        ],
        Statistics: [
            'Average',
        ],
    };

    cw.getMetricStatistics(cwparams, function(err, cwdata) {
        //console.log("CallBack - ",mydata.body["name"],StorageType[StorageTypeIndex]);
        if (err) {
            console.log("ERROR !!!");
            console.log(err, err.stack); // an error occurred
        }
        else {
            if (cwdata.Datapoints == "" ) {
                //console.log("Volume à 00 : ",cwdata.Datapoints);
                mydata.body[StorageType[StorageTypeIndex]] = 0;
                if (StorageTypeIndex < StorageType.length-1) {
                    //console.log("Storagetype : ",StorageTypeIndex,"Suivant : ",StorageTypeIndex+1);
                    GetBucketSize(List,BucketNameIndex,StorageTypeIndex+1);
                    return;
                } else {
                    //console.log("Envoi des données");
                    SendBucketData(mydata.body["name"],mydata.body["Date"],mydata.body["StandardStorage"],mydata.body["StandardIAStorage"],mydata.body["ReducedRedundancyStorage"],mydata.body["AllStorageTypes"]);
                    if (BucketNameIndex < List.length-1) {
                        //console.log("Bucket suivant");
                        mydata.body = {};
                        GetBucketSize(List,BucketNameIndex+1,0);
                    }
                    return;
                }
            } else {
                //console.log("Volume différent de 00 : ",cwdata.Datapoints);
                mydata.body[StorageType[StorageTypeIndex]] = cwdata.Datapoints[0].Average;
                if (StorageTypeIndex < StorageType.length-1) {
                    //console.log("Storagetype : ",StorageTypeIndex,"Suivant : ",StorageTypeIndex+1);
                    GetBucketSize(List,BucketNameIndex,StorageTypeIndex+1);
                    return;
                } else {
                    //console.log("Envoi des données");
                    SendBucketData(mydata.body["name"],mydata.body["Date"],mydata.body["StandardStorage"],mydata.body["StandardIAStorage"],mydata.body["ReducedRedundancyStorage"]);
                    if (BucketNameIndex < List.length-1) {
                        //console.log("Bucket suivant");
                        mydata.body = {};
                        GetBucketSize(List,BucketNameIndex+1,0);
                    }
                    return;
                }
            }
        }
    });
}

/* Send the JSON bucket data to Elasticsearch          */
function SendBucketData(name,date,StandardStorage,StandardIAStorage,ReducedRedundancyStorage) {
    
    var esdata = {};
    esdata.body = {};
    
    esdata.index = process.env.elasticsearch_index;
    esdata.type = process.env.elasticsearch_type;
    esdata.body["name"] = name;
    esdata.body["stage"] = process.env.STAGE;
    esdata.body["date"] = date;
    esdata.body["StandardStorage"] = StandardStorage;
    esdata.body["StandardIAStorage"] = StandardIAStorage;
    esdata.body["ReducedRedundancyStorage"] = ReducedRedundancyStorage;
    
    var elasticclient = new elasticsearch.Client({
        hosts: [process.env.elasticsearch_endpoint]
    });
    console.log("Sending data for",esdata.body["name"],"at :",esdata.body["date"]);
    
    /* Visibility test of our ElasticSearch Cluster */
    elasticclient.ping({requestTimeout: 30000,}, function(error) {
        if (error) {
            console.error('Elasticsearch cluster is down !!');
        } else {
            console.log('Elasticsearch cluster is reachable !!');
            elasticclient.index(esdata, function(err,resp,status) {
                if (err) console.log(err, err.stack);
                else console.log("Data sended");
            });
        }
    });
}