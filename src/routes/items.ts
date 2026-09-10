import { IncomingMessage, ServerResponse } from "http";
import { addItem, getItems, getItemById, updateItem, deleteItem } from '../controllers/items'

export const itemsRoutes = (req: IncomingMessage, res: ServerResponse) => {

    if (req.url?.startsWith("/items")) {

        console.log(req.url, 'request url')

        const parts = req.url.split("/")

        console.log(parts, 'request url parts')

        const id = parts[2] ? parseInt(parts[2]) : undefined

        if (req.method === 'GET' && !id) {

            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(getItems()))
            return
        }

        if (req.method === 'GET' && id) {


            const item = getItemById(id)

            res.writeHead(item ? 200 : 404, { "content-type": "application/json" })
            res.end(JSON.stringify(item || { message: "Not Found" }))
            return

        }

        if (req.method === "POST") {

            let body = ""

            req.on("data", (chunk) => {

                console.log(chunk, "chunk")
                body += chunk.toString()
                console.log(body, "body")


            })

            req.on("end", () => {

                const { name, quantity, purchased } = JSON.parse(body)
                const newItem = addItem(name, quantity, purchased)

                res.writeHead(201, { "content-type": "application/json" })
                res.end(JSON.stringify(newItem))

            })

            return
        }

        if (req.method === "PUT" && id) {

            let body = ""

            req.on("data", (chunk) => {
                body += chunk.toString()
            })

            req.on("end", () => {
                const { name, quantity, purchased } = JSON.parse(body)

                const updatedItem = updateItem(
                    id,
                    name,
                    quantity,
                    purchased
                )

                res.writeHead(updatedItem ? 200 : 404, {
                    "content-type": "application/json"
                })

                res.end(JSON.stringify(
                    updatedItem || { message: "Item not found" }
                ))
            })

            return
        }

        if (req.method === "DELETE" && id) {

            const deleted = deleteItem(id)

            res.writeHead(deleted ? 200 : 404, {
                "content-type": "application/json"
            })

            res.end(JSON.stringify(
                deleted
                    ? { message: "Item deleted successfully" }
                    : { message: "Item not found" }
            ))

            return
        }
    }
}
