const jwt = require('jsonwebtoken');

const AUTH0_CLIENT_ID = 'ijdtDBv3N2lk2VcCmiUDbm5haXjJQZnR';
const AUTH0_CLIENT_SECRET = 'pXwu1xbovmd_OSDC-7vv0DHbu4bQQsu_1zMwEFC4Z6cluox1piU2KrzfW7wwZDab';

// Policy helper function
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const buildIAMPolicy = (userId, effect, resource, context) => {
  console.log(`buildIAMPolicy ${userId} ${effect} ${resource}`);
  const policy = {
    principalId: userId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };

  console.log(JSON.stringify(policy));
  return policy;
};



// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = (event, context, cb) => {
  if (event.authorizationToken) {
    // remove "bearer " from token
    const token = event.authorizationToken.substring(7);
    const options = {
    };
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        cb('Unauthorized');
      } else {
        const user = decoded.data;
        const userId=user.id;
        console.log(event.methodArn);
        console.log(user);
        const authorizerContext = { user: JSON.stringify(user) };
       //cb(null, generatePolicy(decoded.sub, 'Allow', event.methodArn));
        cb(null, buildIAMPolicy(userId, 'Allow', event.methodArn, authorizerContext));
      }
    });
  } else {
    cb('Unauthorized');
  }
};

// Public API
module.exports.publicEndpoint = (event, context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};

// Private API
module.exports.privateEndpoint = (event, context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};
