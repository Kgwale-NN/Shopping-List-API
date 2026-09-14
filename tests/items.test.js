const assert = require('node:assert/strict')
const http = require('node:http')
const test = require('node:test')
require('ts-node/register')

const { itemsRoutes } = require('../src/routes/items')

test('shopping item routes', async (t) => {
    const server = http.createServer(itemsRoutes)
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

    const address = server.address()
    const baseUrl = `http://127.0.0.1:${address.port}`
    const request = (path, options) => fetch(baseUrl + path, {
        signal: AbortSignal.timeout(2000),
        ...options
    })

    try {
        let itemId

        await t.test('POST creates an item', async () => {
            const response = await request('/items', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'Milk', quantity: 2, purchased: false })
            })
            assert.equal(response.status, 201)
            const item = await response.json()
            assert.equal(item.name, 'Milk')
            assert.equal(item.quantity, 2)
            assert.equal(item.purchased, false)
            itemId = item.id
        })

        await t.test('GET returns all items and one item', async () => {
            const allResponse = await request('/items')
            assert.equal(allResponse.status, 200)
            const items = await allResponse.json()
            assert.equal(items.some((item) => item.id === itemId), true)

            const oneResponse = await request(`/items/${itemId}`)
            assert.equal(oneResponse.status, 200)
            assert.equal((await oneResponse.json()).name, 'Milk')
        })

        await t.test('PUT updates an item', async () => {
            const response = await request(`/items/${itemId}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'Milk', quantity: 3, purchased: true })
            })
            assert.equal(response.status, 200)
            const item = await response.json()
            assert.equal(item.quantity, 3)
            assert.equal(item.purchased, true)
        })

        await t.test('invalid item data returns 400', async () => {
            for (const body of [
                { quantity: 2, purchased: false },
                { name: ' ', quantity: 2, purchased: false },
                { name: 'Milk', quantity: -1, purchased: false },
                { name: 'Milk', quantity: 2 }
            ]) {
                const response = await request('/items', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body)
                })
                assert.equal(response.status, 400)
            }
        })

        await t.test('malformed JSON returns 400', async () => {
            const response = await request('/items', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: '{bad json'
            })
            assert.equal(response.status, 400)
        })

        await t.test('invalid IDs and unmatched routes return errors', async () => {
            assert.equal((await request('/items/abc')).status, 400)
            assert.equal((await request('/items/0')).status, 400)
            assert.equal((await request('/items/999999')).status, 404)
            assert.equal((await request('/items/1/extra')).status, 404)
            assert.equal((await request('/items', { method: 'PATCH' })).status, 404)
        })

        await t.test('DELETE removes an item', async () => {
            const response = await request(`/items/${itemId}`, { method: 'DELETE' })
            assert.equal(response.status, 204)
            assert.equal(await response.text(), '')
            assert.equal((await request(`/items/${itemId}`)).status, 404)
        })
    } finally {
        await new Promise((resolve) => server.close(resolve))
    }
})
