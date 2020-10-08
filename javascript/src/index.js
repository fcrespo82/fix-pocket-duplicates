//@ts-check

const pocket = require("./pocket");

async function main() {
  console.log("Authenticating");
  let data = await pocket.authFlow(
    "28837-2ef234f6a409d3b25f16af5a",
    "http://localhost:3000"
  );
  console.log("Getting data");
  let dados = await pocket.get(data);
  console.log("Finished");
  // Object.entries(dados.list).map(arr => {
  //   console.log(arr[1].resolved_id)
  // })
}

main();
