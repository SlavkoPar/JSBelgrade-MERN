const mongoose = require('mongoose');
const Group = require('../models/Group');
mongoose.set('strictQuery', false);

const ObjectId = mongoose.Types.ObjectId


//**PROTECT CREDS WITH THIS .ENV INSTEAD OF BRADS' DEFAULTJSON
require('dotenv').config();
const db = process.env.MY_MONGO_URI;
console.log('--->', { db })

const map_Parent_Id = {}
const map_ParentKind_Id = {}
const map_Answer_Id = {}

//   seeding function
const groups = [
  {
    groupName: 'Owner',
    level: 1
  },
  {
    groupName: 'Admins',
    level: 1
  },
  {
    groupName: 'Editors',
    level: 1
  },
  {
    groupName: 'Viewers',
    level: 1
  }
];

const seedGroups = async (userId) => {
  try {
    for (const group of groups) {
      const { groupName, level } = group;
      const obj = {
        groupName,
        parentGroup: null,
        level,
        created: {
          date: new Date(),
          by: {
            userId
          }
        },
        modified: null
      }
      const g = await Group.create(obj);
    };
  }
  catch (err) {
    console.log(err)
  }
};



var data;
module.exports = {
  init: function (options) {
    data = options;
  },
  createGroups: async function (userId) {
    await seedGroups(userId);
  }
};

