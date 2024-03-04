const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 11000;


app.get('/api/getAccount', async (req, res) => {
    let account = await getActiveAccounts();
    res.send(JSON.stringify(account));
});

app.post('/api/getKiteOrders', async (req, res) => {
  try{
    let {apiKey,accessToken} = req.body
    let fetchedOrders = await getOrders(apiKey, accessToken)
    if(!fetchedOrders.status){
      res.status(400).send(JSON.stringify({success: false, error: fetchedOrders.error}))
    }else{
      res.status(200).send(JSON.stringify({success: true,orders: fetchedOrders.data["data"]}))
    }
  }catch(err){
    console.log(err);
    res.status(500).send(JSON.stringify({success: false, error: err}))
  }
})


app.post('/api/getKiteHoldings', async (req, res) => {
  try{
    let {apiKey,accessToken} = req.body
    let fetchedOrders = await getHoldings(apiKey, accessToken)
    if(!fetchedOrders.status){
      res.status(400).send(JSON.stringify({success: false, error: fetchedOrders.error}))
    }else{
      res.status(200).send(JSON.stringify({success: true,orders: fetchedOrders.data["data"]}))
    }
  }catch(err){
    console.log(err);
    res.status(500).send(JSON.stringify({success: false, error: err}))
  }
})


app.post('/api/getKitePositions', async (req, res) => {
  try{
    let {apiKey,accessToken} = req.body
    let fetchedOrders = await getPosition(apiKey, accessToken)
    if(!fetchedOrders.status){
      res.status(400).send(JSON.stringify({success: false, error: fetchedOrders.error}))
    }else{
      res.status(200).send(JSON.stringify({success: true, data: fetchedOrders.data}))
    }
  }catch(err){
    console.log(err);
    res.status(500).send(JSON.stringify({success: false, error: err}))
  }
})




async function getActiveAccounts() {
    try {
      const filters = [{ filterType: "simple" }];
      const microUrl =
        "https://script.google.com/macros/s/AKfycbxu8C5wGzqsRzvVn2JoXdfzmg29C-PaEGnfNkr4g7pL7Cj8vAcD/exec";
  
      const response = await axios.post(
        microUrl,
        {
          type: "read",
          s_name: "REQUEST TOKEN SHEET",
          filters: filters,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        }
      );
  
      if (response.status !== 200) {
        console.log(`HTTP error! Status: ${response.status}`);
      }
  
      const data = response.data;
  
      if (data.response_status === "READ_SUCCESS") {
        return data.response_data;
      } else {
        console.log("No data Found for accounts data", accountsData);
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }



  async function getOrders(api_Key, access_Token) {
    try {
      const url = 'https://api.kite.trade/orders';
      const headers = {
          'X-Kite-Version': '3',
          'Authorization': `token ${api_Key}:${access_Token}`,
      };

      const response = await axios.get(url, {
          headers: headers,
      });
      const data = response.data;
      return {status: true, data: data};
  } catch (error) {
      console.log('Error:', error.message);
      return {status: false, error: error};
  }
  }


  async function getHoldings(api_Key, access_Token) {
    try {
      const url = 'https://api.kite.trade/portfolio/holdings';
      const headers = {
          'X-Kite-Version': '3',
          'Authorization': `token ${api_Key}:${access_Token}`,
      };

      const response = await axios.get(url, {
          headers: headers,
      });
      const data = response.data;
      return {status: true, data: data};
  } catch (error) {
      console.log('Error:', error.message);
      return {status: false, error: error};
  }
  }

  async function getPosition(api_Key, access_Token) {
    try {
      const url = 'https://api.kite.trade/portfolio/positions';
      const headers = {
          'X-Kite-Version': '3',
          'Authorization': `token ${api_Key}:${access_Token}`,
      };

      const response = await axios.get(url, {
          headers: headers,
      });
      const data = response.data;
      return {status: true, data: data.data['net']};
  } catch (error) {
      console.log('Error:', error.message);
      return {status: false, error: error};
  }
  }


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
