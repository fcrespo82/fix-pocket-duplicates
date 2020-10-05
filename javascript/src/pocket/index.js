//@ts-check

function pocket() {

  const axios = require('axios').default

  const fs = require('fs')

  function authorizeUrl(code, redirect_url) {
    return `https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirect_url}`
  }

  const ENDPOINTS = {
    "REQUEST_TOKEN": "https://getpocket.com/v3/oauth/request",
    "AUTHORIZE": authorizeUrl,
    "ACCESS_TOKEN": "https://getpocket.com/v3/oauth/authorize",
    "GET": "https://getpocket.com/v3/get"
  }

  const POCKET_HEADERS = {
    "Content-Type": "application/json; charset=UTF8",
    "X-Accept": "application/json"
  }

  function requestToken(consumer_key, redirect_url) {
    const payload = {
      "consumer_key": consumer_key,
      "redirect_uri": redirect_url
    }

    return axios
      .post(ENDPOINTS.REQUEST_TOKEN, payload, { headers: { POCKET_HEADERS } })
      .then(res => {
        return res.data.split("=")[1]
      })
      .catch(error => {
        console.error(error)
      })
  }

  function authorize(code, redirect_url) {
    return new Promise(function (resolve, reject) {
      const open = require("open")
      open(authorizeUrl(code, redirect_url))
      const http = require("http")

      let server = http.createServer(function (req, res) {
        res.write('You can close this tab.'); //write a response to the client
        res.end(); //end the response
        server.close();
        resolve()
      }).listen(3000);
    })
  }

  function accessToken(consumer_key, code) {
    const payload = {
      "consumer_key": consumer_key,
      "code": code
    }

    return axios
      .post(ENDPOINTS.ACCESS_TOKEN, payload, { headers: { POCKET_HEADERS } })
      .then(res => {
        // @ts-ignore
        return Object.fromEntries(new URLSearchParams(res.data));
      })
      .catch(error => {
        console.error(error)
      })
  }

  function authFlow(consumer_key, redirect_url) {
    return new Promise(function (resolve, reject) {
      fs.readFile("pocket-auth.json", "utf-8", (err, data) => {
        if (err) {
          requestToken(consumer_key, redirect_url).then(code => {
            return authorize(code, redirect_url).then(_ => {
              return accessToken(consumer_key, code).then(r => {
                r["consumer_key"] = consumer_key
                fs.writeFile("pocket-auth.json", JSON.stringify(r), (err) => {
                  if (err) console.log(err);
                  console.log("Successfully Written to File.");
                });

                return resolve(r)
              })
            })
          })
        }
        else {
          return resolve(JSON.parse(data));
        }
      })
    })
  }

  function get(payload) {
    return axios.post(ENDPOINTS.GET, payload, { headers: { POCKET_HEADERS } }).then(response => {
      return Promise.resolve(response.data)
    })
      .catch(error => {
        console.error(error)
      })
  }

  return {
    authFlow,
    get
  }
}

module.exports = pocket()
