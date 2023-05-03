let express = require('express');
const path = require('path');
let mongoose = require('mongoose');
let cors = require('cors');
// let dbConfig = require('./config/db');
require('dotenv').config();

// Express Route
const groupRoute = require('./routes/group.route')
const userRoute = require('./routes/user.route')
const categoryRoute = require('./routes/category.route')
const questionRoute = require('./routes/question.route')

// Configure mongoDB Database
//mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);
mongoose.set('strictQuery', false);

// Connect MongoDB
const connectDB = require('./config/db');
connectDB(process.env.MY_MONGO_URI);

// Connecting MongoDB Database
mongoose.Promise = global.Promise;
// mongoose.connect(dbConfig.db).then(() => {
//     console.log('Database successfully connected!')
// },
//     error => {
//         console.log('Could not connect to database : ' + error)
//     }
// )

const app = express();

app.use(express.json({ extended: false })); //Used to parse JSON bodies
app.use(express.urlencoded({extended: true})); //Parse URL-encoded bodies
app.use(cors());

app.use('/api/groups', groupRoute)
app.use('/api/users', userRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/questions', questionRoute)

// TEST ROUTE
app.use('/api/test', (req, res)=>{
    console.log("/test request called");
    res.send('Welcome to GeeksforGeeks');
})

//* Serve static assets in production, must be at this location of this file
if (process.env.NODE_ENV === 'production') {
    //*Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')));
}


// PORT
const port = process.env.REACT_APP_PORT || 5000;
const server = app.listen(port, () => {
    console.log('Connected to port ' + port)
})

// 404 Error
app.use((req, res, next) => {
    res.status(404).send('Error 404!')
});

app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});
