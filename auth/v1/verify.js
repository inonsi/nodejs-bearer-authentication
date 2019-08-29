const mongoose = require('mongoose');
const errors = require('../../core/errors');
const usersModel = require('../../models').users;
const otpsModel = require('../../models').otps;
const core = require('../../core');
const mongoURI = require('../../config').mongoURI;

const lib = {};

lib.verify = async (req, res) => {
  let errMessage = [];
  let errFlag = false;

  const { user_id, otp } = req.body;
  const { client_type } = req.headers;

  // check clientType existence
  if (!client_type) {
    errFlag = true;
    errMessage.push('Client_Type header is required.');
  }

  // check user_id existence
  if (!user_id) {
    errFlag = true;
    errMessage.push('user_id is required.');
  }

  // check otp
  if (!otp) {
    errFlag = true;
    errMessage.push('otp is required.');
  }
  if (errFlag) {
    let err = new Error();
    err.code = errors.statusCode[400].status;
    err.name = errors.statusCode[400].name;
    err.message = errMessage.join(' ');
    throw err;
  } else {
    // check user not already exist
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      uri_decode_auth: true,
    });

    // Get the default connection
    const db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));

    await otpsModel.findOne({ user_id, client_type }, (err, dbRes) => {
      if (err) throw err;
      console.log(dbRes);
    });

    // await otps.findOne()

    // update remark
    const remark = 'user registered And verified';

    res.status(200).json({ route: 'v1/verify', client_type, user_id, otp });
  }
};

lib.verifyEmail = (req, res) => {
  res.status(200).json({ route: 'v1/verify-email' });
};

lib.verifyMobile = (req, res) => {
  res.status(200).json({ route: 'v1/verify-mobile' });
};

module.exports = lib;
