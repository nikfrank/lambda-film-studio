exports.handler = (event, context)=>{
  
  context.done(null, {
    "statusCode": 200,
    "headers":{
      "Content-Type": "text/html",
    },
    "body": require('fs').readFileSync('./build'+event.path).toString()
  });
}
