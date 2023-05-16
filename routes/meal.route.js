let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router(),
  assert = require('assert');

const ObjectId = mongoose.Types.ObjectId

let mealSchema = require("../models/Meal");
let menuSchema = require("../models/Menu");

// CREATE Meal
router.post("/create-meal", (req, res, next) => {
  req.body.modified = null; // to be more readable, mongo treats undefineds as nulls
  mealSchema.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

const mealPipeline = (id) => [
  {
    $match: {
      _id: ObjectId(id),
    }
  },
  {
    $lookup: {
      from: "menus",
      localField: "parentMenu",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            menuTitle: "$title",
          },
        },
      ],
      as: "fromMenu",
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          {
            $arrayElemAt: ["$fromMenu", 0],
          },
          "$$ROOT",
        ],
      },
    },
  }
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
      parentMenu: 1,
      menuTitle: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
    },
  },
]

// Get Meals
// router.get("/", (req, res, next) => {
//     mealSchema.find((error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             res.json(data);
//         }
//     });
// });

// Get Meals
router.get('/', (req, res, next) => {
  mealSchema.aggregate(arrPipeline, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
})

// Get Meals
router.get('/:id', (req, res, next) => {
  mealSchema.aggregate([
    {
      $match: {
        parentMenu: req.params.id !== 'null' ? ObjectId(req.params.id) : null
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



// Get Single Meal
router
  .route("/get-meal/:id")
  .get((req, res, next) => {
    mealSchema.aggregate([
      ...mealPipeline(req.params.id),
      ...arrPipeline
    ], (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data[0]);
      }
    });
  })

// UPDATE Meal
router
  .route("/update-meal/:id")
  // Get Single Meal
  .get((req, res, next) => {
    mealSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data);
        }
      });
  })
  // Update Meal Data
  .put((req, res, next) => {
    mealSchema.findByIdAndUpdate(
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
          console.log("Meal updated successfully !", data);
        }
      }
    );
  });


// Delete Meal
router.delete("/delete-meal/:id",
  (req, res, next) => {
    mealSchema.findByIdAndRemove(
      req.params.id, (error, meal) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            meal
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
      parentMenu: 1,
      title: 1,
    },
  },
  {
    $lookup: {
      from: "menus",
      localField: "parentMenu",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            menuParentMenu:
              "$parentMenu",
            menuTitle: "$title",
          },
        },
      ],
      as: "fromMenus",
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          {
            $arrayElemAt: ["$fromMenus", 0],
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
      menuTitle: 1,
      menuParentMenu: 1,
      parentMenu: 1,
    },
  },
  {
    $lookup: {
      from: "menus",
      localField: "menuParentMenu",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            _id: 1,
            menuParentTitle: "$title",
            parentMenuUp: "$parentMenu"
          },
        },
      ],
      as: "fromMenus2",
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
                    $size: "$fromMenus2",
                  },
                  0,
                ],
              },
              {
                $arrayElemAt: [
                  "$fromMenus2",
                  0,
                ],
              },
              {
                menuParentTitle: "",
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
      fromMenus2: 0,
      menuParentMenu: 0
    },
  },
  {
    $group: {
      _id: "$parentMenu",
      //
      meals: {
        $push: {
          _id: "$_id",
          menuParentTitle: "$menuParentTitle",
          menuTitle: "$menuTitle",
          title: "$title",
          parentMenuUp: "$parentMenuUp"
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
      parentMenu: 1,
      title: 1,
    }
  }]
]

// const dajCat = async (_id) => {
//   return await menuSchema.findOne({ _id }, { title: 1, parentMenu: 1 }).exec();
// }
// const cat = await menuSchema.aggregate(catPipeline('641948164a219abbd99c4387'));

/*
// TODO Pay MongoDB Atlas Database to have autocomplete search

router.get('/get-meals/:search', async (req, res, next) => {
  const data = await mealSchema.aggregate(searchPipeline(req.params.search));
  const groups = data.map(group => {
    console.log('group -> ', group)
    let { menuParentTitle, menuTitle, parentMenuUp } = group.meals[0];
    return {
      _id: group._id,
      parentMenuUp,
      menuParentTitle,
      menuTitle,
      meals: group.meals.map(q => ({
        _id: q._id,
        parentMenu: group._id,
        title: q.title
      }))
    }
  })
  res.json(groups);
})
*/
function groupBy(objectArray) {
  return objectArray.reduce((acc, obj) => {
    const key = obj.parentMenu;
    const currGroup = acc[key] ?? [];
    return { ...acc, [key]: [...currGroup, obj] };
  }, {});
}

router.get('/get-meals/:search', async (req, res, next) => {

  const data = await mealSchema.find({
    title: {
      $regex: req.params.search,
      $options: 'im'
    }
  }, {
    _id: 1,
    title: 1,
    parentMenu: 1
  });

  const grouped = groupBy(data);

  const groups = []

  try {
    for (const [menuId, meals] of Object.entries(grouped)) {
      const menu = await menuSchema.findById(menuId);
      let parentMenuUp = '';
      let menuParentTitle = '';

      if (menu.parentMenu) {
        try {
          const parentMenu = await menuSchema.findById(menu.parentMenu);
          menuParentTitle = parentMenu.title;
          if (parentMenu.parentMenu) {
            parentMenuUp = ' ... / '
          }
        }
        catch (err) {
          console.log(err);
        }
      }
      groups.push({
        _id: menuId,
        parentMenuUp,
        menuParentTitle,
        menuTitle: menu.title,
        meals: meals.map(q => ({
          _id: q._id,
          title: q.title,
          parentMenu: menuId
        }))
      })
    }
  }
  catch (err) {
    console.log(err);
  }

  //   const groups = data.map(group => {
  //     console.log('group -> ', group)
  //     let { menuParentTitle, menuTitle, parentMenuUp } = group.meals[0];
  //     return {
  //       _id: group._id,
  //       parentMenuUp,
  //       menuParentTitle,
  //       menuTitle,
  //       meals: group.meals.map(q => ({
  //         _id: q._id,
  //         parentMenu: group._id,
  //         title: q.title
  //       }))
  //     }
  //   })
  res.json(groups);
})

module.exports = router;
