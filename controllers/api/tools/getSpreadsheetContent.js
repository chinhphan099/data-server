const { google } = require('googleapis')
const { authorize } = require('../../../controllers/api/auth/authCTL')
const { saveContentsOnSheet } = require('../../../functions/spreadsheet')
const momentzone = require('moment-timezone')
// Model
const { spreadsheets, users, translation_model } = require('../../../models')

/** Receive spreadsheet ID and Fetch all content into this sheet */
const getSpreadsheetContent = async (req, res) => {
  console.log('getSpreadsheetContent');
  const { spreadsheetId, userId } = req.body
  // Receive verify JSON Url of Auth object
  const auth = await authorize(userId)

  if (auth.isAuth) {
    const { data } = auth
    const sheets = google.sheets({ version: 'v4', auth: data })

    try {
      // Get all sheets availabel in current Spreadsheet => [Objects]
      const { sheets: sheetList, alias } = await spreadsheets
        .findOne({ spreadsheetId })
        .lean()

      // Get user information from database
      const user = await users.findOne({ _id: userId }).lean()

      Promise.all(
        sheetList.map(async sheet => {
          // Fetch data in one sheet
          const {
            // sheetContent is all data in single sheet
            data: { values: sheetContent },
          } = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheet.title}!A1:ZZ${sheet.rowCount}`,
          })

          try {
            await saveContentsOnSheet(sheetContent, alias, sheet.title)
          } catch (err) {
            console.log('Error with sheet:', sheet.title)
            return
          } // End try catch
        })
      ).then(async () => {
        // Counter english documents
        console.log('getSpreadsheetContent');
        const englishCounter = await translation_model.countDocuments({
          site: alias
        });

        await spreadsheets.findOneAndUpdate(
          { spreadsheetId },
          {
            $set: {
              creator: user.name,
              totalEnglishDocs: englishCounter,
              updated: momentzone(Date.now())
                .tz('Asia/Ho_Chi_Minh')
                .format(),
            },
          }
        )
        res.json({ success: true })
      })
    } catch (errors) {
      // Or if promise.all rejected
      return res.status(400).json({ success: false, errors })
    }
  } else {
    // If user unauthorized
    return res.status(400).json({ success: false, verifyUri: auth.data })
  }
}

module.exports = { getSpreadsheetContent }
