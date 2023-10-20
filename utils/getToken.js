const axios = require("axios");

// Initialize Firebase Admin with your service account credentials

async function getToken(admin){
  try {
    // Requesting to Shipox
    const response = await axios.post(
      "https://prodapi.shipox.com/api/v1/authenticate",
      {
        username: "anvarsharipov@fargo.uz",
        password: "Anvar2023",
      }
    );

    // Retrieving the token from the data object
    const { id_token } = response.data.data;

    const token = {
      token: id_token,
    };

    // Save the access token securely to the Realtime Database
    const database = admin.database();
    const accessTokenRef = database.ref("access-token/shipbox-token");
    await accessTokenRef.set(token);
    console.log("Access token obtained and saved to the Realtime Database");
    return id_token;
  } catch (error) {
    console.error("Error obtaining the token:", error);
  }
};

module.exports = {
  getToken,
};
