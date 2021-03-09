const axios = require('axios').default;
const env = require('../config/env');

async function listUsers(pageNumber) {
  try {
    const respose = await axios(
      {
        method: 'GET',
        baseURL: `${env.keys.reqresBaseUrl}/users`,
        params: {
          page: pageNumber
        }
      }
    )
    return respose.data;
  } catch (error) {
    return error
  }
}


module.exports = {
  listUsers
}