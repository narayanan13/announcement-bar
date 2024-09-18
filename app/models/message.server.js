import db from "../db.server";

export async function getMessage(id) {
    if (!id) throw new Error('Invalid message ID');
    try {
        return await db.message.findUnique({ where: { id } });
    } catch (error) {
        console.error(`Error fetching message with id ${id}:`, error);
        throw new Error('Error fetching message');
    }
}

export async function createMessage(data) {
    if (!data.messageText) throw new Error('Message text is required');
    try {
        return await db.message.create({ data });
    } catch (error) {
        console.error('Error creating message:', error);
        throw new Error('Error creating message');
    }
}

export async function updateMessage(id, data) {
    if (!id) throw new Error('Invalid message ID');
    if (!data || Object.keys(data).length === 0) throw new Error('No data provided for update');
    try {
        return await db.message.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.error(`Error updating message with id ${id}:`, error);
        throw new Error('Error updating message');
    }
}

export async function deleteMessage(id) {
    if (!id) throw new Error('Invalid message ID');
    try {
        return await db.message.delete({ where: { id } });
    } catch (error) {
        console.error(`Error deleting message with id ${id}:`, error);
        throw new Error('Error deleting message');
    }
}
