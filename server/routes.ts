import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import { 
  insertSupplierSchema,
  insertCustomerSchema,
  insertPurchaseOrderSchema,
  insertSalesOrderSchema,
  insertSubcontractorSchema,
  insertTimeSheetSchema,
  insertBankGuaranteeSchema,
  insertCreditSchema,
  insertExpenseSchema,
  insertMenuSectionSchema,
  insertMenuPageSchema,
  insertDynamicTableSchema,
  insertDynamicColumnSchema,
  insertDynamicTableDataSchema,
  insertCellLinkSchema,
  insertCellFormulaSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupLocalAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Return a basic user object for development when database fails
      res.json({
        id: req.user.claims.sub,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        role: 'user'
      });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/dashboard/revenue-analytics', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getRevenueAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/dashboard/expense-breakdown', isAuthenticated, async (req, res) => {
    try {
      const breakdown = await storage.getExpenseBreakdown();
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      res.status(500).json({ message: "Failed to fetch expense breakdown" });
    }
  });

  app.get('/api/dashboard/recent-transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getRecentTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req: any, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier({
        ...supplierData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(400).json({ message: "Failed to create supplier" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req: any, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer({
        ...customerData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  // Purchase Order routes
  app.get('/api/purchase-orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post('/api/purchase-orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = insertPurchaseOrderSchema.parse(req.body);
      const order = await storage.createPurchaseOrder({
        ...orderData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(400).json({ message: "Failed to create purchase order" });
    }
  });

  // Sales Order routes
  app.get('/api/sales-orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getSalesOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      res.status(500).json({ message: "Failed to fetch sales orders" });
    }
  });

  app.post('/api/sales-orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = insertSalesOrderSchema.parse(req.body);
      const order = await storage.createSalesOrder({
        ...orderData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating sales order:", error);
      res.status(400).json({ message: "Failed to create sales order" });
    }
  });

  // Bank Guarantee routes
  app.get('/api/bank-guarantees', isAuthenticated, async (req, res) => {
    try {
      const guarantees = await storage.getBankGuarantees();
      res.json(guarantees);
    } catch (error) {
      console.error("Error fetching bank guarantees:", error);
      res.status(500).json({ message: "Failed to fetch bank guarantees" });
    }
  });

  app.post('/api/bank-guarantees', isAuthenticated, async (req: any, res) => {
    try {
      const guaranteeData = insertBankGuaranteeSchema.parse(req.body);
      const guarantee = await storage.createBankGuarantee({
        ...guaranteeData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(guarantee);
    } catch (error) {
      console.error("Error creating bank guarantee:", error);
      res.status(400).json({ message: "Failed to create bank guarantee" });
    }
  });

  // Credit routes
  app.get('/api/credits', isAuthenticated, async (req, res) => {
    try {
      const credits = await storage.getCredits();
      res.json(credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.post('/api/credits', isAuthenticated, async (req: any, res) => {
    try {
      const creditData = insertCreditSchema.parse(req.body);
      const credit = await storage.createCredit({
        ...creditData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(credit);
    } catch (error) {
      console.error("Error creating credit:", error);
      res.status(400).json({ message: "Failed to create credit" });
    }
  });

  // Subcontractor routes
  app.get('/api/subcontractors', isAuthenticated, async (req, res) => {
    try {
      const subcontractors = await storage.getSubcontractors();
      res.json(subcontractors);
    } catch (error) {
      console.error("Error fetching subcontractors:", error);
      res.status(500).json({ message: "Failed to fetch subcontractors" });
    }
  });

  app.post('/api/subcontractors', isAuthenticated, async (req: any, res) => {
    try {
      const subcontractorData = insertSubcontractorSchema.parse(req.body);
      const subcontractor = await storage.createSubcontractor({
        ...subcontractorData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(subcontractor);
    } catch (error) {
      console.error("Error creating subcontractor:", error);
      res.status(400).json({ message: "Failed to create subcontractor" });
    }
  });

  // Time Sheet routes
  app.get('/api/time-sheets', isAuthenticated, async (req, res) => {
    try {
      const timeSheets = await storage.getTimeSheets();
      res.json(timeSheets);
    } catch (error) {
      console.error("Error fetching time sheets:", error);
      res.status(500).json({ message: "Failed to fetch time sheets" });
    }
  });

  app.post('/api/time-sheets', isAuthenticated, async (req: any, res) => {
    try {
      const timeSheetData = insertTimeSheetSchema.parse(req.body);
      const timeSheet = await storage.createTimeSheet({
        ...timeSheetData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(timeSheet);
    } catch (error) {
      console.error("Error creating time sheet:", error);
      res.status(400).json({ message: "Failed to create time sheet" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...expenseData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  // Menu System - Dinamik Menü Sistemi
  app.get('/api/menu-sections', isAuthenticated, async (req, res) => {
    try {
      const sections = await storage.getMenuSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching menu sections:", error);
      res.status(500).json({ message: "Failed to fetch menu sections" });
    }
  });

  app.post('/api/menu-sections', isAuthenticated, async (req, res) => {
    try {
      const section = insertMenuSectionSchema.parse(req.body);
      const newSection = await storage.createMenuSection(section);
      res.status(201).json(newSection);
    } catch (error) {
      console.error("Error creating menu section:", error);
      res.status(500).json({ message: "Failed to create menu section" });
    }
  });

  app.put('/api/menu-sections/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/menu-sections/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuSection(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu section:", error);
      res.status(500).json({ message: "Failed to delete menu section" });
    }
  });

  app.get('/api/menu-pages', isAuthenticated, async (req, res) => {
    try {
      const pages = await storage.getMenuPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching menu pages:", error);
      res.status(500).json({ message: "Failed to fetch menu pages" });
    }
  });

  app.post('/api/menu-pages', isAuthenticated, async (req, res) => {
    try {
      const page = insertMenuPageSchema.parse(req.body);
      const newPage = await storage.createMenuPage(page);
      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error creating menu page:", error);
      res.status(500).json({ message: "Failed to create menu page" });
    }
  });

  app.put('/api/menu-pages/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/menu-pages/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMenuPage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu page:", error);
      res.status(500).json({ message: "Failed to delete menu page" });
    }
  });

  // Dynamic Table routes
  app.get('/api/dynamic-tables', isAuthenticated, async (req, res) => {
    try {
      const tables = await storage.getDynamicTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching dynamic tables:", error);
      res.status(500).json({ message: "Failed to fetch dynamic tables" });
    }
  });

  app.get('/api/dynamic-tables/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/dynamic-tables', isAuthenticated, async (req: any, res) => {
    try {
      const tableData = insertDynamicTableSchema.parse(req.body);
      const table = await storage.createDynamicTable({
        ...tableData,
        userId: req.user.claims.sub,
      });
      res.status(201).json(table);
    } catch (error) {
      console.error("Error creating dynamic table:", error);
      res.status(400).json({ message: "Failed to create dynamic table" });
    }
  });

  app.put('/api/dynamic-tables/:id', isAuthenticated, async (req, res) => {
    try {
      const tableData = insertDynamicTableSchema.partial().parse(req.body);
      const table = await storage.updateDynamicTable(req.params.id, tableData);
      res.json(table);
    } catch (error) {
      console.error("Error updating dynamic table:", error);
      res.status(400).json({ message: "Failed to update dynamic table" });
    }
  });

  app.delete('/api/dynamic-tables/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicTable(req.params.id);
      res.json({ message: "Table deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic table:", error);
      res.status(500).json({ message: "Failed to delete dynamic table" });
    }
  });

  // Dynamic Column routes
  app.get('/api/dynamic-tables/:tableId/columns', isAuthenticated, async (req, res) => {
    try {
      const columns = await storage.getDynamicColumns(req.params.tableId);
      res.json(columns);
    } catch (error) {
      console.error("Error fetching dynamic columns:", error);
      res.status(500).json({ message: "Failed to fetch dynamic columns" });
    }
  });

  app.post('/api/dynamic-tables/:tableId/columns', isAuthenticated, async (req, res) => {
    try {
      const columnData = insertDynamicColumnSchema.parse({
        ...req.body,
        tableId: req.params.tableId,
      });
      const column = await storage.createDynamicColumn(columnData);
      res.status(201).json(column);
    } catch (error) {
      console.error("Error creating dynamic column:", error);
      res.status(400).json({ message: "Failed to create dynamic column" });
    }
  });

  app.put('/api/dynamic-columns/:id', isAuthenticated, async (req, res) => {
    try {
      const columnData = insertDynamicColumnSchema.partial().parse(req.body);
      const column = await storage.updateDynamicColumn(req.params.id, columnData);
      res.json(column);
    } catch (error) {
      console.error("Error updating dynamic column:", error);
      res.status(400).json({ message: "Failed to update dynamic column" });
    }
  });

  app.delete('/api/dynamic-columns/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicColumn(req.params.id);
      res.json({ message: "Column deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic column:", error);
      res.status(500).json({ message: "Failed to delete dynamic column" });
    }
  });

  // Dynamic Table Data routes
  app.get('/api/dynamic-tables/:tableId/data', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getDynamicTableData(req.params.tableId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching dynamic table data:", error);
      res.status(500).json({ message: "Failed to fetch dynamic table data" });
    }
  });

  app.post('/api/dynamic-tables/:tableId/data', isAuthenticated, async (req: any, res) => {
    try {
      console.log(`🔧 POST /api/dynamic-tables/${req.params.tableId}/data - Received data:`, req.body);
      const rowData = insertDynamicTableDataSchema.parse({
        ...req.body,
        tableId: req.params.tableId,
        userId: req.user.claims.sub,
      });
      console.log(`✅ Parsed data:`, rowData);
      const row = await storage.createDynamicTableRow(rowData);
      console.log(`✅ Created row:`, row);
      res.status(201).json(row);
    } catch (error) {
      console.error("❌ Error creating dynamic table row:", error);
      res.status(400).json({ 
        message: "Failed to create dynamic table row", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get('/api/dynamic-table-data/:id', isAuthenticated, async (req, res) => {
    try {
      const row = await storage.getDynamicTableDataRow(req.params.id);
      if (!row) {
        res.status(404).json({ message: "Row not found" });
        return;
      }
      res.json(row.rowData); // Return just the rowData for easy access
    } catch (error) {
      console.error("Error fetching dynamic table row:", error);
      res.status(500).json({ message: "Failed to fetch dynamic table row" });
    }
  });

  app.put('/api/dynamic-table-data/:id', isAuthenticated, async (req, res) => {
    try {
      console.log(`🔧 PUT /api/dynamic-table-data/${req.params.id} - Received data:`, req.body);
      const rowData = insertDynamicTableDataSchema.partial().parse(req.body);
      console.log(`✅ Parsed data:`, rowData);
      const row = await storage.updateDynamicTableRow(req.params.id, rowData);
      console.log(`✅ Updated row:`, row);
      res.json(row);
    } catch (error) {
      console.error("❌ Error updating dynamic table row:", error);
      res.status(400).json({ 
        message: "Failed to update dynamic table row", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.delete('/api/dynamic-table-data/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDynamicTableRow(req.params.id);
      res.json({ message: "Row deleted successfully" });
    } catch (error) {
      console.error("Error deleting dynamic table row:", error);
      res.status(500).json({ message: "Failed to delete dynamic table row" });
    }
  });

  // Cell Link endpoints - Hücre Bağlantı API'leri
  app.get('/api/cell-links/:sourceTableId', isAuthenticated, async (req, res) => {
    try {
      const links = await storage.getCellLinks(req.params.sourceTableId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching cell links:", error);
      res.status(500).json({ message: "Failed to fetch cell links" });
    }
  });

  app.post('/api/cell-links', isAuthenticated, async (req: any, res) => {
    try {
      const linkData = insertCellLinkSchema.parse(req.body);
      const link = await storage.createCellLink(linkData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating cell link:", error);
      res.status(400).json({ message: "Failed to create cell link" });
    }
  });

  app.delete('/api/cell-links/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCellLink(req.params.id);
      res.json({ message: "Cell link deleted successfully" });
    } catch (error) {
      console.error("Error deleting cell link:", error);
      res.status(500).json({ message: "Failed to delete cell link" });
    }
  });

  // Available tables for linking
  app.get('/api/available-tables', isAuthenticated, async (req, res) => {
    try {
      const tables = await storage.getAvailableTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      res.status(500).json({ message: "Failed to fetch available tables" });
    }
  });

  // Get data from a specific table
  app.get('/api/table-data/:tableName', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getTableData(req.params.tableName);
      res.json(data);
    } catch (error) {
      console.error("Error fetching table data:", error);
      res.status(500).json({ message: "Failed to fetch table data" });
    }
  });

  // Cell Formula endpoints - Hücre Formül API'leri
  app.get('/api/cell-formulas/:tableId', isAuthenticated, async (req, res) => {
    try {
      const formulas = await storage.getCellFormulas(req.params.tableId);
      res.json(formulas);
    } catch (error) {
      console.error("Error fetching cell formulas:", error);
      res.status(500).json({ message: "Failed to fetch cell formulas" });
    }
  });

  app.get('/api/cell-formulas/:rowId/:columnName', isAuthenticated, async (req, res) => {
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

  app.post('/api/cell-formulas', isAuthenticated, async (req: any, res) => {
    try {
      const formulaData = insertCellFormulaSchema.parse(req.body);
      const formula = await storage.createCellFormula(formulaData);
      res.status(201).json(formula);
    } catch (error) {
      console.error("Error creating cell formula:", error);
      res.status(400).json({ message: "Failed to create cell formula" });
    }
  });

  app.patch('/api/cell-formulas/:id', isAuthenticated, async (req, res) => {
    try {
      const formulaData = insertCellFormulaSchema.partial().parse(req.body);
      const formula = await storage.updateCellFormula(req.params.id, formulaData);
      res.json(formula);
    } catch (error) {
      console.error("Error updating cell formula:", error);
      res.status(400).json({ message: "Failed to update cell formula" });
    }
  });

  app.delete('/api/cell-formulas/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCellFormula(req.params.id);
      res.json({ message: "Cell formula deleted successfully" });
    } catch (error) {
      console.error("Error deleting cell formula:", error);
      res.status(500).json({ message: "Failed to delete cell formula" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
