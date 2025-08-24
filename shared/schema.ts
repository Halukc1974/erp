import { sql } from 'drizzle-orm';
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
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, accountant, manager, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chart of Accounts - Hesap Planı
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  parentId: uuid("parent_id"),
  accountType: varchar("account_type").notNull(), // asset, liability, equity, income, expense
  currency: varchar("currency", { length: 3 }).default("TRY"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// General Journal Entries - Genel Yevmiye Kayıtları
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status").default("draft"), // draft, posted, cancelled
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entry Lines - Yevmiye Satırları
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id),
  description: text("description"),
  debit: decimal("debit", { precision: 15, scale: 2 }).default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers - Tedarikçiler
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  taxNumber: varchar("tax_number", { length: 20 }),
  taxOffice: varchar("tax_office", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  paymentTerms: integer("payment_terms").default(30), // days
  currency: varchar("currency", { length: 3 }).default("TRY"),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers - Müşteriler
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  taxNumber: varchar("tax_number", { length: 20 }),
  taxOffice: varchar("tax_office", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 100 }),
  paymentTerms: integer("payment_terms").default(30), // days
  currency: varchar("currency", { length: 3 }).default("TRY"),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  riskLevel: varchar("risk_level").default("low"), // low, medium, high
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Orders - Satın Alma Siparişleri
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  status: varchar("status").default("pending"), // pending, approved, delivered, cancelled
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Order Items - Satın Alma Sipariş Kalemleri
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: uuid("purchase_order_id").references(() => purchaseOrders.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("20"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  deliveredQuantity: decimal("delivered_quantity", { precision: 10, scale: 3 }).default("0"),
  unit: varchar("unit", { length: 10 }).default("adet"),
});

// Sales Orders - Satış Siparişleri
export const salesOrders = pgTable("sales_orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id),
  orderDate: date("order_date").notNull(),
  deliveryDate: date("delivery_date"),
  status: varchar("status").default("pending"), // pending, approved, delivered, invoiced, cancelled
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales Order Items - Satış Sipariş Kalemleri
export const salesOrderItems = pgTable("sales_order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  salesOrderId: uuid("sales_order_id").references(() => salesOrders.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("20"),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  deliveredQuantity: decimal("delivered_quantity", { precision: 10, scale: 3 }).default("0"),
  unit: varchar("unit", { length: 10 }).default("adet"),
});

// Bank Accounts - Banka Hesapları
export const bankAccounts = pgTable("bank_accounts", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank Guarantees - Banka Teminat Mektupları
export const bankGuarantees = pgTable("bank_guarantees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guaranteeNumber: varchar("guarantee_number", { length: 50 }).notNull().unique(),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
  guaranteeType: varchar("guarantee_type").notNull(), // performance, advance_payment, warranty, bid
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  beneficiary: varchar("beneficiary", { length: 200 }).notNull(),
  purpose: text("purpose"),
  status: varchar("status").default("active"), // active, expired, returned, cancelled
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }),
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credits - Krediler
export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  creditNumber: varchar("credit_number", { length: 50 }).notNull().unique(),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
  creditType: varchar("credit_type").notNull(), // term_loan, line_of_credit, overdraft
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  startDate: date("start_date").notNull(),
  maturityDate: date("maturity_date").notNull(),
  paymentFrequency: varchar("payment_frequency").default("monthly"), // monthly, quarterly, annually
  status: varchar("status").default("active"), // active, paid, defaulted
  purpose: text("purpose"),
  collateral: text("collateral"),
  notes: text("notes"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subcontractors - Taşeronlar
export const subcontractors = pgTable("subcontractors", {
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
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time Sheets - Puantaj Kayıtları
export const timeSheets = pgTable("time_sheets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subcontractorId: uuid("subcontractor_id").references(() => subcontractors.id),
  workDate: date("work_date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  projectCode: varchar("project_code", { length: 50 }),
  description: text("description"),
  status: varchar("status").default("draft"), // draft, approved, paid
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost Centers - Masraf Merkezleri
export const costCenters = pgTable("cost_centers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  parentId: uuid("parent_id"),
  description: text("description"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses - Giderler
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseNumber: varchar("expense_number", { length: 50 }).notNull().unique(),
  costCenterId: uuid("cost_center_id").references(() => costCenters.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  expenseDate: date("expense_date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  category: varchar("category"), // office, travel, utilities, etc.
  receiptNumber: varchar("receipt_number", { length: 50 }),
  status: varchar("status").default("pending"), // pending, approved, paid
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents - Belgeler
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  documentType: varchar("document_type"), // invoice, receipt, contract, guarantee, etc.
  relatedTable: varchar("related_table", { length: 50 }),
  relatedId: uuid("related_id"),
  description: text("description"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dynamic Menu System - Dinamik Menü Sistemi
export const menuSections = pgTable("menu_sections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menuPages = pgTable("menu_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 100 }).notNull(),
  href: varchar("href", { length: 200 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }).default("FileText"), // Lucide icon name
  sectionId: uuid("section_id").references(() => menuSections.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  pageType: varchar("page_type").default("dynamic"), // static, dynamic
  componentName: varchar("component_name", { length: 100 }), // For static pages like Dashboard
  hasTabulator: boolean("has_tabulator").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dynamic Tables - Dinamik Tablolar
export const dynamicTables = pgTable("dynamic_tables", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dynamic Columns - Dinamik Sütunlar
export const dynamicColumns = pgTable("dynamic_columns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  dataType: varchar("data_type").notNull(), // text, number, date, decimal, boolean, checkbox, select
  isRequired: boolean("is_required").default(false),
  isEditable: boolean("is_editable").default(true),
  defaultValue: text("default_value"),
  options: jsonb("options"), // For select/dropdown columns
  width: integer("width"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dynamic Table Data - Dinamik Tablo Verileri
export const dynamicTableData = pgTable("dynamic_table_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables.id, { onDelete: "cascade" }),
  rowData: jsonb("row_data").notNull(), // Stores all column values as JSON
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cell Links - Hücre Bağlantıları
export const cellLinks = pgTable("cell_links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceTableId: uuid("source_table_id").references(() => dynamicTables.id, { onDelete: "cascade" }), // Kaynak tablo
  sourceRowId: uuid("source_row_id").references(() => dynamicTableData.id, { onDelete: "cascade" }), // Kaynak satır
  sourceColumnName: varchar("source_column_name", { length: 100 }).notNull(), // Kaynak sütun
  targetTableName: varchar("target_table_name", { length: 100 }).notNull(), // Hedef tablo (accounts, customers etc.)
  targetRowId: varchar("target_row_id").notNull(), // Hedef satır ID'si
  targetFieldName: varchar("target_field_name", { length: 100 }).notNull(), // Hedef alan (name, code etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cell Formulas - Hücre Formülleri (Excel benzeri)
export const cellFormulas = pgTable("cell_formulas", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableId: uuid("table_id").references(() => dynamicTables.id, { onDelete: "cascade" }),
  rowId: uuid("row_id").references(() => dynamicTableData.id, { onDelete: "cascade" }),
  columnName: varchar("column_name", { length: 100 }).notNull(),
  formula: text("formula").notNull(), // =A1+B2*C3, =SUM(A1:A10) etc.
  dependencies: jsonb("dependencies"), // ["A1", "B2", "C3"] - bağımlı hücreler
  calculatedValue: varchar("calculated_value"), // Son hesaplanan değer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankGuaranteeSchema = createInsertSchema(bankGuarantees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditSchema = createInsertSchema(credits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubcontractorSchema = createInsertSchema(subcontractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeSheetSchema = createInsertSchema(timeSheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuSectionSchema = createInsertSchema(menuSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMenuPageSchema = createInsertSchema(menuPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDynamicTableSchema = createInsertSchema(dynamicTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDynamicColumnSchema = createInsertSchema(dynamicColumns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDynamicTableDataSchema = createInsertSchema(dynamicTableData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCellLinkSchema = createInsertSchema(cellLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCellFormulaSchema = createInsertSchema(cellFormulas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertBankGuarantee = z.infer<typeof insertBankGuaranteeSchema>;
export type BankGuarantee = typeof bankGuarantees.$inferSelect;
export type InsertCredit = z.infer<typeof insertCreditSchema>;
export type Credit = typeof credits.$inferSelect;
export type InsertSubcontractor = z.infer<typeof insertSubcontractorSchema>;
export type Subcontractor = typeof subcontractors.$inferSelect;
export type InsertTimeSheet = z.infer<typeof insertTimeSheetSchema>;
export type TimeSheet = typeof timeSheets.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertMenuSection = z.infer<typeof insertMenuSectionSchema>;
export type MenuSection = typeof menuSections.$inferSelect;
export type InsertMenuPage = z.infer<typeof insertMenuPageSchema>;
export type MenuPage = typeof menuPages.$inferSelect;
export type InsertDynamicTable = z.infer<typeof insertDynamicTableSchema>;
export type DynamicTable = typeof dynamicTables.$inferSelect;
export type InsertDynamicColumn = z.infer<typeof insertDynamicColumnSchema>;
export type DynamicColumn = typeof dynamicColumns.$inferSelect;
export type InsertDynamicTableData = z.infer<typeof insertDynamicTableDataSchema>;
export type DynamicTableData = typeof dynamicTableData.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertCellLink = z.infer<typeof insertCellLinkSchema>;
export type CellLink = typeof cellLinks.$inferSelect;
export type InsertCellFormula = z.infer<typeof insertCellFormulaSchema>;
export type CellFormula = typeof cellFormulas.$inferSelect;
