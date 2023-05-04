let mongoose = require("mongoose"),
    express = require("express"),
    router = express.Router();

var SeedGroups = require('./scripts/create-groups.js');
var Seed = require('./scripts/category-questions.js');

let User = require("../models/User");
let Group = require("../models/Group");

const ObjectId = mongoose.Types.ObjectId

router.post("/register-user", async (req, res, next) => {
    let { wsId, wsName, userName, password, color, email, created, modified } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return next(new Error(`User with email: ${email} already registered`)); // status 401
        }
        if (wsId !== '000000000000000000000000') {
            return next(new Error("Workspace _id should be empty, '_id' will be given upon register"));
        }
        if (wsName === '') {
            return next(new Error("Please provide Workspace Name."));
        }
        const created = {
            date: new Date(),
            by: {
                userId: new ObjectId('63f79a7ed73fa58fba7487fe') // superUserId, Slavko is superUser
            }
        }
        const cnt = await Group.countDocuments({});
        if (cnt === 0) {
            await SeedGroups.createGroups(created.by.userId);
        }

        const ws = {
            _id: '000000000000000000000000',
            wsName
        }
        wsId = ws._id;

        user = await User.findOne({ wsId, userName });
        if (user) {
            return next(new Error(`${userName} has been already registered in Workspace ${wsName}.`));
        }
        owner = await User.findOne({ wsId, role: 'OWNER' });
        // TODO return to VIEWER after trial period
        // const role = user ? 'VIEWER' : 'OWNER';
        // const group = Group.findOne({ groupName: (user ? "Viewers" : "Owner") },
        const role = owner ? 'EDITOR' : 'OWNER';
        const group = await Group.findOne({ groupName: (owner ? "Editors" : "Owner") });
        if (!group) {
            return next(new Error(`Group ${groupName} doesn't exist. Execute 'yarn run seeds'`));
        }
        const parentGroup = group._id;
        user = await User.create({ wsId, userName, email, password, superUser: false, parentGroup, role, color, confirmed: false, created, modified });
        await Seed.seedCategories(user.wsId, user._id);
        res.json({ user, wsName }); // status(201)
    }
    catch (error) {
        return next(error)
    }
})

// Sign-in User
router.post("/sign-in-user", async (req, res, next) => {
    let { wsId, wsName, userName, password } = req.body;
    try {
        const user = await User.findOne({ wsId: ObjectId(wsId), userName });
        if (!user)
            return next(new Error(`User ${userName} hasn't been registered in Workspace ${wsName}`));

        if (password === user.password) {
            res.json(user);
        }
        else {
            user.comparePassword(password, function (error, isMatch) {
                if (error) {
                    return next(error);
                }
                else {
                    if (isMatch)
                        res.json(user);
                    else
                        return next(new Error("Wrong Password"));
                }
            });
        }
    }
    catch (error) {
        return next(error)
    }
});



// CREATE User
router.post("/create-user", (req, res, next) => {
    User.create(req.body, (error, data) => {
        if (error) {
            return next(error);
        } else {
            console.log(data);
            res.json(data);
        }
    });
});


const pipeline = [
    {
        $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "fromUsers",
        },
    },
    {
        $lookup:
        {
            from: "users",
            localField: "modifiedBy",
            foreignField: "_id",
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
                        $arrayElemAt: ["$fromUsers2", 0],
                    },
                    "$$ROOT",
                ],
            },
        },
    },
    {
        $project:
        {
            userName: 1, // only dif from catgories pipeline
            parentGroup: 1,
            wsId: 1,
            createdBy_userName: "$userName",
            role: 1,
            created: 1,
            modified: 1,
            modifiedBy_userName: {
                $cond: [
                    {
                        $gt: [
                            {
                                $size: "$fromUsers2",
                            },
                            0,
                        ],
                    },
                    "$fromUsers2",
                    '' //'Unspecified'
                ],
            },
        },
    },
]

// READ Users
router.get("/", (req, res, next) => {
    User.find((error, data) => {
        if (error) {
            return next(error);
        } else {
            res.json(data);
        }
    });
});

// Get Single User
router
    .route("/get-user/:id")
    .get((req, res, next) => {
        User.aggregate([
            {
                $match: {
                    _id: ObjectId(req.params.id),
                }
            },
            ...pipeline
        ], (error, data) => {
            if (error) {
                return next(error);
            } else {
                res.json(data[0]);
            }
        });
    })



// UPDATE User
router
    .route("/update-user/:id")
    // Get Single User
    .get((req, res, next) => {
        User.findById(req.params.id, (error, data) => {
            if (error) {
                return next(error);
            } else {
                res.json(data);
            }
        });
    })
    // Update User Data
    .put((req, res, next) => {
        console.log('req.body', req.body)

        let groupName = 'Viewers';
        switch (req.body.role) {
            case "OWNER": groupName = 'Owner'; break;
            case "ADMIN": groupName = 'Admins'; break;
            case "EDITOR": groupName = 'Editors'; break;
            case "VIEWER": groupName = 'Viewers'; break;
            default: console.log("unknown role", role); break;
        }
        Group.findOne({ groupName }, function (error, group) {
            if (error) {
                return next(error);
            } else {
                if (group) {
                    req.body.parentGroup = group._id;

                    User.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: req.body,
                        },
                        (error, data) => {
                            if (error) {
                                console.log(error);
                                return next(error);
                            } else {
                                res.json(data);
                                console.log("User updated successfully !");
                            }
                        }
                    );
                }
                else {
                    return next(new Error(`Group ${groupName} doesn't exist. Execute 'yarn run seeds'`));
                }
            }
        })

    });

// Confirm User Registration
router
    .route("/confirm-registration/:id")
    // Get Single User
    .get((req, res, next) => {
        User.findById(req.params.id, (error, data) => {
            if (error) {
                return next(error);
            } else {
                res.json(data);
            }
        });
    })
    // Confirm user registration
    .put((req, res, next) => {
        console.log('req.body', req.body)
        User.findByIdAndUpdate(
            req.params.id,
            {
                $set: { confirmed: true }
            },
            (error, data) => {
                if (error) {
                    console.log(error);
                    return next(error);
                } else {
                    res.json(data);
                    console.log("User confirmed registration !");
                }
            }
        );
    })


// Delete User
router.delete("/delete-user/:id", (req, res, next) => {
    User.findByIdAndRemove(
        req.params.id, (error, data) => {
            if (error) {
                return next(error);
            } else {
                res.status(200).json({
                    user: data,
                });
            }
        });
});

module.exports = router;
