const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
const serviceAccount = require("../credentials/firebase.json");

const { getToken } = require("../utils/getToken");
const { readToken } = require("../utils/readTokenFromFirestore");

const app = express();
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shipbox-orders-default-rtdb.firebaseio.com",
});

const database = admin.database();

const year = 2023; // Replace with your desired year
const month = 9; // Month (0-11), so 9 represents October
const day = 17; // Day of the month
const hour = 15; // Hour (24-hour format)
const minute = 30; // Minute
const second = 0; // Second
const millisecond = 0; // Millisecond

const specificDate = new Date(
  year,
  month,
  day,
  hour,
  minute,
  second,
  millisecond
);

console.log(specificDate);

// app.use(function (req, res, next) {
//     res.setHeader(
//       "Access-Control-Allow-Origin",
//       "https://fargo-express.netlify.app"
//     );
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     res.setHeader("Access-Control-Allow-Credentials", true);
//     next();
//   });

app.post("/webhook", async (req, res) => {
  try {
    const { orderId } = req.body;
    const lastUpdate = req.body;

    const { token } = await readToken(admin);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const ordersRef = database.ref("orders");
    const historyRef = database.ref("history_orders");

    const orderExistsPromise = ordersRef.child(orderId).once("value");
    const historyExistsPromise = historyRef.child(orderId).once("value");

    const [orderSnapshot, historySnapshot] = await Promise.all([
      orderExistsPromise,
      historyExistsPromise,
    ]);

    const orderExists = orderSnapshot.exists();
    console.log(orderExists);
    const historyExists = historySnapshot.exists();

    if (!orderExists) {
      const orderUrl = `https://prodapi.shipox.com/api/v2/admin/orders?search=${orderId}`;

      // Fetch order data from the external API
      const response = await fetch(orderUrl, { headers });

      if (response.status === 401) {
        // Handle 401 Unauthorized here
        console.error("Received a 401 Unauthorized error");

        // Fetch a new token and update it in the Realtime Database
        const newToken = await getToken(admin);
        const token = {
          token: newToken,
        };

        // Save the updated access token securely to the Realtime Database
        const accessTokenRef = database.ref("access-token/shipbox-token");
        await accessTokenRef.set(token);

        // Make the request with the new token
        const newResponse = await axios.get(orderUrl, {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        const data = newResponse.data.data.total;
        console.log(data);
      } else {
        // Data was successfully retrieved
        const data = response.data.data.total;
        console.log(data);
      }
    }

    if (!historyExists) {
      const historyUrl = `https://prodapi.shipox.com/api/v1/public/order/${orderId}/history_items`;
      // Fetch history data from the external API
      const response = await axios.get(historyUrl, { headers });
      const historyData = response.data.data.list;
      console.log(historyData);
      // Save the history data to the "history_orders" collection
      //   historyRef.child(orderId).set(historyData);
    }

    if (orderExists && historyExists) {
      lastUpdate.date = new Date(lastUpdate.date * 1000).toISOString();
      // Update the history data in the "history_orders" collection
      const historyList = database.ref(`history_orders/${orderId}/data/list`);
      const newHistoryItemRef = historyList.push();

      newHistoryItemRef.set(lastUpdate, (error) => {
        if (error) {
          console.error("Data could not be saved.", error);
        } else {
          console.log("Data saved successfully.");
        }
      });

      console.log("History updated!");
    }

    // console.log(data);
    res.status(200).send("Status successfuly updated");
  } catch (err) {
    console.log(err);
    res.send("Error updating history in database");
  }
});

app.listen(3030, () => {
  console.log("Server runs in port 3030");
});
