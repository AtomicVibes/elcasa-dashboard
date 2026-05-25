-- 001-create-schema.sql
-- Fusionadevs Renovation DB — initial schema
-- Compatible with MariaDB 10.x / MySQL 8.x
-- Migration: 001
-- Run with: npx sequelize db:migrate  (via umzug runner)

CREATE TABLE IF NOT EXISTS customers (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  full_name   VARCHAR(120)   NOT NULL,
  email       VARCHAR(180)   NOT NULL UNIQUE,
  phone       VARCHAR(40)             DEFAULT NULL,
  role        ENUM('client','contractor','architect') NOT NULL DEFAULT 'client',
  address     VARCHAR(255)            DEFAULT NULL,
  notes       TEXT                    DEFAULT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_email (email),
  INDEX idx_customers_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  title        VARCHAR(180)   NOT NULL,
  description  TEXT                   DEFAULT NULL,
  location     VARCHAR(255)           DEFAULT NULL,
  category     VARCHAR(80)            DEFAULT NULL,
  budget       DECIMAL(14,2)          DEFAULT NULL,
  expenses     DECIMAL(14,2)          DEFAULT 0,
  deadline     DATE                   DEFAULT NULL,
  status       ENUM('pending','in_progress','completed','cancelled')
                             NOT NULL DEFAULT 'pending',
  customer_id  INT                   DEFAULT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_jobs_status    (status),
  INDEX idx_jobs_deadline  (deadline),
  INDEX idx_jobs_customer  (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id                 INT PRIMARY KEY AUTO_INCREMENT,
  email              VARCHAR(180)  NOT NULL UNIQUE,
  full_name          VARCHAR(120)  NOT NULL,
  phone              VARCHAR(40)            DEFAULT NULL,
  construction_function VARCHAR(120)        DEFAULT NULL,
  permission_role    ENUM('super_user','modify_assigned','view_only')
                              NOT NULL DEFAULT 'view_only',
  avatar_color       VARCHAR(30)            DEFAULT '#FFB800',
  submit_photos      TINYINT(1)  NOT NULL DEFAULT 0,
  add_notes          TINYINT(1)  NOT NULL DEFAULT 0,
  upload_invoices    TINYINT(1)  NOT NULL DEFAULT 0,
  upload_blueprints  TINYINT(1)  NOT NULL DEFAULT 0,
  password_hash      TEXT                   DEFAULT NULL,
  created_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_assignees (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  job_id      INT NOT NULL,
  user_id     INT NOT NULL,
  role_on_job VARCHAR(60)           DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)  REFERENCES jobs(id)    ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
  UNIQUE KEY uniq_job_user (job_id, user_id),
  INDEX idx_assignees_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leave_requests (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  job_id      INT                  DEFAULT NULL,
  type        ENUM('vacation','sick_leave','personal','maternity','paternity','other')
                            NOT NULL,
  start_date  DATE          NOT NULL,
  end_date    DATE          NOT NULL,
  reason      TEXT                  DEFAULT NULL,
  status      ENUM('pending','approved','denied')
                            NOT NULL DEFAULT 'pending',
  reviewed_by INT                  DEFAULT NULL,
  review_note TEXT                 DEFAULT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_leave_user  (user_id),
  INDEX idx_leave_status (status),
  INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
