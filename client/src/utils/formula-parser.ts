export interface CellReference {
  column: string;
  row: number;
}

export interface FormulaResult {
  value: number | string | boolean;
  error?: string;
}

export class FormulaParser {
  private data: any[];
  private columnNames: string[];

  constructor(data: any[], columnNames: string[]) {
    this.data = data;
    this.columnNames = columnNames;
  }

  /**
   * Parse and evaluate a formula
   * Supports: =A1+B2, =SUM(A1:A10), =AVG(B1:B5), etc.
   */
  evaluate(formula: string): FormulaResult {
    try {
      // Remove = sign if present
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      
      // Handle different formula types
      if (this.isFunction(cleanFormula)) {
        return this.evaluateFunction(cleanFormula);
      } else {
        return this.evaluateExpression(cleanFormula);
      }
    } catch (error) {
      return {
        value: '#ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if formula is a function (SUM, AVG, etc.)
   */
  private isFunction(formula: string): boolean {
    const functionRegex = /^(SUM|AVG|COUNT|MIN|MAX|IF)\s*\(/i;
    return functionRegex.test(formula);
  }

  /**
   * Evaluate function formulas like SUM(A1:A10)
   */
  private evaluateFunction(formula: string): FormulaResult {
    const functionMatch = formula.match(/^(SUM|AVG|COUNT|MIN|MAX|IF)\s*\((.+)\)$/i);
    if (!functionMatch) {
      throw new Error('Invalid function syntax');
    }

    const [, functionName, args] = functionMatch;
    const functionUpper = functionName.toUpperCase();

    switch (functionUpper) {
      case 'SUM':
        return this.handleSum(args);
      case 'AVG':
        return this.handleAvg(args);
      case 'COUNT':
        return this.handleCount(args);
      case 'MIN':
        return this.handleMin(args);
      case 'MAX':
        return this.handleMax(args);
      case 'IF':
        return this.handleIf(args);
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }
  }

  /**
   * Evaluate simple expressions like A1+B2*C3
   */
  private evaluateExpression(formula: string): FormulaResult {
    // Replace cell references with actual values
    let expression = formula;
    const cellRefRegex = /[A-Z]+\d+/g;
    const cellRefs = formula.match(cellRefRegex) || [];
    
    for (const cellRef of cellRefs) {
      const value = this.getCellValue(cellRef);
      expression = expression.replace(new RegExp(cellRef, 'g'), String(value));
    }

    // Evaluate the mathematical expression
    try {
      const result = this.safeEvaluate(expression);
      return { value: result };
    } catch (error) {
      throw new Error(`Invalid expression: ${expression}`);
    }
  }

  /**
   * Safely evaluate mathematical expressions
   */
  private safeEvaluate(expression: string): number {
    // Only allow numbers, operators, and parentheses
    const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
    if (safeExpression !== expression) {
      throw new Error('Invalid characters in expression');
    }
    
    // Use Function constructor for safer evaluation than eval
    return new Function(`'use strict'; return (${safeExpression})`)();
  }

  /**
   * Get value from cell reference like A1, B2
   * Made public to allow overriding for custom data sources
   */
  getCellValue(cellRef: string): number {
    const { column, row } = this.parseCellReference(cellRef);
    const rowData = this.data[row - 1]; // Convert to 0-based index
    
    if (!rowData) {
      return 0;
    }

    const value = rowData[column];
    return this.parseNumericValue(value);
  }

  /**
   * Parse cell reference like A1 into column and row
   */
  private parseCellReference(cellRef: string): CellReference {
    const match = cellRef.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid cell reference: ${cellRef}`);
    }
    
    const [, columnLetters, rowString] = match;
    const row = parseInt(rowString, 10);
    
    // Convert column letters to column name
    const columnIndex = this.columnLettersToIndex(columnLetters);
    const column = this.columnNames[columnIndex];
    
    if (!column) {
      throw new Error(`Column not found: ${columnLetters}`);
    }
    
    return { column, row };
  }

  /**
   * Convert column letters (A, B, AA, etc.) to 0-based index
   */
  private columnLettersToIndex(letters: string): number {
    let result = 0;
    for (let i = 0; i < letters.length; i++) {
      result = result * 26 + (letters.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result - 1; // Convert to 0-based
  }

  /**
   * Parse value as number, return 0 if not numeric
   */
  private parseNumericValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Get values from range like A1:A10
   */
  private getRangeValues(range: string): number[] {
    const [start, end] = range.split(':');
    if (!start || !end) {
      throw new Error(`Invalid range: ${range}`);
    }

    const startRef = this.parseCellReference(start);
    const endRef = this.parseCellReference(end);
    
    const values: number[] = [];
    
    // Handle column range (same column, different rows)
    if (startRef.column === endRef.column) {
      for (let row = startRef.row; row <= endRef.row; row++) {
        const cellRef = `${this.indexToColumnLetters(this.columnNames.indexOf(startRef.column))}${row}`;
        values.push(this.getCellValue(cellRef));
      }
    }
    // Handle row range (same row, different columns) 
    else if (startRef.row === endRef.row) {
      const startColIndex = this.columnNames.indexOf(startRef.column);
      const endColIndex = this.columnNames.indexOf(endRef.column);
      for (let colIndex = startColIndex; colIndex <= endColIndex; colIndex++) {
        const cellRef = `${this.indexToColumnLetters(colIndex)}${startRef.row}`;
        values.push(this.getCellValue(cellRef));
      }
    }
    
    return values;
  }

  /**
   * Convert 0-based column index to letters (A, B, AA, etc.)
   */
  private indexToColumnLetters(index: number): string {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode('A'.charCodeAt(0) + (index % 26)) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  }

  // Function implementations
  private handleSum(args: string): FormulaResult {
    const values = this.getRangeValues(args.trim());
    const sum = values.reduce((acc, val) => acc + val, 0);
    return { value: sum };
  }

  private handleAvg(args: string): FormulaResult {
    const values = this.getRangeValues(args.trim());
    if (values.length === 0) {
      return { value: 0 };
    }
    const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
    return { value: Math.round(avg * 100) / 100 }; // Round to 2 decimals
  }

  private handleCount(args: string): FormulaResult {
    const values = this.getRangeValues(args.trim());
    return { value: values.length };
  }

  private handleMin(args: string): FormulaResult {
    const values = this.getRangeValues(args.trim());
    if (values.length === 0) {
      return { value: 0 };
    }
    return { value: Math.min(...values) };
  }

  private handleMax(args: string): FormulaResult {
    const values = this.getRangeValues(args.trim());
    if (values.length === 0) {
      return { value: 0 };
    }
    return { value: Math.max(...values) };
  }

  private handleIf(args: string): FormulaResult {
    // Basic IF implementation: IF(condition, valueIfTrue, valueIfFalse)
    const parts = this.parseIfArgs(args);
    if (parts.length !== 3) {
      throw new Error('IF function requires exactly 3 arguments');
    }
    
    const [condition, trueValue, falseValue] = parts;
    const conditionResult = this.evaluateCondition(condition);
    
    return {
      value: conditionResult ? this.parseValue(trueValue) : this.parseValue(falseValue)
    };
  }

  private parseIfArgs(args: string): string[] {
    // Simple comma split for now - could be enhanced for nested functions
    return args.split(',').map(arg => arg.trim());
  }

  private evaluateCondition(condition: string): boolean {
    // Simple condition evaluation (A1>5, B2="test", etc.)
    const operators = ['>=', '<=', '>', '<', '=', '!='];
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftVal = this.parseConditionValue(left);
        const rightVal = this.parseConditionValue(right);
        
        switch (op) {
          case '>': return leftVal > rightVal;
          case '<': return leftVal < rightVal;
          case '>=': return leftVal >= rightVal;
          case '<=': return leftVal <= rightVal;
          case '=': return leftVal === rightVal;
          case '!=': return leftVal !== rightVal;
        }
      }
    }
    return false;
  }

  private parseConditionValue(value: string): any {
    // Remove quotes if string literal
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    
    // Check if it's a cell reference
    if (/^[A-Z]+\d+$/.test(value)) {
      return this.getCellValue(value);
    }
    
    // Try to parse as number
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  private parseValue(value: string): any {
    // Remove quotes if string literal
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    
    // Check if it's a cell reference
    if (/^[A-Z]+\d+$/.test(value)) {
      return this.getCellValue(value);
    }
    
    // Try to parse as number
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }

  /**
   * Extract cell dependencies from a formula
   */
  static extractDependencies(formula: string): string[] {
    const cellRefRegex = /[A-Z]+\d+/g;
    const matches = formula.match(cellRefRegex) || [];
    return Array.from(new Set(matches)); // Remove duplicates - compatible with older TypeScript
  }

  /**
   * Validate formula syntax
   */
  static validateFormula(formula: string): { isValid: boolean; error?: string } {
    try {
      const cleanFormula = formula.startsWith('=') ? formula.slice(1) : formula;
      
      // Basic syntax validation
      if (cleanFormula.trim() === '') {
        return { isValid: false, error: 'Formula cannot be empty' };
      }
      
      // Check for balanced parentheses
      const openCount = (cleanFormula.match(/\(/g) || []).length;
      const closeCount = (cleanFormula.match(/\)/g) || []).length;
      if (openCount !== closeCount) {
        return { isValid: false, error: 'Unbalanced parentheses' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid formula syntax' 
      };
    }
  }
}