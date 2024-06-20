import mondaySdk from "monday-sdk-js";
import 'monday-ui-react-core/dist/main.css';
import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown, Button, Toast } from 'monday-ui-react-core';

import '../App.css';
import {
    changeColumnValueQuery,
    getAllItemQuery,
    getColumnsQuery,
    getGroupsQuery,
    getNewItemQuery,
    moveToAnotherGroupQuery
} from "../query/query.js";
import { checkForDuplicates } from "../utility/helperFunction.js";

const monday = mondaySdk();

const BoardSetting = () => {
    const [groups, setGroups] = useState([]);
    const [action, setAction] = useState('');
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [selectedColumn, setSelectedColumn] = useState([]);
    const [statusColumnId, setStatusColumnId] = useState('');
    const [groupToMoveItem, setGroupToMoveItem] = useState('');
    const [toastType, setToastType] = useState(Toast.types.POSITIVE);

    useEffect(() => {
        fetchColumns();
        fetchGroups();
    }, []);

    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 5000); // Auto-hide after 5 seconds
    };

    const fetchGroups = async () => {
        try {
            const context = await monday.get('context');
            let boardId = context.data.boardId;
            const fetchGroupsQuery = getGroupsQuery(boardId)
            const response = await monday.api(fetchGroupsQuery);
            if (response.data && response.data.boards && response.data.boards[0].groups) {
                setGroups(response.data.boards[0].groups);
                const filteredGroups = response.data.boards[0].groups.filter(data => data.title === 'Duplicates');
                if (filteredGroups.length > 0) {
                    setGroupToMoveItem(filteredGroups[0].id);
                }
            } else {
                console.error('Error fetching groups:', response);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleItemCreated = async (eventData) => {
        const context = await monday.get('context');
        const newItemIds = eventData?.data?.itemIds;
        if (newItemIds) {
            try {
                const column = selectedColumn.map(id => `"${id}"`).join(',');
                const query = getNewItemQuery(newItemIds, column)
                const response = await monday.api(query);
                const newItem = response.data.items[0];

                const boardId = context.data.boardId;
                const allItemsQuery = getAllItemQuery(boardId, column)
                const allItemsResponse = await monday.api(allItemsQuery);
                const existingItems = allItemsResponse.data.boards[0].items_page.items;

                // Check for duplicates
                const duplicatesExist = checkForDuplicates(newItem, existingItems);

                if (duplicatesExist) {
                    if (action === 'change-status' && newItem.column_values[0].text !== 'Duplicate') {
                        await changeStatusAsDuplicate(newItemIds[0], context.data.boardId);
                    }
                    else if (action === 'move-to-board') {
                        await moveToDuplicateGroup(newItemIds[0], context.data.boardId)
                    }
                }
            } catch (error) {
                console.error('Error handling item creation:', error);
            }
        }
    };


    const handleItemChanged = async (eventData) => {
        const context = await monday.get('context');
        const newItemIds = eventData?.data?.itemIds;
        if (newItemIds) {
            try {
                const column = selectedColumn.map(id => `"${id}"`).join(',');
                const boardId = context.data.boardId;
                const allItemsQuery = getAllItemQuery(boardId, column)
                const allItemsResponse = await monday.api(allItemsQuery);
                const existingItems = allItemsResponse.data.boards[0].items_page.items;
                const updatedItem = existingItems.find(item => item.id == newItemIds[0]);
                const duplicatesExist = checkForDuplicates(updatedItem, existingItems);

                if (duplicatesExist) {
                    if (action === 'change-status' && updatedItem.column_values[0]?.text !== 'Duplicate') {
                        await changeStatusAsDuplicate(newItemIds[0], context.data.boardId);
                    }
                    else if (action === 'move-to-board') {
                        await moveToDuplicateGroup(newItemIds[0], context.data.boardId)
                    }
                }
            } catch (error) {
                console.error('Error handling item creation:', error);
            }
        }
    };

    const moveToDuplicateGroup = async (itemId, boardId) => {
        if (groupToMoveItem) {
            const query = moveToAnotherGroupQuery(itemId, groupToMoveItem);
            await monday.api(query);
        }

    };

    const changeStatusAsDuplicate = async (itemId, boardId) => {
        try {
            const mutationQuery = changeColumnValueQuery(itemId, boardId, statusColumnId);
            await monday.api(mutationQuery);
        } catch (ex) {
            console.log('error', ex);
        }

    };

    const fetchColumns = async () => {
        try {
            const context = await monday.get('context');
            let boardId = context.data.boardId;
            const fetchColumnsQuey = getColumnsQuery(boardId);
            const response = await monday.api(fetchColumnsQuey);
            if (response.data && response.data.boards && response.data.boards[0].columns) {
                setColumns(response.data.boards[0].columns);
            } else {
                console.error('Error fetching columns:', response);
            }
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            if (!selectedColumn || !action) {
                showToast("Please select a column and an action", Toast.types.NEGATIVE)
                return;
            }

            if (action === 'move-to-board') {
                const filteredGroups = groups.filter(data => data.title === 'Duplicates');
                if (filteredGroups.length < 0) {
                    showToast("Create group name 'Duplicate'..", Toast.types.NEGATIVE);
                }
                await moveToGroup(selectedColumn);
            } else if (action === 'change-status') {
                await changeStatus();
            }
            showToast('Settings saved successfully', Toast.types.POSITIVE);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const moveToGroup = async () => {
        if (groupToMoveItem) {
            monday.listen('new_items', handleItemCreated);
            monday.listen('change_column_values', handleItemChanged);
        }
    };

    const closeToast = () => {
        setToastOpen(false);
    };

    const toastActions = useMemo(() => [{
        type: Toast.actionTypes.BUTTON,
        content: "Close",
        onClick: closeToast
    }], []);

    const changeStatus = async () => {
        try {
            monday.listen('new_items', handleItemCreated);
            monday.listen('change_column_values', handleItemChanged);
        } catch (ex) {
            console.log('ex', ex)
        }
    };

    return (
        <>
            <div className="dropdown-container">
                <label className="label">Select Column to Monitor for Duplicates:</label>
                <Dropdown
                    placeholder="Select a column"
                    multi
                    className="dropdown-stories-styles_with-chips"
                    options={columns.map(col => ({ value: col.id, label: col.title }))}
                    onChange={selectedOptions => {
                        console.log('selectedOptions', selectedOptions.map(option => option.value))
                        setSelectedColumn(selectedOptions.map(option => option.value))
                    }}
                />
            </div>

            <div className="dropdown-container">
                <label className="label">Select Action When Duplicate Found:</label>
                <Dropdown
                    placeholder="Select an action"
                    options={[
                        { value: 'move-to-board', label: 'Move to Another Board Group' },
                        { value: 'change-status', label: 'Change Status to Duplicate' },
                    ]}
                    onChange={option => {
                        const statusColumnId = columns.filter(col => col.type === 'status').map(col => ({ value: col.id, label: col.title }))
                        console.log('statusColumnId', statusColumnId[0].value);
                        setStatusColumnId(statusColumnId[0].value);
                        setAction(option.value);
                    }}
                    value={action.value}
                />
            </div>

            <Button className="save-button" onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>

            {toastOpen && (
                <Toast open type={toastType} actions={toastActions} onClose={() => setToastOpen(false)} autoHideDuration={5000} className="custom-toast">
                    {toastMessage}
                </Toast>
            )}
        </>
    );
};

export default BoardSetting;