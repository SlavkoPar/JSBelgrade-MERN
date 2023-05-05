let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();

const ObjectId = mongoose.Types.ObjectId

let menuSchema = require("../models/Menu");

// CREATE Menu
router.post("/create-menu", (req, res, next) => {
  req.body.modified = null; // to be more readable, mongo treats undefineds as nulls
  menuSchema.create(req.body, (error, data) => {
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
      from: "meals",
      localField: "_id",
      foreignField: "parentMenu",
      pipeline: [
        {
          $project: {
            _id: 1
          },
        },
      ],
      as: "fromMeals",
    },
  },
  {
    $project: {
      title: 1,
      level: 1,
      parentMenu: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
      numOfMeals: { $size: "$fromMeals" },
      fromMeals: 1
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
      title: 1,
      level: 1,
      parentMenu: 1,
      created: 1,
      createdBy: 1,
      modified: 1,
      modifiedBy: 1,
      numOfMeals: 1
    },
  },

]


// Get Menus
// router.get("/", (req, res, next) => {
//     menuSchema.find((error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             res.json(data);
//         }
//     });
// });

// Get Menus
router.get('/', (req, res, next) => {
  menuSchema.aggregate(arrPipeline, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
})


// Get Sub Menus
router.get('/:wsId_id', (req, res, next) => {
  const arr = req.params.wsId_id.split('-');
  const wsId = arr[0];
  const menuId = arr[1];
  const match = (menuId === 'null') ? {
    wsId: ObjectId(wsId),
    parentMenu: null
  } : {
    parentMenu: ObjectId(menuId)
  }
  menuSchema.aggregate([
    {
      $match: match
    },
    ...arrPipeline
    // {
    //   $lookup: {
    //     from: "meals",
    //     localField: "_id",
    //     foreignField: "parentMenu",
    //     pipeline: [
    //       {
    //         $project: {
    //           _id: 1
    //           //title: 1,
    //           //parentMenu: 1,
    //           //created: 1,
    //           // createdBy: 1,
    //           // modified: 1,
    //           // modifiedBy: 1,
    //         },
    //       },
    //     ],
    //     as: "meals",
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


// Get Single Menu
router
  .route("/get-menu/:id")
  .get((req, res, next) => {
    menuSchema.aggregate([
      {
        $match: {
          _id: ObjectId(req.params.id),
        }
      },
      ...arrPipeline,
      /*{
        $lookup: {
          from: "meals",
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
                    parentMenu: "$$searchId",
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
          as: "meals",
        },
      }*/
      {
        $lookup: {
          from: "meals",
          localField: "_id",
          foreignField: "parentMenu",
          pipeline: [
            {
              $project: {
                title: 1,
                parentMenu: 1,
                level: 1,
                created: 1,
                // createdBy: 1,
                // modified: 1,
                // modifiedBy: 1,
              },
            },
          ],
          as: "meals",
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

// UPDATE Menu
router
  .route("/update-menu/:id")
  // Get Single Menu
  .get((req, res, next) => {
    menuSchema.findById(
      req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.json(data);
        }
      });
  })

  // Update Menu Data
  .put((req, res, next) => {
    menuSchema.findByIdAndUpdate(
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
          console.log("Menu updated successfully !", data);
        }
      }
    );
  });

// Delete Menu
router.delete("/delete-menu/:id",
  (req, res, next) => {
    menuSchema.findByIdAndRemove(
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


router.get('/get-parent-menus/:menuId', async (req, res, next) => {
  const { menuId } = req.params;
  const _ids = [];
  menuSchema.findById(menuId, function (err, menu) {
    if (err) {
      console.log(err);
    }
    else {
      if (!menu) {
        res.json(_ids);
        return;
      }
      _ids.unshift({ _id: menuId, title: menu.title });
      if (menu.parentMenu === null) {
        res.json(_ids);
      }
      else {
        menuSchema.findById(menu.parentMenu, function (err, menu) {
          if (err) {
            console.log(err);
          }
          else {
            if (!menu) {
              res.json(_ids);
              return;
            }
            _ids.unshift({ _id: menu._id, title: menu.title });
            if (menu.parentMenu === null) {
              res.json(_ids);
            }
            else {
              menuSchema.findById(menu.parentMenu, function (err, menu) {
                if (err) {
                  console.log(err);
                }
                else {
                  if (!menu) {
                    res.json(_ids);
                    return;
                  }
                  _ids.unshift({ _id: menu._id, title: menu.title });
                  if (menu.parentMenu === null) {
                    res.json(_ids);
                  }
                  else {
                    menuSchema.findById(menu.parentMenu, function (err, menu) {
                      if (err) {
                        console.log(err);
                      }
                      else {
                        if (!menu) {
                          res.json(_ids);
                          return;
                        }
                        _ids.unshift({ _id: menu._id, title: menu.title });
                        if (menu.parentMenu === null) {
                          res.json(_ids);
                        }
                        else {
                          menuSchema.findById(menu.parentMenu, function (err, menu) {
                            if (err) {
                              console.log(err);
                            }
                            else {
                              if (!menu) {
                                res.json(_ids);
                                return;
                              }
                              _ids.unshift(menu._id);
                              if (menu.parentMenu === null) {
                                res.json(_ids);
                              }
                              else {
                                menuSchema.findById(menu.parentMenu, function (err, menu) {
                                  if (err) {
                                    console.log(err);
                                  }
                                  else {
                                    if (!menu) {
                                      res.json(_ids);
                                      return;
                                    }
                                    _ids.unshift(menu._id);
                                    if (menu.parentMenu === null) {
                                      res.json(_ids);
                                    }
                                    else {
                                      menuSchema.findById(menu.parentMenu, function (err, menu) {
                                        if (err) {
                                          console.log(err);
                                        }
                                        else {
                                          if (!menu) {
                                            res.json(_ids);
                                            return;
                                          }
                                          _ids.unshift(menu._id);
                                          res.json(_ids);
                                        }
                                      });
                                    }
                                  }
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  });
})



module.exports = router;
