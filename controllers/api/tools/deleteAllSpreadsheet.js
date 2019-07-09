const {spreadsheets, translation_model} = require('../../../models')

module.exports.deleteAllSpreadsheet = async (req, res) => {
  const secretKey = req.body.secretKey;
  if(secretKey === 'dfoglobal') {
    await spreadsheets.deleteMany({})
    await translation_model.deleteMany({})
    res.json({ deleted: true, message: 'All Sheet and Content were removed!!' });
  }
  else {
    res.json({ deleted: false, message: 'Wrong Secret Key' });
  }
}
