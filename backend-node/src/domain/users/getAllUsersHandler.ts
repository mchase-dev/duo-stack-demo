import { User } from '../../models';
import { Op } from 'sequelize';

/**
 * Get All Users Handler
 * Retrieves all users with pagination and optional search (Admin+ only)
 */
export async function getAllUsersHandler(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const { page, pageSize, search } = params;
  const offset = (page - 1) * pageSize;

  // Build where clause for search
  const whereClause: any = {};

  if (search && search.trim()) {
    const searchTerm = `%${search.toLowerCase()}%`;
    whereClause[Op.or] = [
      // Case-insensitive search across username, email, firstName, lastName
      { username: { [Op.iLike]: searchTerm } },
      { email: { [Op.iLike]: searchTerm } },
      { firstName: { [Op.iLike]: searchTerm } },
      { lastName: { [Op.iLike]: searchTerm } },
    ];
  }

  // Get users with pagination, excluding soft-deleted users (paranoid mode)
  const { count, rows: items } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['passwordHash'] },
    limit: pageSize,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    items,
    total: count,
    page,
    pageSize,
  };
}
