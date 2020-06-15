const AWS = require('aws-sdk')
const { Agent } = require('http')

const resourceArn = 'arn:aws:rds:us-east-1:123456789012:cluster:dummy'
const secretArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:dummy'
const database = 'master'

const rds = new AWS.RDSDataService({
  database: 'master',
  accessKeyId: 'local-dummy-accesskey',
  secretAccessKey: 'local-dummy-accesskey',
  region: 'us-east-1',
  endpoint: 'http://127.0.0.7:8080',
  httpOptions: {
    agent: new Agent()
  }
})

;(async () => {
  try {
    const { transactionId } = await rds
      .beginTransaction({
        resourceArn,
        secretArn,
        database
      })
      .promise()

    // if you comment out this call
    // the commitTransaction() will fail
    await rds
      .executeStatement({
        sql: 'select now();',
        resourceArn: 'arn:aws:rds:us-east-1:123456789012:cluster:dummy',
        secretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:dummy',
        database,
        transactionId
      })
      .promise()

    await rds
      .commitTransaction({
        transactionId,
        resourceArn,
        secretArn
      })
      .promise()
  } catch (err) {
    console.log(err)
  }
})()
