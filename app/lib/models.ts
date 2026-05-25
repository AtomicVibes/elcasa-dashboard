import type { Sequelize } from 'sequelize';

import { getDbConfig } from './db';

const globalForSequelize = globalThis as unknown as {
  sequelizeInstance: Sequelize | undefined;
  models: Models | undefined;
};

export type CustomerRole = 'client' | 'contractor' | 'architect';
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type LeaveStatus = 'pending' | 'approved' | 'denied' | 'cancelled';
export type LeaveType =
  | 'vacation'
  | 'sick_leave'
  | 'personal'
  | 'maternity'
  | 'paternity'
  | 'other';
export type LeaveRequestStatus = 'pending' | 'approved' | 'denied';

export interface Models {
  Customer: ReturnType<typeof Sequelize.prototype.define>;
  Job: ReturnType<typeof Sequelize.prototype.define>;
  User: ReturnType<typeof Sequelize.prototype.define>;
  JobAssignee: ReturnType<typeof Sequelize.prototype.define>;
  LeaveRequest: ReturnType<typeof Sequelize.prototype.define>;
}

export async function getSequelize(): Promise<Sequelize> {
  if (globalForSequelize.sequelizeInstance) {
    return globalForSequelize.sequelizeInstance;
  }

  const { Sequelize } = await import('sequelize');
  const pg = await import('pg');

  const dbConfig = getDbConfig();
  const instance = new Sequelize({
    dialect: 'postgres',
    dialectModule: (pg as any).default || pg,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    },
  });

  globalForSequelize.sequelizeInstance = instance;
  return instance;
}

export async function getModels(): Promise<Models> {
  if (globalForSequelize.models) {
    return globalForSequelize.models;
  }

  const { DataTypes } = await import('sequelize');
  const sequelize = await getSequelize();

  const Customer = sequelize.define(
    'Customer',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      fullName: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      role: { type: DataTypes.ENUM('client', 'contractor', 'architect'), defaultValue: 'client' },
      address: { type: DataTypes.STRING(255), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'customers', timestamps: true },
  );

  const Job = sequelize.define(
    'Job',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      location: { type: DataTypes.STRING(255), allowNull: true },
      category: {
        type: DataTypes.ENUM(
          'single_family_houses',
          'villas',
          'apartments',
          'renovation_remodeling',
          'extensions',
          'interior_design',
          'office_buildings',
          'retail_stores',
          'restaurants_cafes',
          'hotels',
          'warehouses',
          'shopping_malls',
          'factories',
          'power_plants',
          'logistics_centers',
          'chemical_plants',
          'mining_facilities',
          'roads_highways',
          'bridges',
          'water_networks',
          'sewage_systems',
          'airports',
          'railways',
          'demolition',
          'excavation',
          'foundation_works',
          'scaffolding',
          'waterproofing',
          'electrical_installation',
          'hvac_systems',
          'solar_systems',
          'plumbing',
          'fire_safety',
          'elevator_installation',
        ),
        allowNull: true,
      },
      budget: { type: DataTypes.DECIMAL(14, 2), allowNull: true },
      expenses: { type: DataTypes.DECIMAL(14, 2), allowNull: true, defaultValue: 0 },
      deadline: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: Customer, key: 'id' },
      },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'jobs', timestamps: true },
  );

  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
      fullName: { type: DataTypes.STRING(120), allowNull: false },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      constructionFunction: { type: DataTypes.STRING(120), allowNull: true },
      permissionRole: {
        type: DataTypes.ENUM('super_user', 'modify_assigned', 'view_only'),
        defaultValue: 'view_only',
      },
      avatarColor: { type: DataTypes.STRING(30), allowNull: true, defaultValue: '#FFB800' },
      submitPhotos: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      addNotes: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      uploadInvoices: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      uploadBlueprints: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      passwordHash: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'users', timestamps: true },
  );

  const JobAssignee = sequelize.define(
    'JobAssignee',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      jobId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Job, key: 'id' } },
      userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
      roleOnJob: { type: DataTypes.STRING(60), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'job_assignees', timestamps: false },
  );

  const LeaveRequest = sequelize.define(
    'LeaveRequest',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
      jobId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Job, key: 'id' } },
      type: {
        type: DataTypes.ENUM('vacation', 'sick_leave', 'personal', 'maternity', 'paternity', 'other'),
        allowNull: false,
      },
      startDate: { type: DataTypes.DATE, allowNull: false },
      endDate: { type: DataTypes.DATE, allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'denied'),
        defaultValue: 'pending',
      },
      reviewedBy: { type: DataTypes.INTEGER, allowNull: true, references: { model: User, key: 'id' } },
      reviewNote: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'leave_requests', timestamps: true },
  );

  Customer.hasMany(Job, { foreignKey: 'customerId', as: 'jobs' });
  Job.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

  Job.belongsToMany(User, { through: JobAssignee, foreignKey: 'jobId', otherKey: 'userId', as: 'assignees' });
  User.belongsToMany(Job, { through: JobAssignee, foreignKey: 'userId', otherKey: 'jobId', as: 'assignedJobs' });

  User.hasMany(LeaveRequest, { foreignKey: 'userId', as: 'leaveRequests' });
  LeaveRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  LeaveRequest.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

  User.hasMany(LeaveRequest, { as: 'reviewedLeaves', foreignKey: 'reviewedBy' });
  LeaveRequest.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewedBy' });

  const models = { Customer, Job, User, JobAssignee, LeaveRequest };
  globalForSequelize.models = models;
  return models;
}
