// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  try {
    // Validate user relationship if needed (e.g., caregiver-user link)
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      senderId,
      receiverId,
      content
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.query; // Could be sender or receiver ID

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    // Mark all messages from this contact as read (where current user is receiver)
    if (contactId) {
      await Message.updateMany(
        { senderId: contactId, receiverId: userId, read: false },
        { $set: { read: true } }
      );
    }

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// Mark all messages from a contact as read
exports.markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.params;

  try {
    const result = await Message.updateMany(
      { senderId: contactId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

exports.markAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.read = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking message as read' });
  }
};

exports.getUnreadCount = async (req, res) => {
  const userId = req.user.id;

  try {
    const count = await Message.countDocuments({
      receiverId: userId,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

exports.getUnreadCountsByContact = async (req, res) => {
  const userId = req.user.id;
  const mongoose = require('mongoose');

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userObjectId,
          read: false
        }
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {};
    unreadCounts.forEach(item => {
      countsMap[item._id.toString()] = item.count;
    });

    res.json({ unreadByContact: countsMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unread counts by contact' });
  }
};