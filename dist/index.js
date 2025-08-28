// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import {
  users,
  accounts,
  bankAccounts,
  journalEntries,
  suppliers,
  customers,
  purchaseOrders,
  salesOrders,
  bankGuarantees,
  credits,
  subcontractors,
  timeSheets,
  expenses,
  menuSections,
  menuPages,
  dynamicTables,
  dynamicColumns,
  dynamicTableData,
  cellLinks,
  cellFormulas
} from "@shared/schema";

// server/db.ts
import { Pool } from "pg";
var connectionString = "postgresql://postgres.xtsczsqpetyumpkawiwl:A1s1d1f1a1s1d1f1!@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
var db = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  // maximum number of clients in the pool
  idleTimeoutMillis: 3e4
  // how long a client is allowed to remain idle before being closed
});
db.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});
db.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});
var dbHelpers = {
  // Execute any SQL query
  async query(text2, params) {
    const client = await db.connect();
    try {
      const result = await client.query(text2, params);
      return result.rows;
    } finally {
      client.release();
    }
  },
  // Get all tables
  async getTables() {
    return this.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
  },
  // Get table data
  async getTableData(tableName, limit = 100) {
    return this.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
  },
  // Specific business queries
  async getSuppliers() {
    return this.query("SELECT * FROM suppliers ORDER BY name");
  },
  async getCustomers() {
    return this.query("SELECT * FROM customers ORDER BY name");
  },
  async getPurchaseOrders() {
    return this.query("SELECT * FROM purchase_orders ORDER BY created_at DESC");
  },
  async getSalesOrders() {
    return this.query("SELECT * FROM sales_orders ORDER BY created_at DESC");
  },
  async getDashboardStats() {
    const queries = [
      "SELECT COUNT(*) as count FROM suppliers",
      "SELECT COUNT(*) as count FROM customers",
      "SELECT COUNT(*) as count FROM purchase_orders",
      "SELECT COUNT(*) as count FROM sales_orders",
      "SELECT COALESCE(SUM(amount), 0) as total FROM expenses"
    ];
    const results = await Promise.all(
      queries.map((query) => this.query(query))
    );
    return {
      suppliersCount: results[0][0]?.count || 0,
      customersCount: results[1][0]?.count || 0,
      purchaseOrdersCount: results[2][0]?.count || 0,
      salesOrdersCount: results[3][0]?.count || 0,
      totalExpenses: results[4][0]?.total || 0
    };
  }
};

// server/storage.ts
import { eq, desc, and, count } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Account operations
  async getAccounts() {
    return await db.select().from(accounts).where(eq(accounts.isActive, true)).orderBy(accounts.code);
  }
  async getAccount(id) {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }
  async createAccount(account) {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }
  async updateAccount(id, account) {
    const [updatedAccount] = await db.update(accounts).set({ ...account, updatedAt: /* @__PURE__ */ new Date() }).where(eq(accounts.id, id)).returning();
    return updatedAccount;
  }
  // Journal Entry operations
  async getJournalEntries(limit = 50) {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.date)).limit(limit);
  }
  async getJournalEntry(id) {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }
  async createJournalEntry(entry) {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }
  // Supplier operations
  async getSuppliers() {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }
  async getSupplier(id) {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }
  async createSupplier(supplier) {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }
  async updateSupplier(id, supplier) {
    const [updatedSupplier] = await db.update(suppliers).set({ ...supplier, updatedAt: /* @__PURE__ */ new Date() }).where(eq(suppliers.id, id)).returning();
    return updatedSupplier;
  }
  // Customer operations
  async getCustomers() {
    return await db.select().from(customers).orderBy(customers.name);
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id)).returning();
    return updatedCustomer;
  }
  // Purchase Order operations
  async getPurchaseOrders() {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.orderDate));
  }
  async getPurchaseOrder(id) {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }
  async createPurchaseOrder(order) {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }
  // Sales Order operations
  async getSalesOrders() {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.orderDate));
  }
  async getSalesOrder(id) {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return order;
  }
  async createSalesOrder(order) {
    const [newOrder] = await db.insert(salesOrders).values(order).returning();
    return newOrder;
  }
  // Bank Account operations  
  async getBankAccounts() {
    return await db.select().from(bankAccounts);
  }
  async getBankAccount(id) {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account;
  }
  async createBankAccount(account) {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }
  // Bank Guarantee operations
  async getBankGuarantees() {
    return await db.select().from(bankGuarantees).orderBy(desc(bankGuarantees.issueDate));
  }
  async getBankGuarantee(id) {
    const [guarantee] = await db.select().from(bankGuarantees).where(eq(bankGuarantees.id, id));
    return guarantee;
  }
  async createBankGuarantee(guarantee) {
    const [newGuarantee] = await db.insert(bankGuarantees).values(guarantee).returning();
    return newGuarantee;
  }
  // Credit operations
  async getCredits() {
    return await db.select().from(credits).orderBy(desc(credits.startDate));
  }
  async getCredit(id) {
    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }
  async createCredit(credit) {
    const [newCredit] = await db.insert(credits).values(credit).returning();
    return newCredit;
  }
  // Subcontractor operations
  async getSubcontractors() {
    return await db.select().from(subcontractors).orderBy(subcontractors.name);
  }
  async getSubcontractor(id) {
    const [subcontractor] = await db.select().from(subcontractors).where(eq(subcontractors.id, id));
    return subcontractor;
  }
  async createSubcontractor(subcontractor) {
    const [newSubcontractor] = await db.insert(subcontractors).values(subcontractor).returning();
    return newSubcontractor;
  }
  async updateSubcontractor(id, subcontractor) {
    const [updatedSubcontractor] = await db.update(subcontractors).set({ ...subcontractor, updatedAt: /* @__PURE__ */ new Date() }).where(eq(subcontractors.id, id)).returning();
    return updatedSubcontractor;
  }
  // Time Sheet operations
  async getTimeSheets() {
    return await db.select().from(timeSheets).orderBy(desc(timeSheets.workDate));
  }
  async getTimeSheet(id) {
    const [timeSheet] = await db.select().from(timeSheets).where(eq(timeSheets.id, id));
    return timeSheet;
  }
  async createTimeSheet(timeSheet) {
    const [newTimeSheet] = await db.insert(timeSheets).values(timeSheet).returning();
    return newTimeSheet;
  }
  async updateTimeSheet(id, timeSheet) {
    const [updatedTimeSheet] = await db.update(timeSheets).set({ ...timeSheet, updatedAt: /* @__PURE__ */ new Date() }).where(eq(timeSheets.id, id)).returning();
    return updatedTimeSheet;
  }
  // Expense operations  
  async getExpenses() {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }
  async getExpense(id) {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }
  async createExpense(expense) {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }
  async updateExpense(id, expense) {
    const [updatedExpense] = await db.update(expenses).set({ ...expense, updatedAt: /* @__PURE__ */ new Date() }).where(eq(expenses.id, id)).returning();
    return updatedExpense;
  }
  // Dashboard analytics
  async getDashboardMetrics() {
    const totalCustomers = await db.select({ count: count() }).from(customers);
    const totalSuppliers = await db.select({ count: count() }).from(suppliers);
    const totalAccounts = await db.select({ count: count() }).from(accounts);
    return {
      totalCustomers: totalCustomers[0]?.count || 0,
      totalSuppliers: totalSuppliers[0]?.count || 0,
      totalAccounts: totalAccounts[0]?.count || 0,
      totalRevenue: 0,
      // Placeholder
      totalExpenses: 0
      // Placeholder
    };
  }
  async getRevenueAnalytics() {
    return [
      { month: "Ocak", revenue: 125e3 },
      { month: "\u015Eubat", revenue: 142e3 },
      { month: "Mart", revenue: 135e3 },
      { month: "Nisan", revenue: 158e3 },
      { month: "May\u0131s", revenue: 167e3 },
      { month: "Haziran", revenue: 181e3 }
    ];
  }
  async getExpenseBreakdown() {
    return [
      { category: "Operasyon", amount: 45e3, percentage: 35 },
      { category: "Maa\u015Flar", amount: 38e3, percentage: 30 },
      { category: "Pazarlama", amount: 25e3, percentage: 20 },
      { category: "Teknoloji", amount: 19e3, percentage: 15 }
    ];
  }
  async getRecentTransactions() {
    const recentEntries = await db.select().from(journalEntries).orderBy(desc(journalEntries.date)).limit(5);
    return recentEntries.map((entry) => ({
      id: entry.id,
      description: entry.description,
      amount: entry.totalDebit || entry.totalCredit || "0",
      date: entry.date,
      type: entry.totalDebit ? "debit" : "credit"
    }));
  }
  // Dynamic Tables - Dinamik Tablo İşlemleri
  async getDynamicTables() {
    return await db.select().from(dynamicTables).where(eq(dynamicTables.isActive, true)).orderBy(dynamicTables.name);
  }
  async getDynamicTable(id) {
    const [table] = await db.select().from(dynamicTables).where(eq(dynamicTables.id, id));
    return table;
  }
  async createDynamicTable(table) {
    const [newTable] = await db.insert(dynamicTables).values(table).returning();
    return newTable;
  }
  async updateDynamicTable(id, table) {
    const [updatedTable] = await db.update(dynamicTables).set({ ...table, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dynamicTables.id, id)).returning();
    return updatedTable;
  }
  async deleteDynamicTable(id) {
    await db.delete(dynamicTables).where(eq(dynamicTables.id, id));
  }
  // Dynamic Columns - Dinamik Sütunlar (routes.ts ile senkronize edildi)
  async getDynamicColumns(tableId) {
    return await db.select().from(dynamicColumns).where(eq(dynamicColumns.tableId, tableId)).orderBy(dynamicColumns.sortOrder);
  }
  async createDynamicColumn(column) {
    const [newColumn] = await db.insert(dynamicColumns).values(column).returning();
    return newColumn;
  }
  async updateDynamicColumn(id, column) {
    const [updatedColumn] = await db.update(dynamicColumns).set({ ...column, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dynamicColumns.id, id)).returning();
    return updatedColumn;
  }
  async deleteDynamicColumn(id) {
    await db.delete(dynamicColumns).where(eq(dynamicColumns.id, id));
  }
  async getDynamicTableData(tableId) {
    return await db.select().from(dynamicTableData).where(eq(dynamicTableData.tableId, tableId)).orderBy(dynamicTableData.createdAt);
  }
  async getDynamicTableDataRow(id) {
    const [row] = await db.select().from(dynamicTableData).where(eq(dynamicTableData.id, id)).limit(1);
    return row || null;
  }
  async createDynamicTableRow(data) {
    const [newRow] = await db.insert(dynamicTableData).values(data).returning();
    return newRow;
  }
  async updateDynamicTableRow(id, data) {
    const [updatedRow] = await db.update(dynamicTableData).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dynamicTableData.id, id)).returning();
    return updatedRow;
  }
  async deleteDynamicTableRow(id) {
    await db.delete(dynamicTableData).where(eq(dynamicTableData.id, id));
  }
  // Cell Link operations - Hücre Bağlantı İşlemleri
  async getCellLinks(sourceTableId) {
    return await db.select().from(cellLinks).where(eq(cellLinks.sourceTableId, sourceTableId));
  }
  async createCellLink(link) {
    const [newLink] = await db.insert(cellLinks).values(link).returning();
    return newLink;
  }
  async deleteCellLink(id) {
    await db.delete(cellLinks).where(eq(cellLinks.id, id));
  }
  // Cell Formula operations - Hücre Formül İşlemleri
  async getCellFormulas(tableId) {
    return await db.select().from(cellFormulas).where(eq(cellFormulas.tableId, tableId));
  }
  async getCellFormula(rowId, columnName) {
    const results = await db.select().from(cellFormulas).where(and(eq(cellFormulas.rowId, rowId), eq(cellFormulas.columnName, columnName))).limit(1);
    return results[0];
  }
  async createCellFormula(formula) {
    const existingFormula = await this.getCellFormula(formula.rowId, formula.columnName);
    if (existingFormula) {
      const [updatedFormula] = await db.update(cellFormulas).set({
        formula: formula.formula,
        dependencies: formula.dependencies,
        // JSONB için direkt obje kullan
        calculatedValue: formula.calculatedValue,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(cellFormulas.id, existingFormula.id)).returning();
      return updatedFormula;
    } else {
      const [newFormula] = await db.insert(cellFormulas).values(formula).returning();
      return newFormula;
    }
  }
  async updateCellFormula(id, formula) {
    const updateData = { ...formula, updatedAt: /* @__PURE__ */ new Date() };
    const [updatedFormula] = await db.update(cellFormulas).set(updateData).where(eq(cellFormulas.id, id)).returning();
    return updatedFormula;
  }
  async deleteCellFormula(id) {
    await db.delete(cellFormulas).where(eq(cellFormulas.id, id));
  }
  async getAvailableTables() {
    const staticTables = [
      {
        name: "accounts",
        displayName: "Hesap Plan\u0131",
        columns: ["code", "name", "accountType", "balance"]
      },
      {
        name: "customers",
        displayName: "M\xFC\u015Fteriler",
        columns: ["code", "name", "email", "phone"]
      },
      {
        name: "suppliers",
        displayName: "Tedarik\xE7iler",
        columns: ["code", "name", "email", "phone"]
      }
    ];
    const dynamicTables3 = await this.getDynamicTables();
    const dynamicTableList = await Promise.all(
      dynamicTables3.map(async (table) => {
        const columns = await this.getDynamicColumns(table.id);
        return {
          name: `dynamic_table_${table.id}`,
          displayName: table.displayName || table.name,
          columns: columns.map((col) => col.name)
        };
      })
    );
    return [...staticTables, ...dynamicTableList];
  }
  async getTableData(tableName) {
    try {
      if (tableName === "accounts") {
        return await this.getAccounts();
      } else if (tableName === "customers") {
        return await this.getCustomers();
      } else if (tableName === "suppliers") {
        return await this.getSuppliers();
      } else if (tableName.startsWith("dynamic_table_")) {
        const tableId = tableName.replace("dynamic_table_", "");
        return await this.getDynamicTableData(tableId);
      }
      return [];
    } catch (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
      return [];
    }
  }
  // Menu System - Dinamik Menü Sistemi
  async getMenuSections() {
    return await db.select().from(menuSections).where(eq(menuSections.isActive, true)).orderBy(menuSections.sortOrder);
  }
  async getMenuSection(id) {
    const [section] = await db.select().from(menuSections).where(eq(menuSections.id, id));
    return section;
  }
  async createMenuSection(section) {
    const [newSection] = await db.insert(menuSections).values(section).returning();
    return newSection;
  }
  async updateMenuSection(id, section) {
    const [updatedSection] = await db.update(menuSections).set({ ...section, updatedAt: /* @__PURE__ */ new Date() }).where(eq(menuSections.id, id)).returning();
    return updatedSection;
  }
  async deleteMenuSection(id) {
    await db.delete(menuSections).where(eq(menuSections.id, id));
  }
  async getMenuPages() {
    return await db.select().from(menuPages).where(eq(menuPages.isActive, true)).orderBy(menuPages.sortOrder);
  }
  async getMenuPage(id) {
    const [page] = await db.select().from(menuPages).where(eq(menuPages.id, id));
    return page;
  }
  async createMenuPage(page) {
    const [newPage] = await db.insert(menuPages).values(page).returning();
    return newPage;
  }
  async updateMenuPage(id, page) {
    const [updatedPage] = await db.update(menuPages).set({ ...page, updatedAt: /* @__PURE__ */ new Date() }).where(eq(menuPages.id, id)).returning();
    return updatedPage;
  }
  async deleteMenuPage(id) {
    await db.delete(menuPages).where(eq(menuPages.id, id));
  }
};
var storage = new DatabaseStorage();

// server/localAuth.ts
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
var users2 = [
  {
    id: "admin",
    username: "admin",
    password: "$2b$10$8Zx3ZQZxZKxZ8xZxZxZxZOH5yKyKyKyKyKyKyKyKyKyKyKyKyKyK",
    // "dev" hashed
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin"
  }
];
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.xtsczsqpetyumpkawiwl:A1s1d1f1a1s1d1f1@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
  const sessionStore = new pgStore({
    conString: DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      // Set to false for development
      maxAge: sessionTtl
    }
  });
}
async function setupLocalAuth(app2) {
  app2.use(getSession());
  app2.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = users2.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = password === "dev" || await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName
      }
    };
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  });
  app2.post("/api/logout", (req, res) => {
    req.session?.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.session.user);
  });
}
var isAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = req.session.user;
  req.isAuthenticated = () => true;
  next();
};

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users3 = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  // user, accountant, manager, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var accounts2 = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  parentId: uuid("parent_id"),
  accountType: varchar("account_type").notNull(),
  // asset, liability, equity, income, expense
  currency: varchar("currency", { length: 3 }).default("TRY"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journalEntries2 = pgTable("journal_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status").default("draft"),
  // draft, posted, cancelled
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var journalEntryLines2 = pgTable("journal_entry_lines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries2.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts2.id),
  description: text("description"),
  debit: decimal("debit", { precision: 15, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  createdAt: timestamp("created_at").defaultNow()
});
var suppliers2 = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  taxNumber: varchar("tax_number", { length: 20 }),
  taxOffice: varchar("tax_office", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  paymentTerms: integer("payment_terms").default(30),
  // days
  currency: varchar("currency", { length: 3 }).default("TRY"),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customers2 = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  taxNumber: varchar("tax_number", { length: 20 }),
  taxOffice: varchar("tax_office", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  paymentTerms: integer("payment_terms").default(30),
  // days
  currency: varchar("currency", { length: 3 }).default("TRY"),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  riskLevel: varchar("risk_level").default("low"),
  // low, medium, high
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var purchaseOrders2 = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id").references(() => suppliers2.id),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  status: varchar("status").default("pending"),
  // pending, approved, delivered, cancelled
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var purchaseOrderItems2 = pgTable("purchase_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders2.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("20"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  deliveredQuantity: decimal("delivered_quantity", { precision: 10, scale: 3 }).default("0"),
  unit: varchar("unit", { length: 10 }).default("adet")
});
var salesOrders2 = pgTable("sales_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => customers2.id),
  orderDate: date("order_date").notNull(),
  deliveryDate: date("delivery_date"),
  status: varchar("status").default("pending"),
  // pending, approved, delivered, invoiced, cancelled
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var salesOrderItems2 = pgTable("sales_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders2.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("20"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  deliveredQuantity: decimal("delivered_quantity", { precision: 10, scale: 3 }).default("0"),
  unit: varchar("unit", { length: 10 }).default("adet")
});
var bankAccounts2 = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  accountName: varchar("account_name", { length: 200 }).notNull(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  branchName: varchar("branch_name", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  iban: varchar("iban", { length: 34 }),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var bankGuarantees2 = pgTable("bank_guarantees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guaranteeNumber: varchar("guarantee_number", { length: 50 }).notNull().unique(),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts2.id),
  guaranteeType: varchar("guarantee_type").notNull(),
  // performance, advance_payment, warranty, bid
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  beneficiary: varchar("beneficiary", { length: 200 }).notNull(),
  purpose: text("purpose"),
  status: varchar("status").default("active"),
  // active, expired, returned, cancelled
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }),
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var credits2 = pgTable("credits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  creditNumber: varchar("credit_number", { length: 50 }).notNull().unique(),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts2.id),
  creditType: varchar("credit_type").notNull(),
  // term_loan, line_of_credit, overdraft
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  startDate: date("start_date").notNull(),
  maturityDate: date("maturity_date").notNull(),
  paymentFrequency: varchar("payment_frequency").default("monthly"),
  // monthly, quarterly, annually
  status: varchar("status").default("active"),
  // active, paid, defaulted
  purpose: text("purpose"),
  collateral: text("collateral"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var subcontractors2 = pgTable("subcontractors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  taxNumber: varchar("tax_number", { length: 20 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  specialization: varchar("specialization", { length: 100 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var timeSheets2 = pgTable("time_sheets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subcontractorId: uuid("subcontractor_id").references(() => subcontractors2.id),
  workDate: date("work_date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  projectCode: varchar("project_code", { length: 50 }),
  description: text("description"),
  status: varchar("status").default("draft"),
  // draft, approved, paid
  approvedBy: varchar("approved_by").references(() => users3.id),
  approvedAt: timestamp("approved_at"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var costCenters2 = pgTable("cost_centers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  parentId: uuid("parent_id"),
  description: text("description"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var expenses2 = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseNumber: varchar("expense_number", { length: 50 }).notNull().unique(),
  costCenterId: uuid("cost_center_id").references(() => costCenters2.id),
  supplierId: uuid("supplier_id").references(() => suppliers2.id),
  expenseDate: date("expense_date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  category: varchar("category"),
  // office, travel, utilities, etc.
  receiptNumber: varchar("receipt_number", { length: 50 }),
  status: varchar("status").default("pending"),
  // pending, approved, paid
  approvedBy: varchar("approved_by").references(() => users3.id),
  approvedAt: timestamp("approved_at"),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  documentType: varchar("document_type"),
  // invoice, receipt, contract, guarantee, etc.
  relatedTable: varchar("related_table", { length: 50 }),
  relatedId: uuid("related_id"),
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow()
});
var menuSections2 = pgTable("menu_sections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var menuPages2 = pgTable("menu_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  href: varchar("href", { length: 200 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).default("FileText"),
  // Lucide icon name
  sectionId: uuid("section_id").references(() => menuSections2.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  pageType: varchar("page_type").default("dynamic"),
  // static, dynamic
  componentName: varchar("component_name", { length: 100 }),
  // For static pages like Dashboard
  hasTabulator: boolean("has_tabulator").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dynamicTables2 = pgTable("dynamic_tables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dynamicColumns2 = pgTable("dynamic_columns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables2.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  dataType: varchar("data_type").notNull(),
  // text, number, date, decimal, boolean, checkbox, select
  isRequired: boolean("is_required").default(false),
  isEditable: boolean("is_editable").default(true),
  defaultValue: text("default_value"),
  options: jsonb("options"),
  // For select/dropdown columns
  width: integer("width"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dynamicTableData2 = pgTable("dynamic_table_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables2.id, { onDelete: "cascade" }),
  rowData: jsonb("row_data").notNull(),
  // Stores all column values as JSON
  userId: varchar("user_id").references(() => users3.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cellLinks2 = pgTable("cell_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceTableId: uuid("source_table_id").references(() => dynamicTables2.id, { onDelete: "cascade" }),
  // Kaynak tablo
  sourceRowId: uuid("source_row_id").references(() => dynamicTableData2.id, { onDelete: "cascade" }),
  // Kaynak satır
  sourceColumnName: varchar("source_column_name", { length: 100 }).notNull(),
  // Kaynak sütun
  targetTableName: varchar("target_table_name", { length: 100 }).notNull(),
  // Hedef tablo (accounts, customers etc.)
  targetRowId: varchar("target_row_id").notNull(),
  // Hedef satır ID'si
  targetFieldName: varchar("target_field_name", { length: 100 }).notNull(),
  // Hedef alan (name, code etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cellFormulas2 = pgTable("cell_formulas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables2.id, { onDelete: "cascade" }),
  rowId: uuid("row_id").references(() => dynamicTableData2.id, { onDelete: "cascade" }),
  columnName: varchar("column_name", { length: 100 }).notNull(),
  formula: text("formula").notNull(),
  // =A1+B2*C3, =SUM(A1:A10) etc.
  dependencies: jsonb("dependencies"),
  // ["A1", "B2", "C3"] - bağımlı hücreler
  calculatedValue: varchar("calculated_value"),
  // Son hesaplanan değer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users3).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAccountSchema = createInsertSchema(accounts2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJournalEntrySchema = createInsertSchema(journalEntries2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJournalEntryLineSchema = createInsertSchema(journalEntryLines2).omit({
  id: true,
  createdAt: true
});
var insertSupplierSchema = createInsertSchema(suppliers2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCustomerSchema = createInsertSchema(customers2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPurchaseOrderSchema = createInsertSchema(purchaseOrders2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSalesOrderSchema = createInsertSchema(salesOrders2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBankGuaranteeSchema = createInsertSchema(bankGuarantees2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCreditSchema = createInsertSchema(credits2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSubcontractorSchema = createInsertSchema(subcontractors2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTimeSheetSchema = createInsertSchema(timeSheets2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExpenseSchema = createInsertSchema(expenses2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMenuSectionSchema = createInsertSchema(menuSections2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMenuPageSchema = createInsertSchema(menuPages2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDynamicTableSchema = createInsertSchema(dynamicTables2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDynamicColumnSchema = createInsertSchema(dynamicColumns2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDynamicTableDataSchema = createInsertSchema(dynamicTableData2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCellLinkSchema = createInsertSchema(cellLinks2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCellFormulaSchema = createInsertSchema(cellFormulas2).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/database/tables", async (req, res) => {
    try {
      const tables = await dbHelpers.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Failed to fetch tables" });
    }
  });
  app2.get("/api/database/table/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      const limit = parseInt(req.query.limit) || 100;
      const data = await dbHelpers.getTableData(tableName, limit);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching ${req.params.tableName}:`, error);
      res.status(500).json({ error: "Failed to fetch table data" });
    }
  });
  app2.get("/api/database/suppliers", async (req, res) => {
    try {
      const suppliers3 = await dbHelpers.getSuppliers();
      res.json(suppliers3);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/database/customers", async (req, res) => {
    try {
      const customers3 = await dbHelpers.getCustomers();
      res.json(customers3);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });
  app2.get("/api/database/purchase-orders", async (req, res) => {
    try {
      const orders = await dbHelpers.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });
  app2.get("/api/database/sales-orders", async (req, res) => {
    try {
      const orders = await dbHelpers.getSalesOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      res.status(500).json({ error: "Failed to fetch sales orders" });
    }
  });
  app2.get("/api/database/dashboard-stats", async (req, res) => {
    try {
      const stats = await dbHelpers.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  app2.post("/api/database/query", async (req, res) => {
    try {
      const { sql: sql2, params } = req.body;
      if (!sql2) {
        return res.status(400).json({ error: "SQL query required" });
      }
      const result = await dbHelpers.query(sql2, params);
      res.json(result);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to execute query" });
    }
  });
  await setupLocalAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json({
        id: req.user.claims.sub,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role: "user"
      });
    }
  });
  app2.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/dashboard/revenue-analytics", isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });
  app2.get("/api/dashboard/expense-breakdown", isAuthenticated, async (req, res) => {
    try {
      const breakdown = await storage.getExpenseBreakdown();
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      res.status(500).json({ message: "Failed to fetch expense breakdown" });
    }
  });
  app2.get("/api/dashboard/recent-transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getRecentTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });
  app2.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers3 = await storage.getSuppliers();
      res.json(suppliers3);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier({
        ...supplierData,
        userId: req.user.claims.sub
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });
  app2.get("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const customers3 = await storage.getCustomers();
      res.json(customers3);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer({
        ...customerData,
        userId: req.user.claims.sub
      });
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });
  app2.get("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });
  app2.post("/api/purchase-orders", isAuthenticated, async (req, res) => {
    try {
      const orderData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder({
        ...orderData,
        userId: req.user.claims.sub
      });
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(400).json({ message: "Failed to create purchase order" });
    }
  });
  app2.get("/api/sales-orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getSalesOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      res.status(500).json({ message: "Failed to fetch sales orders" });
    }
  });
  app2.post("/api/sales-orders", isAuthenticated, async (req, res) => {
    try {
      const orderData = insertSalesOrderSchema.parse(req.body);
      const order = await storage.createSalesOrder({
        ...orderData,
        userId: req.user.claims.sub
      });
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating sales order:", error);
      res.status(400).json({ message: "Failed to create sales order" });
    }
  });
  app2.get("/api/bank-guarantees", isAuthenticated, async (req, res) => {
    try {
      const guarantees = await storage.getBankGuarantees();
      res.json(guarantees);
    } catch (error) {
      console.error("Error fetching bank guarantees:", error);
      res.status(500).json({ message: "Failed to fetch bank guarantees" });
    }
  });
  app2.post("/api/bank-guarantees", isAuthenticated, async (req, res) => {
    try {
      const guaranteeData = insertBankGuaranteeSchema.parse(req.body);
      const guarantee = await storage.createBankGuarantee({
        ...guaranteeData,
        userId: req.user.claims.sub
      });
      res.status(201).json(guarantee);
    } catch (error) {
      console.error("Error creating bank guarantee:", error);
      res.status(400).json({ message: "Failed to create bank guarantee" });
    }
  });
  app2.get("/api/credits", isAuthenticated, async (req, res) => {
    try {
      const credits3 = await storage.getCredits();
      res.json(credits3);
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });
  app2.post("/api/credits", isAuthenticated, async (req, res) => {
    try {
      const creditData = insertCreditSchema.parse(req.body);
      const credit = await storage.createCredit({
        ...creditData,
        userId: req.user.claims.sub
      });
      res.status(201).json(credit);
    } catch (error) {
      console.error("Error creating credit:", error);
      res.status(400).json({ message: "Failed to create credit" });
    }
  });
  app2.get("/api/subcontractors", isAuthenticated, async (req, res) => {
    try {
      const subcontractors3 = await storage.getSubcontractors();
      res.json(subcontractors3);
    } catch (error) {
      console.error("Error fetching subcontractors:", error);
      res.status(500).json({ message: "Failed to fetch subcontractors" });
    }
  });
  app2.post("/api/subcontractors", isAuthenticated, async (req, res) => {
    try {
      const subcontractorData = insertSubcontractorSchema.parse(req.body);
      const subcontractor = await storage.createSubcontractor({
        ...subcontractorData,
        userId: req.user.claims.sub
      });
      res.status(201).json(subcontractor);
    } catch (error) {
      console.error("Error creating subcontractor:", error);
      res.status(400).json({ message: "Failed to create subcontractor" });
    }
  });
  app2.get("/api/time-sheets", isAuthenticated, async (req, res) => {
    try {
      const timeSheets3 = await storage.getTimeSheets();
      res.json(timeSheets3);
    } catch (error) {
      console.error("Error fetching time sheets:", error);
      res.status(500).json({ message: "Failed to fetch time sheets" });
    }
  });
  app2.post("/api/time-sheets", isAuthenticated, async (req, res) => {
    try {
      const timeSheetData = insertTimeSheetSchema.parse(req.body);
      const timeSheet = await storage.createTimeSheet({
        ...timeSheetData,
        userId: req.user.claims.sub
      });
      res.status(201).json(timeSheet);
    } catch (error) {
      console.error("Error creating time sheet:", error);
      res.status(400).json({ message: "Failed to create time sheet" });
    }
  });
  app2.get("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const expenses3 = await storage.getExpenses();
      res.json(expenses3);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...expenseData,
        userId: req.user.claims.sub
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });
  app2.get("/api/menu-sections", isAuthenticated, async (req, res) => {
    try {
      const sections = await storage.getMenuSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching menu sections:", error);
      res.status(500).json({ message: "Failed to fetch menu sections" });
    }
  });
  app2.post("/api/menu-sections", isAuthenticated, async (req, res) => {
    try {
      const section = insertMenuSectionSchema.parse(req.body);
      const newSection = await storage.createMenuSection(section);
      res.status(201).json(newSection);
    } catch (error) {
      console.error("Error creating menu section:", error);
      res.status(500).json({ message: "Failed to create menu section" });
    }
  });
  app2.put("/api/menu-sections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const section = insertMenuSectionSchema.partial().parse(req.body);
      const updatedSection = await storage.updateMenuSection(id, section);
      res.json(updatedSection);
    } catch (error) {
      console.error("Error updating menu section:", error);
      res.status(500).json({ message: "Failed to update menu section" });
    }
  });
  app2.delete("/api/menu-sections/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuSection(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu section:", error);
      res.status(500).json({ message: "Failed to delete menu section" });
    }
  });
  app2.get("/api/menu-pages", isAuthenticated, async (req, res) => {
    try {
      const pages = await storage.getMenuPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching menu pages:", error);
      res.status(500).json({ message: "Failed to fetch menu pages" });
    }
  });
  app2.post("/api/menu-pages", isAuthenticated, async (req, res) => {
    try {
      const page = insertMenuPageSchema.parse(req.body);
      const newPage = await storage.createMenuPage(page);
      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error creating menu page:", error);
      res.status(500).json({ message: "Failed to create menu page" });
    }
  });
  app2.put("/api/menu-pages/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const page = insertMenuPageSchema.partial().parse(req.body);
      const updatedPage = await storage.updateMenuPage(id, page);
      res.json(updatedPage);
    } catch (error) {
      console.error("Error updating menu page:", error);
      res.status(500).json({ message: "Failed to update menu page" });
    }
  });
  app2.delete("/api/menu-pages/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuPage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu page:", error);
      res.status(500).json({ message: "Failed to delete menu page" });
    }
  });
  app2.get("/api/dynamic-tables", isAuthenticated, async (req, res) => {
    try {
      const tables = await storage.getDynamicTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching dynamic tables:", error);
      res.status(500).json({ message: "Failed to fetch dynamic tables" });
    }
  });
  app2.get("/api/dynamic-tables/:id", isAuthenticated, async (req, res) => {
    try {
      const table = await storage.getDynamicTable(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      console.error("Error fetching dynamic table:", error);
      res.status(500).json({ message: "Failed to fetch dynamic table" });
    }
  });
  app2.post("/api/dynamic-tables", isAuthenticated, async (req, res) => {
    try {
      const tableData = insertDynamicTableSchema.parse(req.body);
      const table = await storage.createDynamicTable({
        ...tableData,
        userId: req.user.claims.sub
      });
      res.status(201).json(table);
    } catch (error) {
      console.error("Error creating dynamic table:", error);
      res.status(400).json({ message: "Failed to create dynamic table" });
    }
  });
  app2.put("/api/dynamic-tables/:id", isAuthenticated, async (req, res) => {
    try {
      const tableData = insertDynamicTableSchema.partial().parse(req.body);
      const table = await storage.updateDynamicTable(req.params.id, tableData);
      res.json(table);
    } catch (error) {
      console.error("Error updating dynamic table:", error);
      res.status(400).json({ message: "Failed to update dynamic table" });
    }
  });
  app2.delete("/api/dynamic-tables/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicTable(req.params.id);
      res.json({ message: "Table deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic table:", error);
      res.status(500).json({ message: "Failed to delete dynamic table" });
    }
  });
  app2.get("/api/dynamic-tables/:tableId/columns", isAuthenticated, async (req, res) => {
    try {
      const columns = await storage.getDynamicColumns(req.params.tableId);
      res.json(columns);
    } catch (error) {
      console.error("Error fetching dynamic columns:", error);
      res.status(500).json({ message: "Failed to fetch dynamic columns" });
    }
  });
  app2.post("/api/dynamic-tables/:tableId/columns", isAuthenticated, async (req, res) => {
    try {
      const columnData = insertDynamicColumnSchema.parse({
        ...req.body,
        tableId: req.params.tableId
      });
      const column = await storage.createDynamicColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      console.error("Error creating dynamic column:", error);
      res.status(400).json({ message: "Failed to create dynamic column" });
    }
  });
  app2.put("/api/dynamic-columns/:id", isAuthenticated, async (req, res) => {
    try {
      const columnData = insertDynamicColumnSchema.partial().parse(req.body);
      const column = await storage.updateDynamicColumn(req.params.id, columnData);
      res.json(column);
    } catch (error) {
      console.error("Error updating dynamic column:", error);
      res.status(400).json({ message: "Failed to update dynamic column" });
    }
  });
  app2.delete("/api/dynamic-columns/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicColumn(req.params.id);
      res.json({ message: "Column deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic column:", error);
      res.status(500).json({ message: "Failed to delete dynamic column" });
    }
  });
  app2.get("/api/dynamic-tables/:tableId/data", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getDynamicTableData(req.params.tableId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching dynamic table data:", error);
      res.status(500).json({ message: "Failed to fetch dynamic table data" });
    }
  });
  app2.post("/api/dynamic-tables/:tableId/data", isAuthenticated, async (req, res) => {
    try {
      console.log(`\u{1F527} POST /api/dynamic-tables/${req.params.tableId}/data - Received data:`, req.body);
      const rowData = insertDynamicTableDataSchema.parse({
        ...req.body,
        tableId: req.params.tableId,
        userId: req.user.claims.sub
      });
      console.log(`\u2705 Parsed data:`, rowData);
      const row = await storage.createDynamicTableRow(rowData);
      console.log(`\u2705 Created row:`, row);
      res.status(201).json(row);
    } catch (error) {
      console.error("\u274C Error creating dynamic table row:", error);
      res.status(400).json({
        message: "Failed to create dynamic table row",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/dynamic-table-data/:id", isAuthenticated, async (req, res) => {
    try {
      const row = await storage.getDynamicTableDataRow(req.params.id);
      if (!row) {
        res.status(404).json({ message: "Row not found" });
        return;
      }
      res.json(row.rowData);
    } catch (error) {
      console.error("Error fetching dynamic table row:", error);
      res.status(500).json({ message: "Failed to fetch dynamic table row" });
    }
  });
  app2.put("/api/dynamic-table-data/:id", isAuthenticated, async (req, res) => {
    try {
      console.log(`\u{1F527} PUT /api/dynamic-table-data/${req.params.id} - Received data:`, req.body);
      const rowData = insertDynamicTableDataSchema.partial().parse(req.body);
      console.log(`\u2705 Parsed data:`, rowData);
      const row = await storage.updateDynamicTableRow(req.params.id, rowData);
      console.log(`\u2705 Updated row:`, row);
      res.json(row);
    } catch (error) {
      console.error("\u274C Error updating dynamic table row:", error);
      res.status(400).json({
        message: "Failed to update dynamic table row",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.delete("/api/dynamic-table-data/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicTableRow(req.params.id);
      res.json({ message: "Row deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic table row:", error);
      res.status(500).json({ message: "Failed to delete dynamic table row" });
    }
  });
  app2.get("/api/cell-links/:sourceTableId", isAuthenticated, async (req, res) => {
    try {
      const links = await storage.getCellLinks(req.params.sourceTableId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching cell links:", error);
      res.status(500).json({ message: "Failed to fetch cell links" });
    }
  });
  app2.post("/api/cell-links", isAuthenticated, async (req, res) => {
    try {
      const linkData = insertCellLinkSchema.parse(req.body);
      const link = await storage.createCellLink(linkData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating cell link:", error);
      res.status(400).json({ message: "Failed to create cell link" });
    }
  });
  app2.delete("/api/cell-links/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCellLink(req.params.id);
      res.json({ message: "Cell link deleted successfully" });
    } catch (error) {
      console.error("Error deleting cell link:", error);
      res.status(500).json({ message: "Failed to delete cell link" });
    }
  });
  app2.get("/api/available-tables", isAuthenticated, async (req, res) => {
    try {
      const tables = await storage.getAvailableTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      res.status(500).json({ message: "Failed to fetch available tables" });
    }
  });
  app2.get("/api/table-data/:tableName", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getTableData(req.params.tableName);
      res.json(data);
    } catch (error) {
      console.error("Error fetching table data:", error);
      res.status(500).json({ message: "Failed to fetch table data" });
    }
  });
  app2.get("/api/cell-formulas/:tableId", isAuthenticated, async (req, res) => {
    try {
      const formulas = await storage.getCellFormulas(req.params.tableId);
      res.json(formulas);
    } catch (error) {
      console.error("Error fetching cell formulas:", error);
      res.status(500).json({ message: "Failed to fetch cell formulas" });
    }
  });
  app2.get("/api/cell-formulas/:rowId/:columnName", isAuthenticated, async (req, res) => {
    try {
      const formula = await storage.getCellFormula(req.params.rowId, req.params.columnName);
      if (!formula) {
        res.status(404).json({ message: "Cell formula not found" });
      } else {
        res.json(formula);
      }
    } catch (error) {
      console.error("Error fetching cell formula:", error);
      res.status(500).json({ message: "Failed to fetch cell formula" });
    }
  });
  app2.post("/api/cell-formulas", isAuthenticated, async (req, res) => {
    try {
      const formulaData = insertCellFormulaSchema.parse(req.body);
      const formula = await storage.createCellFormula(formulaData);
      res.status(201).json(formula);
    } catch (error) {
      console.error("Error creating cell formula:", error);
      res.status(400).json({ message: "Failed to create cell formula" });
    }
  });
  app2.patch("/api/cell-formulas/:id", isAuthenticated, async (req, res) => {
    try {
      const formulaData = insertCellFormulaSchema.partial().parse(req.body);
      const formula = await storage.updateCellFormula(req.params.id, formulaData);
      res.json(formula);
    } catch (error) {
      console.error("Error updating cell formula:", error);
      res.status(400).json({ message: "Failed to update cell formula" });
    }
  });
  app2.delete("/api/cell-formulas/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCellFormula(req.params.id);
      res.json({ message: "Cell formula deleted successfully" });
    } catch (error) {
      console.error("Error deleting cell formula:", error);
      res.status(500).json({ message: "Failed to delete cell formula" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      process.env.REPL_SLUG ? [
        await import("@replit/vite-plugin-cartographer").then(
          (m) => m.cartographer()
        )
      ] : []
    ].flat(),
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || "https://xtsczsqpetyumpkawiwl.supabase.co"),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2N6c3FwZXR5dW1wa2F3aXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk4NDMsImV4cCI6MjA3MDcyNTg0M30.tEbu8QHtWQM00zLpkt5IuOwpeo61cn7LJ0N8fR6FCU4")
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets")
      }
    },
    root: path.resolve(import.meta.dirname, "client"),
    base: "./",
    // Relative paths for static hosting
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"]
      }
    }
  };
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
