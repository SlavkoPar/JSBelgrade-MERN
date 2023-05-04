const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const ObjectId = mongoose.Types.ObjectId

// Schema must match the seed
const Category = require('../../models/Category');
const Question = require('../../models/Question');

// When exporting questions, export categories too
const jsonCategories = require("./categoriesExported.json");
const jsonQuestions = require("./questionsExported.json");

//**PROTECT CREDS WITH THIS .ENV INSTEAD OF BRADS' DEFAULTJSON
require('dotenv').config();
// const db = process.env.MY_MONGO_URI;
// console.log('--->', { db })

const map_Parent_Id = {}
const map_ParentKind_Id = {}
const map_Answer_Id = {}

//   seeding function
const seedCats = async (wsId, userId) => {
  const map_Title_Id = {}
  const categories = jsonCategories.sort((a, b) => a.level - b.level);
  try {
    for (const cat of categories) {
      const { _id, title, level, parentCategory } = cat;
      const parentCateg = parentCategory ? categories.find(c => c._id['$oid'] === parentCategory['$oid']) : null;
      const category = {
        wsId,
        title,
        parentCategory: parentCateg ? map_Title_Id[parentCateg.title] : null,
        level,
        created: {
          date: new Date(),
          by: {
            userId
          }
        },
        modified: null
      }
      const categ = await Category.create(category);
      map_Title_Id[title] = categ._id;
      map_Parent_Id[_id['$oid']] = categ._id;
    };
  }
  catch (err) {
    console.log(err)
  }
};

const seedQuestions = async (wsId, userId) => {
  try {
    for (const quest of jsonQuestions) {
      const { title, level, parentCategory, questionAnswers, status, source } = quest;
      const question = {
        wsId,
        title,
        parentCategory: map_Parent_Id[parentCategory['$oid']],
        level,
        questionAnswers: questionAnswers.length === 0 
          ? []
          : questionAnswers.map(a => ({
            _id: map_Answer_Id[a._id['$oid']],
            assigned: {
              date: new Date(),
              by: {
                userId
              }
            }
          })),
        status,
        source,
        created: {
          date: new Date(),
          by: {
            userId
          }
        },
        modified: null
      }
      const q = await Question.create(question);
    };
  }
  catch (err) {
    console.log(err)
  }
}

var data;
module.exports = {
  init: function (options) {
    data = options;
  },
  seedCategories: async function (wsId, userId) {
    await seedCats(wsId, userId);
    await seedQuestions(wsId, userId);
  }
};

