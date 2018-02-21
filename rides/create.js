'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  if (typeof data.text !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create the ride.'));
    return;
  }

  const params = {
    TableName: 'rides',
    Item: {
      id: uuid.v1(),
      user:data.phone,
      text: data.text,
	    pickup:data.pickup,
	    dropoff:data.dropoff,
	    departureTime:data.departureTime,
	    stops:data.stops,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the ride to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the ride.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
