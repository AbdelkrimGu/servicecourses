const axios = require('axios');

async function teacher(jwt) {
  try {
    const url = 'https://userservice-production-dd99.up.railway.app'
    //const url = ' https://6960-41-103-209-184.ngrok-free.app'
    const response = await axios.get(url + '/api/v1/teacher', {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
    // Handle error here
  }
}
async function student(jwt) {
    try {
      const url = 'https://userservice-production-dd99.up.railway.app'
      const response = await axios.get(url+ '/api/v1/student', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      return response.data;
    } catch (error) {
        throw new Error(error);
      // Handle error here
    }
  }
  async function any(jwt) {
    try {
      const url = 'https://userservice-production-dd99.up.railway.app'
      const response = await axios.get(url+ '/api/v1/any', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      return response.data;
    } catch (error) {
        throw new Error(error);
      // Handle error here
    }
  }

module.exports = {
    teacher,
    student,
    any
};

