let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

const ObjectId = mongoose.Types.ObjectId

let todoSchema = require("../models/Todo");

// CREATE Todo
router.post("/create-todo", (req, res, next) => {
  req.body.modified = null; // to be more readable, mongo treats undefineds as nulls
  todoSchema.create(req.body, (error, data) => {
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
      parentTodo: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1
    },
  },
]


// Get Sub Todos
router.get('/get-sub-todos/:wsId/:todoId', (req, res, next) => {
  const { wsId, todoId } = req.params;
  const match = (todoId === 'null') ? {
    wsId: ObjectId(wsId),
    parentTodo: null
  } : {
    parentTodo: ObjectId(todoId)
  }
  todoSchema.aggregate([
    {
      $match: match
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


// Get Single Todo
router
  .route("/get-todo/:id")
  .get((req, res, next) => {
    todoSchema.aggregate([
      {
        $match: {
          _id: ObjectId(req.params.id),
        }
      },
      ...arrPipeline
    ], (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data[0]);
      }
    });
  })

// UPDATE Todo
router
  .route("/update-todo/:id")
  // Get Single Todo
  .get((req, res, next) => {
    todoSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data);
        }
      });
  })

  // Update Todo Data
  .put((req, res, next) => {
    todoSchema.findByIdAndUpdate(
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
          //res.json(data);
          console.log("Todo updated successfully !", data);
          res.redirect(303, `/api/todos/get-todo/${req.params.id}`)
        }
      }
    );
  });

// Delete Todo
router.delete("/delete-todo/:id",
  (req, res, next) => {
    todoSchema.findByIdAndRemove(
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
