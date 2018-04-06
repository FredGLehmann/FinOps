var aws = require('aws-sdk');

var mydata ={};
mydata.body = {};

mydata.index = "INDEX";
mydata.type = "INDEX_TYPE";
    
    
mydata.body.account="ACCOUNT";
mydata.body.region="REGION";
mydata.body.time="TIME";
    
console.log(mydata);

mydata.body["account"]="ACCOUNT2";
mydata.body["region"]="REGION2";
mydata.body["time"]="TIME2";

console.log(mydata);