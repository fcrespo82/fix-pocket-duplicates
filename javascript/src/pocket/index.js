//@ts-check

function pocket() {
  const axios = require("axios").default;
  const fs = require("fs");
  const http = require("http");

  function authorizeUrl(code, redirect_url) {
    return `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirect_url}`;
  }

  const ENDPOINTS = {
    REQUEST_TOKEN: "https://getpocket.com/v3/oauth/request",
    AUTHORIZE: authorizeUrl,
    ACCESS_TOKEN: "https://getpocket.com/v3/oauth/authorize",
    GET: "https://getpocket.com/v3/get",
  };

  const POCKET_HEADERS = {
    "Content-Type": "application/json; charset=UTF8",
    "X-Accept": "application/json",
  };

  async function requestToken(consumer_key, redirect_url) {
    const payload = {
      consumer_key: consumer_key,
      redirect_uri: redirect_url,
    };

    try {
      let response = await axios.post(ENDPOINTS.REQUEST_TOKEN, payload, {
        headers: { POCKET_HEADERS },
      });
      return response.data.split("=")[1];
    } catch (error) {
      console.error(error);
    }
  }

  async function authorize(code, redirect_url) {
    return new Promise(function (resolve, reject) {
      const open = require("open");

      open(authorizeUrl(code, redirect_url));

      let server = http
        .createServer(function (req, res) {
          res.write("You can close this tab."); //write a response to the client
          res.end(); //end the response
          server.close();
          resolve();
        })
        .listen(3000);
    });
  }

  async function accessToken(consumer_key, code) {
    const payload = {
      consumer_key: consumer_key,
      code: code,
    };

    try {
      let response = await axios.post(ENDPOINTS.ACCESS_TOKEN, payload, {
        headers: { POCKET_HEADERS },
      });
      // @ts-ignore
      return Object.fromEntries(new URLSearchParams(response.data));
    } catch (error) {
      console.error(error);
    }
  }

  async function authFlow(consumer_key, redirect_url) {
    return new Promise(function (resolve, reject) {
      fs.readFile("pocket-auth.json", "utf-8", async (err, data) => {
        if (err) {
          let code = await requestToken(consumer_key, redirect_url);
          await authorize(code, redirect_url);
          let r = await accessToken(consumer_key, code);
          r["consumer_key"] = consumer_key;
          fs.writeFile("pocket-auth.json", JSON.stringify(r), (err) => {
            if (err) console.log(err);
            console.log("Successfully Written to File.");
          });
          return resolve(r);
        } else {
          return resolve(JSON.parse(data));
        }
      });
    });
  }

  async function get(payload) {
    try {
      let response = await axios.post(ENDPOINTS.GET, payload, {
        headers: { POCKET_HEADERS },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    authFlow,
    get,
  };
}

module.exports = pocket();
