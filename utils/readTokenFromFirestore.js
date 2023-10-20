//Reading the saved token from firestore
async function readToken (admin) {
  try {
    // Create a reference to the location of the access token in the Realtime Database
    const database = admin.database();
    const accessTokenRef = database.ref("access-token/shipbox-token");

    // Read the access token from the Realtime Database
    const tokenSnapshot = await accessTokenRef.once("value");
    const tokenData = tokenSnapshot.val();

    if (tokenData) {
      return tokenData;
    } else {
      console.log("The access token does not exist.");
    }
  } catch (error) {
    console.error("Error reading the token:", error);
  }
};

module.exports = {
  readToken,
};
