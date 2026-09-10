import {Item} from '../types/items'

let items:Item[] = []
let currentId = 1

export const addItem = (name:string,quantity:number,status:string) =>{

    const newItem = {id:currentId++,name,quantity,status}
    items.push(newItem)
    return newItem
}

export const getItems = ():Item[] => {

    return items
}

