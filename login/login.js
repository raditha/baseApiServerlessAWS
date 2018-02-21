'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const JWT_EXPIRATION_TIME = '5m';
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.login = (event, context, callback) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: data.phone,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the todo item.'));
      return;
    }
    if(result.Item.password ==data.password){

      // Issue JWT
      const token = jwt.sign( {data:result.Item} , process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
      console.log(`JWT issued: ${token}`);
      const loggedInObj = {
        token:token,
        userId:result.Item.id,

      };
      const response = { // Success response
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          loggedInObj,
        }),
      };
  
      // Return response
      console.log(response);
      callback(null, response);
        

    }else{

      const response = { // Error response
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          
        }),
      };
      callback(null, response);
    }
     
   
  });
};
