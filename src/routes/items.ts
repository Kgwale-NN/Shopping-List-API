import { IncomingMessage, ServerResponse } from "http";
import { addItem, getItems, getItemById, updateItem, deleteItem } from '../controllers/items'

const sendErrorResponse = (res: ServerResponse, statusCode: number, message: string) => {
    res.writeHead(statusCode, { "content-type": "application/json" })
    res.end(JSON.stringify({ message }))
}

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


            if (isNaN(id)) {
                sendErrorResponse(res, 400, "Invalid Item ID")
                return
            }

            const item = getItemById(id)

            if (!item) {
                sendErrorResponse(res, 404, "Item not found")
                return
            }


            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(item))
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

                try {
                    const { name, quantity, purchased } = JSON.parse(body)

                    if (!name || typeof name !== 'string' || !quantity || typeof quantity !== 'number' || typeof purchased !== 'boolean') {
                        sendErrorResponse(res, 400, "Invalid item data")
                        return
                    }

                    const newItem = addItem(name, quantity, purchased)
                    res.writeHead(201, { "content-type": "application/json" })
                    res.end(JSON.stringify(newItem))
                } catch (error) {
                    sendErrorResponse(res, 400, "Invalid JSON payload")
                }
            })

            return
        }

        if (req.method === "PUT" && id) {
            if (isNaN(id)) {
                sendErrorResponse(res, 400, "Invalid Item ID")
                return
            }

            let body = ""
            req.on("data", (chunk) => {
                body += chunk.toString()
            })
            req.on("end", () => {
                try {
                    const { name, quantity, purchased } = JSON.parse(body)

                    if (name === undefined || typeof name !== 'string' ||
                        quantity === undefined || typeof quantity !== 'number' ||
                        purchased === undefined || typeof purchased !== 'boolean') {
                        sendErrorResponse(res, 400, "Invalid item data")
                        return
                    }

                    const updatedItem = updateItem(id, name, quantity, purchased)

                    if (updatedItem) {
                        res.writeHead(200, { "content-type": "application/json" })
                        res.end(JSON.stringify(updatedItem))
                    } else {
                        sendErrorResponse(res, 404, "Item not found")
                    }
                } catch (error) {
                    sendErrorResponse(res, 400, "Invalid JSON payload")
                }
            })
            return
        }
        if (req.method === "DELETE" && id) {
            if (isNaN(id)) {
                sendErrorResponse(res, 400, "Invalid Item ID")
                return
            }

            const deleted = deleteItem(id)

            if (deleted) {
                res.writeHead(204)
                res.end()
            } else {
                sendErrorResponse(res, 404, "Item not found")
            }
            return
        }
    }
}
