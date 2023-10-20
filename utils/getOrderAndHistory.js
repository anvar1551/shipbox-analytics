async function getOrderAndHistory(db, orderNumber) {
  const orderRef = db.collection("orders").doc("10032395597220");

  orderRef
    .get()
    .then((orderDoc) => {
      if (orderDoc.exists) {
        const historyRef = orderDoc.data().history;

        // Fetch the history document using the reference
        historyRef.get().then((historyDoc) => {
          if (historyDoc.exists) {
            const historyData = historyDoc.data();
            console.log("History Data:", historyData.data.list);
            return historyData;
          } else {
            console.log("History document does not exist.");
          }
        });
      } else {
        console.log("Order document does not exist.");
      }
    })
    .catch((error) => {
      console.error("Error fetching order data:", error);
    });
}

module.exports = {
  getOrderAndHistory,
};
