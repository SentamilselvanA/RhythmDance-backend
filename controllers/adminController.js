const User = require('../models/User');
const Class = require('../models/Class');
const Application = require('../models/Application');
const Enquiry = require('../models/Enquiry');
const Faculty = require('../models/Faculty');

exports.getDashboardStats = async (req, res) => {
  try {
    // ── Overview counts ───────────────────────────────────────────────────
    const [
      totalStudents,
      totalClasses,
      totalApplications,
      totalEnquiries,
      totalFaculty,
      pendingApplications,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Class.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Enquiry.countDocuments(),
      Faculty.countDocuments({ isActive: true }),
      Application.countDocuments({ status: 'Pending' }),
    ]);

    // ── Students by Class (bar chart) ─────────────────────────────────────
    // Group approved applications by selectedCourse to show enrollment per class
    const studentsByClassRaw = await Application.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$selectedCourse', students: { $sum: 1 } } },
      { $sort: { students: -1 } },
    ]);
    const studentsByClass = studentsByClassRaw.map(item => ({
      name: item._id,
      students: item.students,
    }));

    // ── Application Status breakdown (pie chart) ──────────────────────────
    const applicationStatusRaw = await Application.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
    ]);
    const applicationStatus = applicationStatusRaw.map(item => ({
      name: item._id,
      value: item.value,
    }));

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalClasses,
        totalApplications,
        totalEnquiries,
        totalFaculty,
        pendingApplications,
      },
      studentsByClass,
      applicationStatus,
    });
  } catch (err) {
    console.error('[AdminDashboard] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
