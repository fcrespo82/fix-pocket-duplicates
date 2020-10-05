//@ts-check

const pocket = require("./pocket")

async function main() {
  await pocket.authFlow('28837-2ef234f6a409d3b25f16af5a', 'http://localhost:3000').then(data => {
    // console.log(data)
    pocket.get(data).then(dados => {
      Object.entries(dados.list).map(arr => {
        console.log(arr[1].resolved_id)
      })

    })
  })

}

main()