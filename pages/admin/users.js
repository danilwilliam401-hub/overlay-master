import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { useState } from 'react';
import styles from '../../styles/Admin.module.css';

const prisma = new PrismaClient();

export default function AdminUsers({ users, stats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort users
  const filteredUsers = users
    .filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const order = sortOrder === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>User Management</h1>
        <p>Monitor all registered users and their activity</p>
      </header>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalUsers}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔑</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalApiKeys}</div>
            <div className={styles.statLabel}>Active API Keys</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalRequests.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Requests</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎨</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalBanners}</div>
            <div className={styles.statLabel}>Banners Generated</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.resultCount}>
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort('email')} className={styles.sortable}>
                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('name')} className={styles.sortable}>
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('createdAt')} className={styles.sortable}>
                Registered {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('apiKeysCount')} className={styles.sortable}>
                API Keys {sortBy === 'apiKeysCount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('requestsCount')} className={styles.sortable}>
                Requests {sortBy === 'requestsCount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('bannersCount')} className={styles.sortable}>
                Banners {sortBy === 'bannersCount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.emailCell}>
                    <span className={styles.email}>{user.email}</span>
                    {user.emailVerified && (
                      <span className={styles.verified} title="Email verified">✓</span>
                    )}
                  </div>
                </td>
                <td>{user.name || '-'}</td>
                <td className={styles.dateCell}>{formatDate(user.createdAt)}</td>
                <td className={styles.numberCell}>
                  <span className={styles.badge}>{user.apiKeysCount}</span>
                </td>
                <td className={styles.numberCell}>
                  <span className={styles.badge}>{user.requestsCount.toLocaleString()}</span>
                </td>
                <td className={styles.numberCell}>
                  <span className={styles.badge}>{user.bannersCount}</span>
                </td>
                <td className={styles.dateCell}>
                  {user.lastActivity ? formatDate(user.lastActivity) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className={styles.emptyState}>
          <p>No users found matching your search.</p>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Require authentication
  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  // Require admin role
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!currentUser?.isAdmin) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  try {
    // Fetch all users with their related data
    const users = await prisma.user.findMany({
      include: {
        apiKeys: {
          where: { revokedAt: null },
          include: {
            usage: {
              select: { id: true, createdAt: true },
            },
          },
        },
        banners: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for display
    const usersData = users.map(user => {
      // Aggregate usage across all API keys
      const allUsage = user.apiKeys.flatMap(key => key.usage);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified ? true : false,
        createdAt: user.createdAt.toISOString(),
        apiKeysCount: user.apiKeys.length,
        requestsCount: allUsage.length,
        bannersCount: user.banners.length,
        lastActivity: allUsage.length > 0 
          ? allUsage.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt.toISOString()
          : null,
      };
    });

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalApiKeys: users.reduce((sum, u) => sum + u.apiKeys.length, 0),
      totalRequests: usersData.reduce((sum, u) => sum + u.requestsCount, 0),
      totalBanners: users.reduce((sum, u) => sum + u.banners.length, 0),
    };

    return {
      props: {
        users: usersData,
        stats,
      },
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return {
      props: {
        users: [],
        stats: {
          totalUsers: 0,
          totalApiKeys: 0,
          totalRequests: 0,
          totalBanners: 0,
        },
      },
    };
  }
}
