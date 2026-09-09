import * as http from "http"
import type { IncomingMessage, ServerResponse } from "http"

const PORT = 2000

const handleListener = (req:IncomingMessage, res:ServerResponse)=> {

    res.writeHead(200 ,{"content-type" : "application/json"})
    res.end(JSON.stringify({message : "Hello User"}))

}

const server = http.createServer(handleListener)

server.listen(PORT , () => {

    console.log(`the server is running on http://localhost:${PORT}`)
})