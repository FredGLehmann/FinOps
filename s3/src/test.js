var aws = require('aws-sdk');

var mydata ={};
//var index = "bucket"
mydata["bucket"] = [];

//mydata.index = "INDEX";
//mydata.type = "INDEX_TYPE";
    
    
//mydata.body.account="ACCOUNT";
//mydata.body.region="REGION";
//mydata.body.time="TIME";
    
//console.log(mydata);

//mydata.body["account"]="ACCOUNT2";
//mydata.body["region"]="REGION2";
//mydata.body["time"]="TIME2";

//console.log(mydata);

var data = {
    name: 'TOTO',
    StandardStorage: " 1000"
};

var data2 = {
        name: "TATA",
        StandardStorage: "5000"
};

mydata["bucket"].push(data);
mydata["bucket"].push(data2);

console.log(mydata);


if (typeof mydata.bucket[2] != 'undefined') {
    console.log(mydata.bucket[2]);
}