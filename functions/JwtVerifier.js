const axios = require('axios');

async function teacher(jwt) {
  try {
    //const url = 'http://localhost:8080/api/v1/teacher'
    const url = 'https://db92-105-235-137-159.ngrok-free.app'
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
      const url = 'https://db92-105-235-137-159.ngrok-free.app'
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
      const url = 'https://db92-105-235-137-159.ngrok-free.app'
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

