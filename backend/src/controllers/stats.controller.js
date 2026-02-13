const User = require('../models/user.model');
const Student = require('../models/student.model');
const Offer = require('../models/offer.model');
const Application = require('../models/application.model');
const Internship = require('../models/internship.model');

// GET /api/stats/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [
      totalStudents, totalOffers, publishedOffers,
      totalApplications, pendingApplications, acceptedApplications,
      activeInternships, completedInternships,
      applicationsByStatus, offersByDomain, applicationsTrend
    ] = await Promise.all([
      Student.countDocuments(),
      Offer.countDocuments(),
      Offer.countDocuments({ status: 'published' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'accepted' }),
      Internship.countDocuments({ status: 'active' }),
      Internship.countDocuments({ status: 'completed' }),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Offer.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$domain', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 }
      ]),
      Application.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    res.json({
      kpis: {
        totalStudents, totalOffers, publishedOffers,
        totalApplications, pendingApplications, acceptedApplications,
        activeInternships, completedInternships,
        acceptanceRate: totalApplications > 0
          ? Math.round((acceptedApplications / totalApplications) * 100) : 0
      },
      charts: {
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count; return acc;
        }, {}),
        offersByDomain: offersByDomain.map(d => ({ domain: d._id, count: d.count })),
        applicationsTrend: applicationsTrend.map(t => ({
          period: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
          count: t.count
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
