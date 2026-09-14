import * as http from "http"
import type { IncomingMessage, ServerResponse } from "http"
import {itemsRoutes} from './routes/items'

const PORT = 2000

const handleListener = (req:IncomingMessage, res:ServerResponse)=> {

 

  if(req.url?.startsWith("/items")){

    itemsRoutes(req,res)

  }else{

       res.writeHead(404, {"content-type":"application/json"})
       res.end(JSON.stringify({message: "Route not found"}))
  }
}

const server = http.createServer(handleListener)

server.listen(PORT , () => {

    console.log(`the server is running on http://localhost:${PORT}`)
})
