const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');

const app = express();
app.use(bodyParser.json()); // parses application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

mongoose.connect(`${env.dev.dbPath}/reqresdb`,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  function (err) {
    if (err) {
      console.log(`db error occured: ${err}`);
    }
    else {
      console.log(`MongoDB connected successfully..`);
    }
  }
)

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hi you are requested to default endpoint');
});

app.use('/user', require('./routes/userRoutes'));

app.listen(env.dev.PORT, () => {
  console.log(`server is running on port: ${env.dev.PORT}`);
})