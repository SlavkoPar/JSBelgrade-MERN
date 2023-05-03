// SEED FILE CONNECT TO MONGODB ON ITS OWN
// *RUN  node seeds/group-seeds.js from the same level as the server or .env variables ===undefined

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Schema must match the seed
const Group = require('../models/Group');
const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');

//**PROTECT CREDS WITH THIS .ENV INSTEAD OF BRADS' DEFAULTJSON
require('dotenv').config();
const db = process.env.MY_MONGO_URI;
console.log ('--->', {db})

// STAND ALONE CONNECTION TO DB;
mongoose
  .connect(db)
  .then(() => console.log('mongodb SEED connection success'))
  .catch((error) => console.log(error));

// MOCK DATA
const seedGroups = [
  {
    groupName: 'Owner',
    level: 1,
    parentGroup: null,
    created: {
      date: new Date(),
      by: {
        userId: '63f79a7ed73fa58fba7487fe'
      }
    }
  },
  {
    groupName: 'Admins',
    level: 1,
    parentGroup: null,
    created: {
      date: new Date(),
      by: {
        userId: '63f79a7ed73fa58fba7487fe'
      }
    }
  },
  {
    groupName: 'Editors',
    level: 1,
    parentGroup: null,
    created: {
      date: new Date(),
      by: {
        userId: '63f79a7ed73fa58fba7487fe'
      }
    }
  },
  {
    groupName: 'Viewers',
    level: 1,
    parentGroup: null,
    created: {
      date: new Date(),
      by: {
        userId: '63f79a7ed73fa58fba7487fe'
      }
    }
  }
];


//   seeding function
const seedDB = async () => {
  // deletes any existing collections before seeding
  // await User.deleteMany({});
  // await User.insertMany([{
  //   _id: '63f79a7ed73fa58fba7487fe',
  //   userName: 'SuperUser',
  //   password: "",
  //   parentGroup: null,
  //   email: 'slavko.parezanin@gmail.com',
  //   role: 'SUPER_USER',
  //   created: {
  //     date: new Date(),
  //     by: {
  //       userId: '63f79a7ed73fa58fba7487fe'
  //     }
  //   }
  // }]);

  await Group.deleteMany({});
  await Group.insertMany(seedGroups);
  console.log('seedDB function ran');
};
//   call the function and it's promise to close this connection after seeding
seedDB().then(() => {
  console.log('seeds closed connection');
  mongoose.connection.close();
});
