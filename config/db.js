// module.exports = {
//     db: 'mongodb://127.0.0.1:27017/reactdb'
// };


const mongoose=require('mongoose');
// const config=require('config');
// require('dotenv').config()

// const db=config.get('mongoURI');

//**PROTECT CREDS WITH THIS .ENV INSTEAD OF BRADS' DEFAULTJSON
 //const db = process.env.MY_MONGO_URI;
 //console.log('process.env.MY_MONGO_URI', db)

const connectDB = async(db)=>{
    try {
        await mongoose.connect(db);
        console.log('MongoDB is Connected...')
    } catch (err) {
        console.error(err.message);
        console.log('Check Your ENV VAR')
        process.exit(1)
    }
}
module.exports = connectDB;