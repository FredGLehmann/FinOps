var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
   hosts: ['https://search-opstat-qe4k7okdqmzazjkuwhavu52nyi.eu-west-1.es.amazonaws.com']
});

module.exports = client;

client.ping({requestTimeout: 30000,}, function(error) {
     if (error) {
         console.error('Elasticsearch cluster is down !!');
     } else {
         console.log('Elasticsearch cluster is reachable !!');
         
        /*var client = require('./connection.json);*/
        client.cluster.health({},function(err,resp,status) {  
            console.log("-- Client Health --",resp);
        });
     }
 });