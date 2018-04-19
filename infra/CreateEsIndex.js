var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
   hosts: ['https://search-opstat-qe4k7okdqmzazjkuwhavu52nyi.eu-west-1.es.amazonaws.com']
});

client.indices.create({  
  index: 'ec2running'
},function(err,resp,status) {
  if(err) {
    console.log(err);
  }
  else {console.log("create",resp);
  }
});

//client.indices.create({  
//  index: 's3stats'
//},function(err,resp,status) {
//  if(err) {
//    console.log(err);
//  }
//  else {
//    console.log("create",resp);
//  }
//});