let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

const ObjectId = mongoose.Types.ObjectId

let groupSchema = require("../models/Group");

// CREATE Group
router.post("/create-group", (req, res, next) => {
  req.body.modified = null; // to be more readable, mongo treats undefineds as nulls
  groupSchema.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

const arrPipeline = [
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "parentGroup",
      pipeline: [
        {
          $project: {
            _id: 1,
          },
        },
      ],
      as: "deca",
    },
  },
  {
    $project: {
      groupName: 1,
      level: 1,
      parentGroup: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
      numOfUsers: { $size: "$deca"}
    },
  },

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
      groupName: 1,
      level: 1,
      parentGroup: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
      numOfUsers: 1
    },
  },
  
]


// Get Groups
// router.get("/", (req, res, next) => {
//     groupSchema.find((error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             res.json(data);
//         }
//     });
// });

// Get all Groups
router.get('/', (req, res, next) => {
  groupSchema.aggregate(arrPipeline, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
})


// Get SubGroups
router.get('/:id', (req, res, next) => {
  groupSchema.aggregate([
    {
      $match: {
        parentGroup: req.params.id !== 'null' ? ObjectId(req.params.id) : null
      }
    },
    ...arrPipeline
    // {
    //   $lookup: {
    //     from: "questions",
    //     localField: "_id",
    //     foreignField: "parentGroup",
    //     pipeline: [
    //       {
    //         $project: {
    //           _id: 1
    //           //title: 1,
    //           //parentGroup: 1,
    //           //created: 1,
    //           // createdBy: 1,
    //           // modified: 1,
    //           // modifiedBy: 1,
    //         },
    //       },
    //     ],
    //     as: "questions",
    //   },
    //}       
  ], (error, data) => {
    if (error) {
      console.log(error)
      return next(error);
    } else {
      res.json(data);
    }
  });
})


// Get Single Group
router
  .route("/get-group/:id")
  .get((req, res, next) => {
    groupSchema.aggregate([
      {
        $match: {
          _id: ObjectId(req.params.id),
        }
      },
      ...arrPipeline,
      /*{
        $lookup: {
          from: "questions",
          let: {
            // searchId: {
            //   $toObjectId: "$_id",
            // },
            searchId: "$_id"
          },
          //search query with our [searchId] value
          pipeline: [
            //searching [searchId] value equals your field [_id]
            {
              $match: {
                $expr: [
                  {
                    parentGroup: "$$searchId",
                  },
                ],
              },
            },
            //projecting only fields you reaaly need, otherwise you will store all - huge data loads
            {
              $project: {
                title: 1,
                // created: 1,
                // createdBy: 1,
                // modified: 1,
                // modifiedBy: 1,
              },
            },
          ],
          as: "questions",
        },
      }*/
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "parentGroup",
          pipeline: [
            {
              $project: {
                userName: 1,
                parentGroup: 1,
                level: 1,
                created: 1,
                // createdBy: 1,
                // modified: 1,
                // modifiedBy: 1,
              },
            },
          ],  
          as: "users",
        },
      }      
    ], (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data[0]);
      }
    });
  })

// UPDATE Group
router
  .route("/update-group/:id")
  // Get Single Group
  .get((req, res, next) => {
    groupSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data);
        }
      });
  })

  // Update Group Data
  .put((req, res, next) => {
    groupSchema.findByIdAndUpdate(
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
          console.log("Group updated successfully !", data);
        }
      }
    );
  });

// Delete Group
router.delete("/delete-group/:id",
  (req, res, next) => {
    groupSchema.findByIdAndRemove(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            msg: data,
          });
        }
      });
  });

module.exports = router;
