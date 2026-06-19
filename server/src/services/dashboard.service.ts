import Booking from '../models/Booking';
import User from '../models/User';
import Car from '../models/Car';
import Payment from '../models/Payment';

export class DashboardService {
  static async getUserOverview(userId: string) {
    const totalBookings = await Booking.countDocuments({ userId });
    const activeBookings = await Booking.countDocuments({ userId, status: 'ACTIVE' });
    const completedBookings = await Booking.countDocuments({ userId, status: 'COMPLETED' });
    const totalSpent = await Booking.aggregate([
      { $match: { userId, paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return {
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent: totalSpent[0]?.total || 0,
      }
    };
  }

  static async getAdminStats() {
    // 1. Overview metrics
    const totalUsers = await User.countDocuments({ role: { $ne: 'ADMIN' } });
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'ACTIVE' });
    const availableCars = await Car.countDocuments({ isAvailable: true });
    const pendingBookings = await Booking.countDocuments({ status: 'PENDING' });

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // 2. Recent Tables
    const recentUsers = await User.find({ role: { $ne: 'ADMIN' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .populate('carId', 'name');

    const recentPayments = await Payment.find({ status: 'SUCCESS' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    // 3. Analytics Aggregations (Last 6 Months)
    const last6MonthsDate = new Date();
    last6MonthsDate.setMonth(last6MonthsDate.getMonth() - 5);
    last6MonthsDate.setDate(1);
    last6MonthsDate.setHours(0, 0, 0, 0);

    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last6MonthsDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0]
            }
          },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Map month indices to names (Jan, Feb...)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months list with 0s to guarantee continuous data points
    const trendsMap = new Map<string, { name: string, value: number, bookings: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth(); // 0-11
      const key = `${year}-${monthIndex + 1}`;
      trendsMap.set(key, {
        name: `${monthNames[monthIndex]} ${year.toString().slice(-2)}`,
        value: 0,
        bookings: 0
      });
    }

    // Populate with actual DB statistics
    monthlyStats.forEach(stat => {
      const key = `${stat._id.year}-${stat._id.month}`;
      if (trendsMap.has(key)) {
        const item = trendsMap.get(key)!;
        item.value = stat.revenue;
        item.bookings = stat.bookings;
      }
    });

    const revenueData = Array.from(trendsMap.values());

    // 4. Top Booked Cars
    const topBookedCars = await Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$carId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'cars', localField: '_id', foreignField: '_id', as: 'car' } },
      { $unwind: '$car' },
      { $project: { name: '$car.name', count: 1 } }
    ]);

    // 5. Most Active Users
    const mostActiveUsers = await Booking.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', count: 1 } }
    ]);

    return {
      overview: {
        revenue: totalRevenue,
        bookings: totalBookings,
        pending: pendingBookings,
        active: activeBookings,
        users: totalUsers,
        cars: totalCars,
        availableCars: availableCars
      },
      recentUsers,
      recentBookings,
      recentPayments,
      revenueData,
      topBookedCars,
      mostActiveUsers
    };
  }
}
