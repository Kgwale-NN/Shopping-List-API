import {Item} from '../types/items'

let items:Item[] = []
let currentId = 1

export const addItem = (name:string,quantity:number,purchased:boolean) =>{

    const newItem = {id:currentId++,name,quantity,purchased}
    items.push(newItem)
    return newItem
}

export const getItems = ():Item[] => {

    return items
}

export const getItemById = (id:number):Item | undefined =>{

    const item = items.find((item) => item.id === id)
    return item
}