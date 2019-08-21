exports.handler = (event, context)=>{
  
  event.path.match(/favicon.ico/) ? (
    context.done(null, {
      "statusCode": 200,
      "headers":{
        "Content-Type": 'image/x-icon',
      },
      "body": require('fs').readFileSync('./build'+event.path).toString('base64'),
      "isBase64Encoded": true,
    })
  ) : (
    context.done(null, {
      "statusCode": 200,
      "headers":{
        "Content-Type": ("text/" + (event.path.match(/\.css$/) ? 'css' : event.path.match(/\.js$/) ? 'javascript' : 'html')),
      },
      "body": require('fs').readFileSync('./build'+event.path).toString()
    })
  );
}
