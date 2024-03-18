const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer')


const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
const port = 11000;


app.get("/api/login", async (req, res) => {
	try {
		const { username, password } = req.query;
		let account = await fetchUserConfig();
		let userLogin = account.find((user) => user.Username === username);
		if (!userLogin) {
			return res.send({ status: "failed", message: "User Not Found" });
		}

		if (userLogin.Password !== password) {
			return res.send({ status: "failed", message: "Wrong Credintials!, Try again." });
		}
		const token = jwt.sign({ username }, password);
		return res.send(JSON.stringify(token));
	} catch (err) {
		console.log("login endpoint failed with error", err);
		res.send({ status: "failed", message: "Internal Server Error" });
	}
});


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


app.post('/api/scarpInvesting', async (req, res) => {
  try{
    let {url} = req.body
    let scrapedData = await scrapData(url)
    if(!scrapedData.status){
      res.status(400).send(JSON.stringify({success: false, error: scrapedData.error}))
    }else{
      res.status(200).send(JSON.stringify({success: true, data: scrapedData.data}))
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



  async function fetchUserConfig() {
    try {
      const filters = [{ filterType: "simple" }];
      const microUrl =
        "https://script.google.com/macros/s/AKfycbxu8C5wGzqsRzvVn2JoXdfzmg29C-PaEGnfNkr4g7pL7Cj8vAcD/exec";
  
      const response = await axios.post(
        microUrl,
        {
          type: "read",
          s_name: "User Config",
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


  const tableBodyPath = 'section.instrument.js-section-content > section.js-table-wrapper.common-table-comp.scroll-view > div.common-table-wrapper > div > table';

  async function scrapData(url, retryCount = 3) {
      const browser = await puppeteer.launch({headless: true});
      const page = await browser.newPage();
      try {
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36');
          await page.setDefaultNavigationTimeout(60000);
          await page.goto(url);
          await page.waitForSelector(tableBodyPath, { timeout: 60000 });
  
          const tableData = await page.evaluate((tableBodyPath) => {
              const table = document.querySelector(tableBodyPath);
              const rows = table.querySelectorAll('tr');
              const data = [];
              rows.forEach(row => {
                  const rowData = [];
                      row.querySelectorAll('td').forEach(cell => {
                          rowData.push(cell.innerText);
                      });
                  data.push(rowData);
              });
              return data;
          }, tableBodyPath);
  
          tableData.shift();
          tableData.unshift(["Date","Price","Open","High","Low","VOlume","Chg%"]);
          await browser.close();
          return {status: true, data: tableData};
      } catch (error) {
        console.log("Error while scraping data:", error);
        if (retryCount > 0) {
					console.log(`Retrying ${retryCount} more times...`);
          await delayFunc();
					await browser.close();
					return scrapData(url, retryCount - 1);
				} else {
          return {status: false, error: error};
				}
      }
  };


  function delayFunc(ms = 30000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
