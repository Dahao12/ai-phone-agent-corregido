/**
 * Simple Cache System for PhoneAgent
 * Stores client state and progress locally
 */

const fs = require('fs');
const path = require('path');

class ClientCache {
  constructor(cacheDir = './cache') {
    this.cacheDir = cacheDir;
    this.clientsCache = new Map();
    this.stateFile = path.join(cacheDir, 'state.json');
    
    // Create cache directory
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Load existing state
    this.loadState();
  }
  
  /**
   * Load persistent state from file
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        const state = JSON.parse(data);
        
        // Restore processed clients
        Object.entries(state.processed || {}).forEach(([id, client]) => {
          this.clientsCache.set(id, client);
        });
        
        console.log(`📦 Cache loaded: ${this.clientsCache.size} clients in cache`);
        console.log(`   Last updated: ${state.lastUpdated || 'Never'}`);
      } else {
        console.log('📦 Cache: fresh start (no previous state)');
      }
    } catch (error) {
      console.error('⚠️  Warning loading cache:', error.message);
    }
  }
  
  /**
   * Save state to file
   */
  saveState() {
    try {
      const state = {
        lastUpdated: new Date().toISOString(),
        processed: {}
      };
      
      // Convert Map to JSON
      this.clientsCache.forEach((client, id) => {
        state.processed[id] = client;
      });
      
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
      console.log('✅ Cache state saved');
    } catch (error) {
      console.error('❌ Error saving cache:', error.message);
    }
  }
  
  /**
   * Add client to cache
   */
  set(id, client) {
    // Add metadata
    const cached = {
      ...client,
      cachedAt: new Date().toISOString(),
      status: client.status || 'Not processed'
    };
    
    this.clientsCache.set(id, cached);
    
    // Auto-save every 10 additions
    if (this.clientsCache.size % 10 === 0) {
      this.saveState();
    }
  }
  
  /**
   * Get client from cache
   */
  get(id) {
    return this.clientsCache.get(id);
  }
  
  /**
   * Check if client exists in cache
   */
  has(id) {
    return this.clientsCache.has(id);
  }
  
  /**
   * Update client status
   */
  updateStatus(id, status, metadata = {}) {
    const client = this.clientsCache.get(id);
    if (client) {
      client.status = status;
      client.lastUpdated = new Date().toISOString();
      client = { ...client, ...metadata };
      this.clientsCache.set(id, client);
    }
  }
  
  /**
   * Get all clients
   */
  getAll() {
    return Array.from(this.clientsCache.values());
  }
  
  /**
   * Filter clients by status
   */
  getByStatus(status) {
    return this.getAll().filter(c => c.status === status);
  }
  
  /**
   * Get pending clients (not processed)
   */
  getPending() {
    return this.getByStatus('Not processed');
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const all = this.getAll();
    
    return {
      total: all.length,
      processed: all.filter(c => c.status === 'Called').length,
      pending: all.filter(c => c.status === 'Not processed').length,
      errors: all.filter(c => c.status === 'Error').length,
      byStatus: all.reduce((acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      }, {})
    };
  }
  
  /**
   * Clear cache (reset everything)
   */
  clear() {
    this.clientsCache.clear();
    
    if (fs.existsSync(this.stateFile)) {
      fs.unlinkSync(this.stateFile);
    }
    
    console.log('🗑️  Cache cleared');
  }
  
  /**
   * Print cache statistics
   */
  printStats() {
    const stats = this.getStats();
    
    console.log('\n========================================');
    console.log('📊 CACHE STATISTICS');
    console.log('========================================');
    console.log(`Total clients:    ${stats.total}`);
    console.log(`Processed:       ${stats.processed}`);
    console.log(`Pending:         ${stats.pending}`);
    console.log(`Errors:          ${stats.errors}\n`);
    console.log('By status:');
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    console.log('========================================\n');
  }
  
  /**
   * Get processed IDs (for filtering CSV)
   */
  getProcessedIds() {
    return Array.from(this.clientsCache.keys());
  }
}

module.exports = ClientCache;