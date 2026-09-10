import { Item } from '../types/items'

let items: Item[] = []
let currentId = 1

export const addItem = (name: string, quantity: number, purchased: boolean) => {

    const newItem = { id: currentId++, name, quantity, purchased }
    items.push(newItem)
    return newItem
}

export const getItems = (): Item[] => {

    return items
}

export const getItemById = (id: number): Item | undefined => {

    const item = items.find((item) => item.id === id)

    if (!item) {

        return undefined
    }

    return item
}

export const updateItem = (id: number, newName: string, newQuantity: number, newPurchased: boolean): Item | undefined => {

    const item = items.find((Item) => Item.id === id)

    if (!item) {

        return undefined
    }

    item.name = newName
    item.quantity = newQuantity
    item.purchased = newPurchased

    return item
}

export const deleteItem = (id:number): boolean =>{

   const itemIndex = items.findIndex((item) => item.id === id)

   if(itemIndex === -1){

    return false
   }

   items.splice(itemIndex ,1)
   return true
}

