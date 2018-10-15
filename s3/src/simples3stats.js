
/* REQUIRE */
var aws = require('aws-sdk');

/* SOME VAR */
var StorageType = ["StandardStorage", "StandardIAStorage", "ReducedRedundancyStorage", "OneZoneIAStorage"];
var mydata = {};
mydata.body = {};
var totaldata = {};
totaldata.body = {};
var NbBucket = 0;
var TreatedBucket = 0;

/* SET AWS REGION   */
aws.config.update({region: 'eu-west-1'});

/* Let's Go     */
exports.handler = (event, context, callback) => {
    
    /* Initialize the totaldata var */
    for (var i in StorageType) {
        totaldata.body[StorageType[i]] = 0;
    }
    
    /* get bucket list */
    var s3 = new aws.S3();
    
    var params = {};
    s3.listBuckets(params, function(err, List) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            /* Get the size of each storage type */
            NbBucket = List.Buckets.length;
            console.log("Bucket(s) to analyze : ",NbBucket);
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
            if (cwdata.Datapoints == "" ) {
                //console.log("Volume à 00 : ",cwdata.Datapoints);
                mydata.body[StorageType[StorageTypeIndex]] = 0;
                if (StorageTypeIndex < StorageType.length-1) {
                    //console.log("Storagetype : ",StorageTypeIndex,"Suivant : ",StorageTypeIndex+1);
                    GetBucketSize(List,BucketNameIndex,StorageTypeIndex+1);
                    return;
                } else {
                    //console.log("Envoi des données");
                    SendBucketData(mydata.body["name"],mydata.body["Date"],mydata.body["StandardStorage"],mydata.body["StandardIAStorage"],mydata.body["ReducedRedundancyStorage"],mydata.body["OneZoneIAStorage"]);
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
                totaldata.body[StorageType[StorageTypeIndex]] = totaldata.body[StorageType[StorageTypeIndex]] + cwdata.Datapoints[0].Average;
                if (StorageTypeIndex < StorageType.length-1) {
                    //console.log("Storagetype : ",StorageTypeIndex,"Suivant : ",StorageTypeIndex+1);
                    GetBucketSize(List,BucketNameIndex,StorageTypeIndex+1);
                    return;
                } else {
                    //console.log("Envoi des données");
                    SendBucketData(mydata.body["name"],mydata.body["Date"],mydata.body["StandardStorage"],mydata.body["StandardIAStorage"],mydata.body["ReducedRedundancyStorage"],mydata.body["OneZoneIAStorage"]);
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
function SendBucketData(name,date,StandardStorage,StandardIAStorage,ReducedRedundancyStorage,OneZoneIAStorage) {
    
    /* console.log(name,"Std :",StandardStorage,"- StdIA :",StandardIAStorage,"- Rrs :",ReducedRedundancyStorage,"- OnezoneIA :",OneZoneIAStorage);*/
    
    totaldata.body["StandardStorage"] = totaldata.body["StandardStorage"] + StandardStorage;
    totaldata.body["StandardIAStorage"] = totaldata.body["StandardIAStorage"]  + StandardIAStorage;
    totaldata.body["ReduceRedundancyStorage"] = totaldata.body["ReducedRedundancyStorage"] + ReducedRedundancyStorage;
    totaldata.body["OneZoneIAStorage"] = totaldata.body["OneZoneIAStorage"] + OneZoneIAStorage;
    
    /*console.log("Increment total - S3Standard :",totaldata.body["StandardStorage"],"- S3StandardIA :",totaldata.body["StandardIAStorage"],"- S3ReducedRedundancy :",totaldata.body["ReduceRedundancyStorage"],"- OnezoneIAStorage :",totaldata.body["OneZoneIAStorage"]);*/
    
    TreatedBucket = TreatedBucket + 1;
    /*console.log("nb de bucket traité : ",TreatedBucket);*/

    /* If all the buckets are analyzed, we publish the total amount of data */
    if (TreatedBucket == NbBucket) {
        
        /* For readable log, we transfrom bytes values in gigabytes and round to 2 digits */
         for (var i in StorageType) {
            totaldata.body[StorageType[i]] = totaldata.body[StorageType[i]]/1024/1024/1024;
            totaldata.body[StorageType[i]] = totaldata.body[StorageType[i]].toFixed(2);
        }
        
        /* and then publish it */
        console.log("Total data amount (in Gigabytes) - S3Standard :",totaldata.body["StandardStorage"],"- S3StandardIA :",totaldata.body["StandardIAStorage"],"- S3ReducedRedundancy :",totaldata.body["ReducedRedundancyStorage"],"- OnezoneIAStorage :",totaldata.body["OneZoneIAStorage"]);
    }
}