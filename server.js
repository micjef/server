//import depedencies
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import Pusher from 'pusher'

import mongoMessages from './messageModel.js'

//app config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: '1085659',
  key: '29566954f7637744fecc',
  secret: '8f553384f2e842d4adf6',
  cluster: 'ap1',
  useTLS: true
})

//midleware
app.use(express.json())
app.use(cors())

//db config
//WgQVaKee0vr8m2Zg
const mongoURI = 'mongodb+srv://admin:WgQVaKee0vr8m2Zg@cluster0.vi27s.mongodb.net/bujangDB?retryWrites=true&w=majority'
mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('db connected');

  const changeStream = mongoose.connection.collection('messages').watch()
  changeStream.on('change', (change) => {
    pusher.trigger('messages', 'newMessage', {
      'change': change
    })
  })
})

//api route
app.get('/', (req, res) => res.status(200).send('hello jeffry'))

app.post('/save/messages', (req, res) => {
  const dbMessage = req.body

  mongoMessages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })
})

app.get('/retrieve/conversation', (req, res) => {
  mongoMessages.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      data.sort((b, a) => {
        return b.timestamp - a.timestamp
      })

      res.status(200).send(data)
    }
  })
})

//lsten
app.listen(port, (req, res) => console.log(`listening on http://localhost:${port}`))