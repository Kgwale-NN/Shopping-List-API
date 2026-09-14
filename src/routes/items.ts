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

        if (parts[1] !== "items" || parts.length > 3 || (parts.length === 3 && !parts[2])) {
            sendErrorResponse(res, 404, "Route not found")
            return
        }

        const id = parts[2] === undefined ? undefined : Number(parts[2])

        if (id !== undefined && (!Number.isInteger(id) || id <= 0)) {
            sendErrorResponse(res, 400, "Invalid Item ID")
            return
        }

        if (req.method === 'GET' && id === undefined) {

            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(getItems()))
            return
        }

        if (req.method === 'GET' && id !== undefined) {

            const item = getItemById(id)

            if (!item) {
                sendErrorResponse(res, 404, "Item not found")
                return
            }


            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(item))
            return

        }

        if (req.method === "POST" && id === undefined) {

            let body = ""

            req.on("data", (chunk) => {

                console.log(chunk, "chunk")
                body += chunk.toString()
                console.log(body, "body")


            })

            req.on("end", () => {

                try {
                    const { name, quantity, purchased } = JSON.parse(body)

                    if (typeof name !== 'string' || name.trim() === '' ||
                        typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0 ||
                        typeof purchased !== 'boolean') {
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

        if (req.method === "PUT" && id !== undefined) {

            let body = ""
            req.on("data", (chunk) => {
                body += chunk.toString()
            })
            req.on("end", () => {
                try {
                    const { name, quantity, purchased } = JSON.parse(body)

                    if (typeof name !== 'string' || name.trim() === '' ||
                        typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0 ||
                        typeof purchased !== 'boolean') {
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
        if (req.method === "DELETE" && id !== undefined) {

            const deleted = deleteItem(id)

            if (deleted) {
                res.writeHead(204)
                res.end()
            } else {
                sendErrorResponse(res, 404, "Item not found")
            }
            return
        }

        sendErrorResponse(res, 404, "Route not found")
    }
}
