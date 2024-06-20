export const checkForDuplicates = (newItem, existingItems) => {
    const newItemData = newItem.column_values[1].text;
    const filteredItems = existingItems.filter(item => {
        const columnValue = item.column_values[1].text;
        if (columnValue === newItemData) {
            return true;
        }
        return false;
    });

    if (filteredItems.length > 1) {
        return true;
    } else return false;
};