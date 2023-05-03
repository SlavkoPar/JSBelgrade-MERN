let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router(),
  assert = require('assert');

const ObjectId = mongoose.Types.ObjectId

let questionSchema = require("../models/Question");
let categorySchema = require("../models/Category");

// CREATE Question
router.post("/create-question", (req, res, next) => {
  req.body.modified = null; // to be more readable, mongo treats undefineds as nulls
  questionSchema.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

const questionPipeline = (id) => [
  {
    $match: {
      _id: ObjectId(id),
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "questionAnswers.assigned.by.userId",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            createdBy: "$userName",
          },
        },
      ],
      as: "fromUserAssignedAnswer",
    },
  },
  {
    $lookup: {
      from: "answers",
      localField: "questionAnswers._id",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            title: 1,
          },
        },
      ],
      as: "fromAnswers",
    },
  },
  {
    $addFields: {
      questionAnswers: {
        $map: {
          input: "$questionAnswers",
          as: "answer",
          in: {
            $mergeObjects: [
              "$$answer",
              {
                answer: {
                  $arrayElemAt: [
                    "$fromAnswers",
                    {
                      $indexOfArray: [
                        "$questionAnswers",
                        "$$answer",
                      ],
                    },
                  ],
                },
                user: {
                  createdBy: 'unk'
                }
              },
            ],
          },
        },
      },
    },
  },
  {
    $unset: ["fromAnswers"],
  },
]

const arrPipeline = [
  {
    $lookup: {
      from: "users",
      let: {
        searchId: {
          $toObjectId: "$created.by.userId",
        },
      },
      //search query with our [searchId] value
      pipeline: [
        //searching [searchId] value equals your field [_id]
        {
          $match: {
            $expr: [
              {
                _id: "$$searchId",
              },
            ],
          },
        },
        //projecting only fields you reaaly need, otherwise you will store all - huge data loads
        {
          $project: {
            createdBy: "$userName",
          },
        },
      ],
      as: "fromUsers",
    },
  },
  {
    $lookup: {
      from: "users",
      let: {
        searchId: {
          $toObjectId: {
            $cond: [
              {
                $ne: ["$modified", null],
              },
              "$modified.by.userId",
              null,
            ],
          },
        },
      },
      pipeline: [
        {
          $match: {
            $expr: [
              {
                _id: "$$searchId",
              },
            ],
          },
        },
        {
          $project: {
            modifiedBy: {
              $cond: [
                {
                  $ne: ["$$searchId", null],
                },
                "$userName",
                "Unspecfied",
              ],
            },
          },
        },
      ],
      as: "fromUsers2",
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          {
            $arrayElemAt: ["$fromUsers", 0],
          },
          {
            $cond: [
              {
                $gt: [
                  {
                    $size: "$fromUsers2",
                  },
                  0,
                ],
              },
              {
                $arrayElemAt: ["$fromUsers2", 0],
              },
              {
                modifiedBy: "Unspec",
              },
            ],
          },
          "$$ROOT",
        ],
      },
    },
  },
  {
    $project: {
      title: 1,
      level: 1,
      parentCategory: 1,
      questionAnswers: 1,
      numOfAnswers: { $size: '$questionAnswers' },
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
      fromUserAssignedAnswer: 1
    },
  },
]

// Get Questions
// router.get("/", (req, res, next) => {
//     questionSchema.find((error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             res.json(data);
//         }
//     });
// });

// Get Questions
router.get('/', (req, res, next) => {
  questionSchema.aggregate(arrPipeline, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
})

// Get Questions
router.get('/:id', (req, res, next) => {
  questionSchema.aggregate([
    {
      $match: {
        parentCategory: req.params.id !== 'null' ? ObjectId(req.params.id) : null
      }
    },
    ...arrPipeline
  ], (error, data) => {
    if (error) {
      console.log(error)
      return next(error);
    } else {
      res.json(data);
    }
  });
})



// Get Single Question
router
  .route("/get-question/:id")
  .get((req, res, next) => {
    questionSchema.aggregate([
      ...questionPipeline(req.params.id),
      ...arrPipeline
    ], (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data[0]);
      }
    });
  })

// UPDATE Question
router
  .route("/update-question/:id")
  // Get Single Question
  .get((req, res, next) => {
    questionSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data);
        }
      });
  })
  // Update Question Data
  .put((req, res, next) => {
    questionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        returnDocument: 'after'
      },
      (error, data) => {
        if (error) {
          console.log(error);
          return next(error);
        } else {
          res.json(data);
          console.log("Question updated successfully !", data);
        }
      }
    );
  });

// Assign Answer
router
  .route("/assign-question-answer/:id")
  // Get Single Question
  .get((req, res, next) => {
    questionSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data.questionAnswers);
        }
      });
  })
  // update Question Data (assign answer)
  .put((req, res, next) => {
    const { answerId, assigned } = req.body;
    questionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          questionAnswers: {
            _id: answerId,
            assigned: {
              date: new Date(assigned.date),
              by: {
                userId: new ObjectId(assigned.by.userId)
              }
            }
          }
        }
      },
      {
        returnDocument: 'after'
      },
      (error, data) => {
        if (error) {
          console.log(error);
          return next(error);
        }
        else {
          console.log("Answer successfully assigned to question", data);
          // res.json(data);
          questionSchema.aggregate([
            ...questionPipeline(req.params.id),
            ...arrPipeline
          ], (error, data) => {
            if (error) {
              return next(error);
            } else {
              res.json(data[0]);
            }
          })
        }
      });
  });


// Assign Answer
router
  .route("/unassign-question-answer/:id")
  // Get Single Question
  .get((req, res, next) => {
    questionSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data.questionAnswers);
        }
      });
  })
  // update Question Data (assign answer)
  .put((req, res, next) => {
    const { answerId } = req.body;
    questionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { 'questionAnswers': { '_id': ObjectId(answerId) } }
      },
      {
        returnDocument: 'after'
      },
      (error, data) => {
        if (error) {
          console.log(error);
          return next(error);
        } else {
          console.log("Answer successfully unassigned from Question", data);
          //res.json(data);
          questionSchema.aggregate([
            ...questionPipeline(req.params.id),
            ...arrPipeline
          ], (error, data) => {
            if (error) {
              return next(error);
            } else {
              res.json(data[0]);
            }
          })
        }
      }
    );
  });



// Delete Question
router.delete("/delete-question/:id",
  (req, res, next) => {
    questionSchema.findByIdAndRemove(
      req.params.id, (error, question) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            question
          });
        }
      });
  });

const searchPipeline = (search) => [
  {
    $match: {
      $text: {
        $search: search
      },
    },
  },
  {
    $project: {
      _id: 1,
      parentCategory: 1,
      title: 1,
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "parentCategory",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            categoryParentCategory:
              "$parentCategory",
            categoryTitle: "$title",
          },
        },
      ],
      as: "fromCategories",
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          {
            $arrayElemAt: ["$fromCategories", 0],
          },
          "$$ROOT",
        ],
      },
    },
  },
  {
    $project: {
      _id: 1,
      title: 1,
      categoryTitle: 1,
      categoryParentCategory: 1,
      parentCategory: 1,
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "categoryParentCategory",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            categoryParentTitle: "$title",
            parentCategoryUp: "$parentCategory"
          },
        },
      ],
      as: "fromCategories2",
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          {
            $cond: [
              {
                $gt: [
                  {
                    $size: "$fromCategories2",
                  },
                  0,
                ],
              },
              {
                $arrayElemAt: [
                  "$fromCategories2",
                  0,
                ],
              },
              {
                categoryParentTitle: "",
              },
            ],
          },
          "$$ROOT",
        ],
      },
    },
  },
  {
    $project: {
      fromCategories2: 0,
      categoryParentCategory: 0
    },
  },
  {
    $group: {
      _id: "$parentCategory",
      //
      questions: {
        $push: {
          _id: "$_id",
          categoryParentTitle: "$categoryParentTitle",
          categoryTitle: "$categoryTitle",
          title: "$title",
          parentCategoryUp: "$parentCategoryUp"
        },
      },
    },
  },
]

const catPipeline = (_id) => [
  [{
    $match: {
      _id: ObjectId(_id)
    }
  },
  {
    $project: {
      _id: 1,
      parentCategory: 1,
      title: 1,
    }
  }]
]

// const dajCat = async (_id) => {
//   return await categorySchema.findOne({ _id }, { title: 1, parentCategory: 1 }).exec();
// }
// const cat = await categorySchema.aggregate(catPipeline('641948164a219abbd99c4387'));

/*
// TODO Pay MongoDB Atlas Database to have autocomplete search

router.get('/get-questions/:search', async (req, res, next) => {
  const data = await questionSchema.aggregate(searchPipeline(req.params.search));
  const groups = data.map(group => {
    console.log('group -> ', group)
    let { categoryParentTitle, categoryTitle, parentCategoryUp } = group.questions[0];
    return {
      _id: group._id,
      parentCategoryUp,
      categoryParentTitle,
      categoryTitle,
      questions: group.questions.map(q => ({
        _id: q._id,
        parentCategory: group._id,
        title: q.title
      }))
    }
  })
  res.json(groups);
})
*/
function groupBy(objectArray) {
  return objectArray.reduce((acc, obj) => {
    const key = obj.parentCategory;
    const currGroup = acc[key] ?? [];
    return { ...acc, [key]: [...currGroup, obj] };
  }, {});
}

router.get('/get-questions/:search', async (req, res, next) => {

  const data = await questionSchema.find({
    title: {
      $regex: req.params.search,
      $options: 'im'
    }
  }, {
    _id: 1,
    title: 1,
    parentCategory: 1
  });

  const grouped = groupBy(data);

  const groups = []

  try {
    for (const [categoryId, questions] of Object.entries(grouped)) {
      const category = await categorySchema.findById(categoryId);
      let parentCategoryUp = '';
      let categoryParentTitle = '';

      if (category.parentCategory) {
        try {
          const parentCategory = await categorySchema.findById(category.parentCategory);
          categoryParentTitle = parentCategory.title;
          if (parentCategory.parentCategory) {
            parentCategoryUp = ' ... / '
          }
        }
        catch (err) {
          console.log(err);
        }
      }
      groups.push({
        _id: categoryId,
        parentCategoryUp,
        categoryParentTitle,
        categoryTitle: category.title,
        questions: questions.map(q => ({
          _id: q._id,
          title: q.title,
          parentCategory: categoryId
        }))
      })
    }
  }
  catch (err) {
    console.log(err);
  }

  //   const groups = data.map(group => {
  //     console.log('group -> ', group)
  //     let { categoryParentTitle, categoryTitle, parentCategoryUp } = group.questions[0];
  //     return {
  //       _id: group._id,
  //       parentCategoryUp,
  //       categoryParentTitle,
  //       categoryTitle,
  //       questions: group.questions.map(q => ({
  //         _id: q._id,
  //         parentCategory: group._id,
  //         title: q.title
  //       }))
  //     }
  //   })
  res.json(groups);
})

module.exports = router;
