import {
  users,
  accounts,
  bankAccounts,
  journalEntries,
  journalEntryLines,
  suppliers,
  customers,
  purchaseOrders,
  purchaseOrderItems,
  salesOrders,
  salesOrderItems,
  bankGuarantees,
  credits,
  subcontractors,
  timeSheets,
  costCenters,
  expenses,
  menuSections,
  menuPages,
  dynamicTables,
  dynamicColumns,
  dynamicTableData,
  cellLinks,
  cellFormulas,
  type User,
  type UpsertUser,
  type Account,
  type InsertAccount,
  type JournalEntry,
  type InsertJournalEntry,
  type Supplier,
  type InsertSupplier,
  type Customer,
  type InsertCustomer,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type SalesOrder,
  type InsertSalesOrder,
  type BankAccount,
  type InsertBankAccount,
  type BankGuarantee,
  type InsertBankGuarantee,
  type Credit,
  type InsertCredit,
  type Subcontractor,
  type InsertSubcontractor,
  type TimeSheet,
  type InsertTimeSheet,
  type Expense,
  type InsertExpense,
  type DynamicTable,
  type InsertDynamicTable,
  type DynamicColumn,
  type InsertDynamicColumn,
  type DynamicTableData,
  type InsertDynamicTableData,
  type CellLink,
  type InsertCellLink,
  type CellFormula,
  type InsertCellFormula,
  type MenuSection,
  type InsertMenuSection,
  type MenuPage,
  type InsertMenuPage,
} from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import { eq, desc, and, or, like, gte, lte, sum, count } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Account operations
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account>;
  
  // Journal Entry operations
  getJournalEntries(limit?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  
  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  
  // Purchase Order operations
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  
  // Sales Order operations
  getSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  
  // Bank Account operations
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccount(id: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  
  // Bank Guarantee operations
  getBankGuarantees(): Promise<BankGuarantee[]>;
  getBankGuarantee(id: string): Promise<BankGuarantee | undefined>;
  createBankGuarantee(guarantee: InsertBankGuarantee): Promise<BankGuarantee>;
  
  // Credit operations
  getCredits(): Promise<Credit[]>;
  getCredit(id: string): Promise<Credit | undefined>;
  createCredit(credit: InsertCredit): Promise<Credit>;
  
  // Subcontractor operations
  getSubcontractors(): Promise<Subcontractor[]>;
  getSubcontractor(id: string): Promise<Subcontractor | undefined>;
  createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor>;
  updateSubcontractor(id: string, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor>;
  
  // Time Sheet operations
  getTimeSheets(): Promise<TimeSheet[]>;
  getTimeSheet(id: string): Promise<TimeSheet | undefined>;
  createTimeSheet(timeSheet: InsertTimeSheet): Promise<TimeSheet>;
  updateTimeSheet(id: string, timeSheet: Partial<InsertTimeSheet>): Promise<TimeSheet>;
  
  // Expense operations  
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  
  // Dashboard analytics
  getDashboardMetrics(): Promise<any>;
  getRevenueAnalytics(): Promise<any[]>;
  getExpenseBreakdown(): Promise<any[]>;
  getRecentTransactions(): Promise<any[]>;
  
  // Dynamic Tables - Dinamik Tablo İşlemleri
  getDynamicTables(): Promise<DynamicTable[]>;
  getDynamicTable(id: string): Promise<DynamicTable | undefined>;
  createDynamicTable(table: InsertDynamicTable): Promise<DynamicTable>;
  updateDynamicTable(id: string, table: Partial<InsertDynamicTable>): Promise<DynamicTable>;
  deleteDynamicTable(id: string): Promise<void>;
  
  getDynamicColumns(tableId: string): Promise<DynamicColumn[]>;
  createDynamicColumn(column: InsertDynamicColumn): Promise<DynamicColumn>;
  updateDynamicColumn(id: string, column: Partial<InsertDynamicColumn>): Promise<DynamicColumn>;
  deleteDynamicColumn(id: string): Promise<void>;
  
  getDynamicTableData(tableId: string): Promise<DynamicTableData[]>;
  getDynamicTableDataRow(id: string): Promise<DynamicTableData | null>;
  createDynamicTableRow(data: InsertDynamicTableData): Promise<DynamicTableData>;
  updateDynamicTableRow(id: string, data: Partial<InsertDynamicTableData>): Promise<DynamicTableData>;
  deleteDynamicTableRow(id: string): Promise<void>;
  
  // Cell Link operations - Hücre Bağlantı İşlemleri
  getCellLinks(sourceTableId: string): Promise<CellLink[]>;
  createCellLink(link: InsertCellLink): Promise<CellLink>;
  deleteCellLink(id: string): Promise<void>;
  getAvailableTables(): Promise<{ name: string; displayName: string; columns: string[] }[]>;
  getTableData(tableName: string): Promise<any[]>;

  // Cell Formula operations - Hücre Formül İşlemleri
  getCellFormulas(tableId: string): Promise<CellFormula[]>;
  getCellFormula(rowId: string, columnName: string): Promise<CellFormula | undefined>;
  createCellFormula(formula: InsertCellFormula): Promise<CellFormula>;
  updateCellFormula(id: string, formula: Partial<InsertCellFormula>): Promise<CellFormula>;
  deleteCellFormula(id: string): Promise<void>;

  // Menu System - Dinamik Menü Sistemi
  getMenuSections(): Promise<MenuSection[]>;
  getMenuSection(id: string): Promise<MenuSection | undefined>;
  createMenuSection(section: InsertMenuSection): Promise<MenuSection>;
  updateMenuSection(id: string, section: Partial<InsertMenuSection>): Promise<MenuSection>;
  deleteMenuSection(id: string): Promise<void>;
  
  getMenuPages(): Promise<MenuPage[]>;
  getMenuPage(id: string): Promise<MenuPage | undefined>;
  createMenuPage(page: InsertMenuPage): Promise<MenuPage>;
  updateMenuPage(id: string, page: Partial<InsertMenuPage>): Promise<MenuPage>;
  deleteMenuPage(id: string): Promise<void>;
}

// Tüm veriler Supabase DatabaseStorage ile saklanıyor - in-memory storage tamamen kaldırıldı
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).where(eq(accounts.isActive, true)).orderBy(accounts.code);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
    return newAccount;
  }

  async updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account> {
    const [updatedAccount] = await db
      .update(accounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount;
  }

  // Journal Entry operations
  async getJournalEntries(limit = 50): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.date)).limit(limit);
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  // Purchase Order operations
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.orderDate));
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order;
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }

  // Sales Order operations
  async getSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.orderDate));
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return order;
  }

  async createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder> {
    const [newOrder] = await db.insert(salesOrders).values(order).returning();
    return newOrder;
  }

  // Bank Account operations  
  async getBankAccounts(): Promise<BankAccount[]> {
    return await db.select().from(bankAccounts);
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account;
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }

  // Bank Guarantee operations
  async getBankGuarantees(): Promise<BankGuarantee[]> {
    return await db.select().from(bankGuarantees).orderBy(desc(bankGuarantees.issueDate));
  }

  async getBankGuarantee(id: string): Promise<BankGuarantee | undefined> {
    const [guarantee] = await db.select().from(bankGuarantees).where(eq(bankGuarantees.id, id));
    return guarantee;
  }

  async createBankGuarantee(guarantee: InsertBankGuarantee): Promise<BankGuarantee> {
    const [newGuarantee] = await db.insert(bankGuarantees).values(guarantee).returning();
    return newGuarantee;
  }

  // Credit operations
  async getCredits(): Promise<Credit[]> {
    return await db.select().from(credits).orderBy(desc(credits.startDate));
  }

  async getCredit(id: string): Promise<Credit | undefined> {
    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }

  async createCredit(credit: InsertCredit): Promise<Credit> {
    const [newCredit] = await db.insert(credits).values(credit).returning();
    return newCredit;
  }

  // Subcontractor operations
  async getSubcontractors(): Promise<Subcontractor[]> {
    return await db.select().from(subcontractors).orderBy(subcontractors.name);
  }

  async getSubcontractor(id: string): Promise<Subcontractor | undefined> {
    const [subcontractor] = await db.select().from(subcontractors).where(eq(subcontractors.id, id));
    return subcontractor;
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const [newSubcontractor] = await db.insert(subcontractors).values(subcontractor).returning();
    return newSubcontractor;
  }

  async updateSubcontractor(id: string, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor> {
    const [updatedSubcontractor] = await db
      .update(subcontractors)
      .set({ ...subcontractor, updatedAt: new Date() })
      .where(eq(subcontractors.id, id))
      .returning();
    return updatedSubcontractor;
  }

  // Time Sheet operations
  async getTimeSheets(): Promise<TimeSheet[]> {
    return await db.select().from(timeSheets).orderBy(desc(timeSheets.workDate));
  }

  async getTimeSheet(id: string): Promise<TimeSheet | undefined> {
    const [timeSheet] = await db.select().from(timeSheets).where(eq(timeSheets.id, id));
    return timeSheet;
  }

  async createTimeSheet(timeSheet: InsertTimeSheet): Promise<TimeSheet> {
    const [newTimeSheet] = await db.insert(timeSheets).values(timeSheet).returning();
    return newTimeSheet;
  }

  async updateTimeSheet(id: string, timeSheet: Partial<InsertTimeSheet>): Promise<TimeSheet> {
    const [updatedTimeSheet] = await db
      .update(timeSheets)
      .set({ ...timeSheet, updatedAt: new Date() })
      .where(eq(timeSheets.id, id))
      .returning();
    return updatedTimeSheet;
  }

  // Expense operations  
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }

  // Dashboard analytics
  async getDashboardMetrics(): Promise<any> {
    const totalCustomers = await db.select({ count: count() }).from(customers);
    const totalSuppliers = await db.select({ count: count() }).from(suppliers);
    const totalAccounts = await db.select({ count: count() }).from(accounts);

    return {
      totalCustomers: totalCustomers[0]?.count || 0,
      totalSuppliers: totalSuppliers[0]?.count || 0,
      totalAccounts: totalAccounts[0]?.count || 0,
      totalRevenue: 0, // Placeholder
      totalExpenses: 0, // Placeholder
    };
  }

  async getRevenueAnalytics(): Promise<any[]> {
    // Placeholder - real implementation would aggregate sales data
    return [
      { month: "Ocak", revenue: 125000 },
      { month: "Şubat", revenue: 142000 },
      { month: "Mart", revenue: 135000 },
      { month: "Nisan", revenue: 158000 },
      { month: "Mayıs", revenue: 167000 },
      { month: "Haziran", revenue: 181000 },
    ];
  }

  async getExpenseBreakdown(): Promise<any[]> {
    // Placeholder - real implementation would aggregate expense data
    return [
      { category: "Operasyon", amount: 45000, percentage: 35 },
      { category: "Maaşlar", amount: 38000, percentage: 30 },
      { category: "Pazarlama", amount: 25000, percentage: 20 },
      { category: "Teknoloji", amount: 19000, percentage: 15 },
    ];
  }

  async getRecentTransactions(): Promise<any[]> {
    const recentEntries = await db
      .select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.date))
      .limit(5);
    
    return recentEntries.map(entry => ({
      id: entry.id,
      description: entry.description,
      amount: entry.totalDebit || entry.totalCredit || "0",
      date: entry.date,
      type: entry.totalDebit ? "debit" : "credit"
    }));
  }

  // Dynamic Tables - Dinamik Tablo İşlemleri
  async getDynamicTables(): Promise<DynamicTable[]> {
    return await db.select().from(dynamicTables).where(eq(dynamicTables.isActive, true)).orderBy(dynamicTables.name);
  }

  async getDynamicTable(id: string): Promise<DynamicTable | undefined> {
    const [table] = await db.select().from(dynamicTables).where(eq(dynamicTables.id, id));
    return table;
  }

  async createDynamicTable(table: InsertDynamicTable): Promise<DynamicTable> {
    const [newTable] = await db.insert(dynamicTables).values(table).returning();
    return newTable;
  }

  async updateDynamicTable(id: string, table: Partial<InsertDynamicTable>): Promise<DynamicTable> {
    const [updatedTable] = await db
      .update(dynamicTables)
      .set({ ...table, updatedAt: new Date() })
      .where(eq(dynamicTables.id, id))
      .returning();
    return updatedTable;
  }

  async deleteDynamicTable(id: string): Promise<void> {
    await db.delete(dynamicTables).where(eq(dynamicTables.id, id));
  }

  // Dynamic Columns - Dinamik Sütunlar (routes.ts ile senkronize edildi)
  async getDynamicColumns(tableId: string): Promise<DynamicColumn[]> {
    return await db.select().from(dynamicColumns).where(eq(dynamicColumns.tableId, tableId)).orderBy(dynamicColumns.sortOrder);
  }

  async createDynamicColumn(column: InsertDynamicColumn): Promise<DynamicColumn> {
    const [newColumn] = await db.insert(dynamicColumns).values(column).returning();
    return newColumn;
  }

  async updateDynamicColumn(id: string, column: Partial<InsertDynamicColumn>): Promise<DynamicColumn> {
    const [updatedColumn] = await db
      .update(dynamicColumns)
      .set({ ...column, updatedAt: new Date() })
      .where(eq(dynamicColumns.id, id))
      .returning();
    return updatedColumn;
  }

  async deleteDynamicColumn(id: string): Promise<void> {
    await db.delete(dynamicColumns).where(eq(dynamicColumns.id, id));
  }

  async getDynamicTableData(tableId: string): Promise<DynamicTableData[]> {
    return await db.select().from(dynamicTableData).where(eq(dynamicTableData.tableId, tableId)).orderBy(dynamicTableData.createdAt);
  }

  async getDynamicTableDataRow(id: string): Promise<DynamicTableData | null> {
    const [row] = await db.select().from(dynamicTableData).where(eq(dynamicTableData.id, id)).limit(1);
    return row || null;
  }

  async createDynamicTableRow(data: InsertDynamicTableData): Promise<DynamicTableData> {
    const [newRow] = await db.insert(dynamicTableData).values(data).returning();
    return newRow;
  }

  async updateDynamicTableRow(id: string, data: Partial<InsertDynamicTableData>): Promise<DynamicTableData> {
    const [updatedRow] = await db
      .update(dynamicTableData)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dynamicTableData.id, id))
      .returning();
    return updatedRow;
  }

  async deleteDynamicTableRow(id: string): Promise<void> {
    await db.delete(dynamicTableData).where(eq(dynamicTableData.id, id));
  }

  // Cell Link operations - Hücre Bağlantı İşlemleri
  async getCellLinks(sourceTableId: string): Promise<CellLink[]> {
    return await db.select().from(cellLinks).where(eq(cellLinks.sourceTableId, sourceTableId));
  }

  async createCellLink(link: InsertCellLink): Promise<CellLink> {
    const [newLink] = await db.insert(cellLinks).values(link).returning();
    return newLink;
  }

  async deleteCellLink(id: string): Promise<void> {
    await db.delete(cellLinks).where(eq(cellLinks.id, id));
  }

  // Cell Formula operations - Hücre Formül İşlemleri
  async getCellFormulas(tableId: string): Promise<CellFormula[]> {
    return await db.select().from(cellFormulas).where(eq(cellFormulas.tableId, tableId));
  }

  async getCellFormula(rowId: string, columnName: string): Promise<CellFormula | undefined> {
    const results = await db
      .select()
      .from(cellFormulas)
      .where(and(eq(cellFormulas.rowId, rowId), eq(cellFormulas.columnName, columnName)))
      .limit(1);
    return results[0];
  }

  async createCellFormula(formula: InsertCellFormula): Promise<CellFormula> {
    // Önce aynı hücre için mevcut formül var mı kontrol et
    const existingFormula = await this.getCellFormula(formula.rowId!, formula.columnName);
    
    if (existingFormula) {
      // Mevcut formülü güncelle (upsert)
      const [updatedFormula] = await db
        .update(cellFormulas)
        .set({
          formula: formula.formula,
          dependencies: formula.dependencies, // JSONB için direkt obje kullan
          calculatedValue: formula.calculatedValue,
          updatedAt: new Date(),
        })
        .where(eq(cellFormulas.id, existingFormula.id))
        .returning();
      return updatedFormula;
    } else {
      // Yeni formül oluştur
      const [newFormula] = await db.insert(cellFormulas).values(formula).returning();
      return newFormula;
    }
  }

  async updateCellFormula(id: string, formula: Partial<InsertCellFormula>): Promise<CellFormula> {
    const updateData = { ...formula, updatedAt: new Date() };
    const [updatedFormula] = await db
      .update(cellFormulas)
      .set(updateData)
      .where(eq(cellFormulas.id, id))
      .returning();
    return updatedFormula;
  }

  async deleteCellFormula(id: string): Promise<void> {
    await db.delete(cellFormulas).where(eq(cellFormulas.id, id));
  }

  async getAvailableTables(): Promise<{ name: string; displayName: string; columns: string[] }[]> {
    // Sabit tablolar
    const staticTables = [
      {
        name: "accounts",
        displayName: "Hesap Planı",
        columns: ["code", "name", "accountType", "balance"]
      },
      {
        name: "customers",
        displayName: "Müşteriler", 
        columns: ["code", "name", "email", "phone"]
      },
      {
        name: "suppliers",
        displayName: "Tedarikçiler",
        columns: ["code", "name", "email", "phone"]
      }
    ];

    // Dinamik tablolar
    const dynamicTables = await this.getDynamicTables();
    const dynamicTableList = await Promise.all(
      dynamicTables.map(async (table) => {
        const columns = await this.getDynamicColumns(table.id);
        return {
          name: `dynamic_table_${table.id}`,
          displayName: table.displayName || table.name,
          columns: columns.map(col => col.name)
        };
      })
    );

    return [...staticTables, ...dynamicTableList];
  }

  async getTableData(tableName: string): Promise<any[]> {
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
  async getMenuSections(): Promise<MenuSection[]> {
    return await db.select().from(menuSections).where(eq(menuSections.isActive, true)).orderBy(menuSections.sortOrder);
  }

  async getMenuSection(id: string): Promise<MenuSection | undefined> {
    const [section] = await db.select().from(menuSections).where(eq(menuSections.id, id));
    return section;
  }

  async createMenuSection(section: InsertMenuSection): Promise<MenuSection> {
    const [newSection] = await db.insert(menuSections).values(section).returning();
    return newSection;
  }

  async updateMenuSection(id: string, section: Partial<InsertMenuSection>): Promise<MenuSection> {
    const [updatedSection] = await db.update(menuSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(menuSections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteMenuSection(id: string): Promise<void> {
    await db.delete(menuSections).where(eq(menuSections.id, id));
  }

  async getMenuPages(): Promise<MenuPage[]> {
    return await db.select().from(menuPages).where(eq(menuPages.isActive, true)).orderBy(menuPages.sortOrder);
  }

  async getMenuPage(id: string): Promise<MenuPage | undefined> {
    const [page] = await db.select().from(menuPages).where(eq(menuPages.id, id));
    return page;
  }

  async createMenuPage(page: InsertMenuPage): Promise<MenuPage> {
    const [newPage] = await db.insert(menuPages).values(page).returning();
    return newPage;
  }

  async updateMenuPage(id: string, page: Partial<InsertMenuPage>): Promise<MenuPage> {
    const [updatedPage] = await db.update(menuPages)
      .set({ ...page, updatedAt: new Date() })
      .where(eq(menuPages.id, id))
      .returning();
    return updatedPage;
  }

  async deleteMenuPage(id: string): Promise<void> {
    await db.delete(menuPages).where(eq(menuPages.id, id));
  }

}

export const storage = new DatabaseStorage();