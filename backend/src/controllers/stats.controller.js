const Complaint = require('../models/complaint.model');
const User = require('../models/user.model');

/**
 * Get summary statistics
 * @route GET /api/stats/summary
 * @access Public
 */
exports.getSummaryStats = async (req, res) => {
  try {
    // Total complaints
    const totalComplaints = await Complaint.countDocuments();
    
    // Count by status
    const [
      resolved,
      inProgress,
      pending,
      acknowledged,
      rejected
    ] = await Promise.all([
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'acknowledged' }),
      Complaint.countDocuments({ status: 'rejected' })
    ]);

    // Get average resolution time
    const resolvedComplaints = await Complaint.find({ 
      status: 'resolved',
      resolutionTime: { $exists: true } 
    });
    
    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalResolutionTime = resolvedComplaints.reduce(
        (sum, complaint) => sum + complaint.resolutionTime, 
        0
      );
      avgResolutionTime = Math.round(totalResolutionTime / resolvedComplaints.length);
    }

    // Get citizen count
    const citizenCount = await User.countDocuments({ role: 'citizen' });
    
    // Calculate response rate (acknowledged or in progress or resolved / total)
    const responseRate = totalComplaints > 0 
      ? Math.round(((acknowledged + inProgress + resolved) / totalComplaints) * 100) 
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalComplaints,
        resolved,
        inProgress,
        pending,
        acknowledged,
        rejected,
        avgResolutionTime,
        responseRate,
        citizenCount
      },
    });
  } catch (error) {
    console.error('Get summary stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching statistics',
    });
  }
};

/**
 * Get statistics by category
 * @route GET /api/stats/by-category
 * @access Public
 */
exports.getStatsByCategory = async (req, res) => {
  try {
    const categories = [
      'Road & Infrastructure',
      'Water Supply',
      'Electricity',
      'Waste Management',
      'Street Lighting',
      'Public Safety',
      'Parks & Recreation',
      'Traffic & Transportation',
      'Healthcare',
      'Education',
    ];

    // Get counts for each category with status breakdown
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const total = await Complaint.countDocuments({ category });
        const resolved = await Complaint.countDocuments({ 
          category, 
          status: 'resolved' 
        });
        const pending = await Complaint.countDocuments({ 
          category, 
          status: 'pending' 
        });
        const inProgress = await Complaint.countDocuments({ 
          category, 
          status: { $in: ['in_progress', 'acknowledged'] } 
        });

        // Average resolution time for this category
        const resolvedInCategory = await Complaint.find({ 
          category, 
          status: 'resolved',
          resolutionTime: { $exists: true } 
        });
        
        let avgResolutionTime = 0;
        if (resolvedInCategory.length > 0) {
          const totalTime = resolvedInCategory.reduce(
            (sum, complaint) => sum + complaint.resolutionTime, 
            0
          );
          avgResolutionTime = Math.round(totalTime / resolvedInCategory.length);
        }

        return {
          name: category,
          total,
          resolved,
          pending,
          inProgress,
          avgResolutionTime,
          resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: categoryStats,
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching category statistics',
    });
  }
};

/**
 * Get time series data for complaints
 * @route GET /api/stats/time-series
 * @access Public
 */
exports.getTimeSeriesData = async (req, res) => {
  try {
    // Get the last 12 months
    const months = [];
    const labels = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      months.push({
        start: date,
        end: monthEnd,
        label: date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear()
      });
      
      labels.push(date.toLocaleString('default', { month: 'short' }));
    }

    // Get counts for each month
    const submittedCounts = await Promise.all(
      months.map(async (month) => {
        return await Complaint.countDocuments({
          createdAt: {
            $gte: month.start,
            $lte: month.end
          }
        });
      })
    );

    const resolvedCounts = await Promise.all(
      months.map(async (month) => {
        return await Complaint.countDocuments({
          status: 'resolved',
          statusUpdates: {
            $elemMatch: {
              status: 'resolved',
              createdAt: {
                $gte: month.start,
                $lte: month.end
              }
            }
          }
        });
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        labels,
        datasets: [
          {
            name: 'Submitted',
            data: submittedCounts
          },
          {
            name: 'Resolved',
            data: resolvedCounts
          }
        ]
      },
    });
  } catch (error) {
    console.error('Get time series data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching time series data',
    });
  }
};

/**
 * Get geospatial data for map visualization
 * @route GET /api/stats/map-data
 * @access Public
 */
exports.getMapData = async (req, res) => {
  try {
    const { bounds } = req.query;
    let query = {};
    
    // If map bounds are provided, filter results
    if (bounds) {
      const [west, south, east, north] = bounds.split(',').map(Number);
      
      query = {
        'location.coordinates.0': { $gte: west, $lte: east },
        'location.coordinates.1': { $gte: south, $lte: north }
      };
    }
    
    // Get complaints with location data
    const complaints = await Complaint.find(query)
      .select('title category status location.coordinates upvotes priority createdAt')
      .limit(200); // Limit results to avoid overloading the map

    const mapData = complaints.map(complaint => ({
      id: complaint._id,
      title: complaint.title,
      category: complaint.category,
      status: complaint.status,
      coordinates: complaint.location.coordinates,
      upvotes: complaint.upvotes.length,
      priority: complaint.priority,
      createdAt: complaint.createdAt
    }));

    res.status(200).json({
      status: 'success',
      results: mapData.length,
      data: mapData,
    });
  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching map data',
    });
  }
}; 