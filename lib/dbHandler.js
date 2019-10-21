module.exports = {
    DB: null,
    async isRecord(tableName, obj, returnObj = false) {
      try {
      const condition = Object.keys(obj).map(k => `${k}='${obj[k]}'`).join(` AND `);
      const query = `SELECT * FROM ${tableName} WHERE ${condition}`;
      const res = await this.DB.query(query);
      if (!returnObj) return res.rows.length > 0;
      else if(res.rows.length > 0) return res.rows[0];
      else return null;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async insertRecord(tableName, obj) {
      const _query = this.queryInsert(tableName, obj);
      try {
        const res = await this.DB.query(_query);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async updateRecord(tableName, update, obj, condition = 'AND') {
      const _query = this.queryUpdate(tableName, update,  condition, obj);
      try {
        const res = await this.DB.query(_query);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async getUserTasks(tableName, filter, userId, obj) {
      const _query = this.querySelect(tableName, )
    },
    queryUpdate(tableName, update, logical, obj) {
      console.log({tableName, update, logical, obj});
      const updateVal = Object.keys(update).map(k => `${k}='${update[k]}'`).join(`,`);
      const condition = Object.keys(obj).map(k => `${k}='${obj[k]}'`).join(` ${logical} `);
      return `UPDATE ${tableName} SET ${updateVal} WHERE ${condition};`;
    },
    queryInsert(tableName, obj) {
      const keys = Object.keys(obj).join(',');
      const values = Object.values(obj).map(v => `'${v}'`).join(',');
      return `INSERT INTO ${tableName} (${keys}) VALUES (${values});`;
    },
    querySelect(tableName, filter, logical, obj) {
      const condition = Object.keys(obj).map(k => `${k}='${obj[k]}'`).join(` ${logical} `);
      return `SELECT ${filter} FROM ${tableName} WHERE ${condition};`;
    },
    set db(db) {
      this.DB = db;
    }
};
