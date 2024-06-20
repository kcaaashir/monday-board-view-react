export const getGroupsQuery = (boardId) => {
    return `
        query {
          boards(ids: ${boardId}) {
            groups {
              id
              title
            }
          }
        }
      `
}

export const getColumnsQuery = (boardId) => {
    return `
        query {
          boards(ids: ${boardId}) {
            columns {
              id
              title
              type
            }
          }
        }
      `
}

export const changeColumnValueQuery = (itemId, boardId, statusColumnId) => {
    return `
      mutation {
        change_simple_column_value(item_id: ${itemId}, board_id:${boardId} column_id: "${statusColumnId}", value: "Duplicate") {
          id
        }
      }
    `
}

export const moveToAnotherGroupQuery = (itemId, groupToMoveItem) => {
    return `
     mutation {
       move_item_to_group (item_id: ${itemId}, group_id: "${groupToMoveItem}") {
         id
       }
     }
   `;
}

export const getAllItemQuery = (boardId, column) => {
    return `
                query {
                    boards(ids: ${boardId}) {
                    items_page{
                    cursor
                        items {
                        id
                        name
                        column_values(ids: [${column}, "status"]) {
                            id
                            text
                            value
                        }
            
                        }
                        }
                    }
                    }
                `
}

export const getNewItemQuery = (itemIds, column) => {
    return `
                    query {
                    items(ids: [${itemIds}]) {
                        name
                        column_values(ids: [${column}, "status"]) {
                        id
                        text
                        value
                        }
                    }
                    }
                `;
}