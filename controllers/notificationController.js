const Notification = require('../models/Notification');
const Application = require('../models/Application');

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    let studentCourses = [];
    if (req.user.role === 'student') {
      const apps = await Application.find({ user: req.user._id }).select('selectedCourse');
      studentCourses = apps.map(a => a.selectedCourse);
    }

    const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 }).limit(50);

    const filtered = notifications.filter(n => {
      // targetRole must be 'all' or match the user's role
      const roleMatch = n.targetRole === 'all' || n.targetRole === req.user.role;
      if (!roleMatch) return false;
      // if a specific class is targeted, only show to students enrolled in that class
      if (n.targetClass) {
        if (req.user.role !== 'student') return false;
        return studentCourses.includes(n.targetClass);
      }
      return true;
    });

    const userIdStr = req.user._id.toString();
    const enriched = filtered.slice(0, 20).map(n => ({
      ...n.toObject(),
      isRead: n.readBy.some(id => id.toString() === userIdStr),
    }));

    res.json({ success: true, notifications: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
