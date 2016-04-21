# service-core
Stop tying your applications to a specific protocol. Write once, call from anywhere.

###Example:

For some silly reason, you need to build a web application that allows basic math calculations via HTTP.

You start simply, using express:

```javascript

import express from 'express'

const server = express()

server.get('/add/:x/:y', (req, res) => {
  res.send(req.params.x + req.params.y)
})

server.get('/subtract/:x/:y', (req, res) => {
  res.send(req.params.x - req.params.y)
})

server.get('/multiply/:x/:y', (req, res) => {
  res.send(req.params.x * req.params.y)
})

server.get('/divide/:x/:y', (req, res) => {
  if (req.params.y === 0) return res.status(500).send('NO.')
  res.send(req.params.x / req.params.y)
})

server.listen(3000)
```

Now, someone suggests you should be prepared to handle huge numbers and more advanced calculations,
and you are starting to suspect that running this on a single-thread is a bad idea. Let's move 
this functionality over to a worker, maybe AWS Lambda, or Azure Functions, or IronWorker, etc.

We have some obvious problems here. First, our "application" is specifically an express-based web application.
It is all mixed into the HTTP handling, and while we could easily break out our fancy calculations to some independent module 
with a fancy new API for things like `.add(1, 1)`, etc, we still don't solve the issue of dispatching in a non-HTTP based environment.

The answer, it seems, is to _dispatch off of the incoming data_.

Instead of HTTP requests like:
`GET /add/1/1`

Try:
`{ "action": "add", "x": 1, "y": 1 }`

Now, this object can be sent into any system and dispatched using some basic pattern-matching.

...in progress.
