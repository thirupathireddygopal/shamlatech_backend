const bcrypt = require('bcryptjs');
const reqresApiHelper = require('../helpers/reqresapi_helper');
const crypto = require('crypto');

const Admin = require('../models/admin.model');
const User = require('../models/user.model');

async function checkAdmins(email, phoneNumber) {
  var adminDoc = await Admin.findOne({ email: ('' + email).toLowerCase(), phoneNumber: phoneNumber });
  return adminDoc
}

async function checkUser(email) {
  var userDoc = await User.findOne({ email: ('' + email).toLowerCase() });
  return userDoc;
}

// admin registration
exports.register = async (req, res) => {
  var checkUser = await checkAdmins(req.body.email, req.body.phoneNumber);
  if (checkUser != null) {
    res.status(409).json({
      success: false,
      message: 'Admin already registered with us'
    })
  }
  else {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.log(`bcrypt salt err: ${err}`)
      }
      else {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) {
            console.log(`bcrypt hash err: ${err}`)
          }
          else {
            let admin = new Admin({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              countryCode: req.body.countryCode,
              phoneNumber: req.body.phoneNumber,
              email: ('' + req.body.email).toLowerCase(),
              password: req.body.password,
              hash: hash
            });
            admin.save().then(admin => {
              res.status(200).json({
                success: true,
                firstName: admin.firstName,
                email: admin.email,
                message: 'Admin registered successfully'
              })
            }).catch(adErr => {
              console.log(`admin register err: ${adErr}`)
              res.status(409).json({
                success: false,
                message: 'something went wrong'
              })
            })
          }
        })
      }
    })
  }
}

// admin login
exports.login = (req, res) => {
  Admin.findOne({ email: ('' + req.body.email).toLowerCase() }).exec(
    function (err, adDoc) {
      if (err) {
        console.log(`admin login err: ${err}`)
      }
      if (adDoc) {
        bcrypt.compare(req.body.password, adDoc.hash, (err, success) => {
          if (err) {
            res.status(500).json({
              success: false,
              message: `sorry internal server down`
            })
          }
          if (success) {
            res.status(200).json({
              success: true,
              message: '&#x1F60A; You are logged In...',
              user: {
                firstName: adDoc.firstName,
                email: adDoc.email,
                phoneNumber: adDoc.phoneNumber
              }
            })
          }
          else {
            res.status(409).json({
              success: false,
              message: '&#x1F610 Incorrect email or password.'
            })
          }
        })
      }
      else {
        res.status(409).json({
          success: false,
          message: '&#x1F610 Email not found'
        })
      }
    }
  )
}

// saving users into MongoDB requested from reqres listUsers api
exports.save_users = async (req, res) => {
  console.log(`req body: ${JSON.stringify(req.body)}`);
  var rejectedUsers = [];
  var addedUsers = [];
  var usersData = await reqresApiHelper.listUsers(req.body.pageNumber);
  if (usersData != null) {
    var data = usersData.data; // array of users which we get from listUsers api
    for (let i = 0; i < data.length; i++) {
      console.log(`i value: ${i}`);
      try {
        var userDoc = await checkUser(data[i]['email']);
        if (userDoc != null) {
          rejectedUsers.push(data[i]['email']);
          if (data.length === i + 1) {
            res.status(200).json({
              success: true,
              addedUsers,
              rejectedUsers
            })
          }
        }
        else {
          var newUser = new User({
            userId: data[i]['id'],
            firstName: data[i]['first_name'],
            lastName: data[i]['last_name'],
            email: data[i]['email'],
            avatar: data[i]['avatar']
          });
          newUser.save().then(user => {
            addedUsers.push(user.email);
            if (data.length === i + 1) {
              res.status(200).json({
                success: true,
                addedUsers,
                rejectedUsers,
                message: 'added user successfully'
              })
            }
          })
        }
      } catch (error) {
        res.status(500).json({ err })
      }
    }
  }
}

exports.create_user = async (req, res) => {
  try {
    var userDoc = await checkUser(req.body.email);
    if (userDoc != null) {
      res.status(409).json({
        success: false,
        message: 'user already registered'
      })
    }
    else {
      var newUser = new User({
        userId: crypto.randomBytes(6),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: 'https://shamlatech.com/wp-content/uploads/2019/01/logo.png'
      });
      newUser.save().then(user => {
        res.status(200).json({
          success: true,
          message: 'created user successfully'
        })        
      })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.get_users = (req, res) => {
  User.find({}).select('userId firstName lastName email avatar -_id')
    .exec((err, users) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'server not connected'
        })
      }
      if (users) {
        res.status(200).json({
          success: true,
          users
        })
      }
      else {
        res.status(409).json({
          success: false,
          message: 'No users found'
        })
      }
    })
}

// retriving particular user Info
exports.get_user_info = (req, res) => {
  console.log(`req body: ${JSON.stringify(req.body)}`);
  User.findOne({ userId: req.body.userId }).select('email firstName lastName avatar -_id').exec(
    function (err, userDoc) {
      if (err) {
        res.status(500).json({
          message: `internal server down`
        })
      }
      if (userDoc) {
        console.log(`user doc: ${userDoc}`)
        res.status(200).json({
          success: true,
          user: userDoc
        })
      }
      else {
        res.status(409).json({
          success: false,
          message: 'user not found'
        })
      }
    }
  )
}

// updating user firstName and lastName
exports.update_user = (req, res) => {
  User.findOneAndUpdate(
    {
      userId: req.body.userId
    },
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName
    },
    { new: true },
    (err, upUserDoc) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'server not connected'
        })
      }
      if (upUserDoc) {
        res.status(200).json({
          success: true,
          message: 'successfully updated user details'
        })
      }
    }
  )
}

// deleted user
exports.delete_user = (req, res) => {
  User.findOneAndDelete({ userId: req.body.userId }).exec((err, doc) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: `server is not connected`
      })
    }
    if (doc) {
      res.status(200).json({
        success: true,
        message: `${doc.firstName} deleted successfully`
      })
    }
  })
}