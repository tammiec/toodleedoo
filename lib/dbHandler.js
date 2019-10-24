module.exports = {
    _DB: null,
    async isRecord(tableName, obj, returnObj = false) {
      console.log('obj', obj);
      try {
      const _query = this.querySelect(tableName, '*', 'AND', obj);
      const res = await this._DB.query(_query.q, _query.v);
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
        const res = await this._DB.query(_query.q, _query.v);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async updateRecord(tableName, update, obj, condition = 'AND') {
      const _query = this.queryUpdate(tableName, update,  condition, obj);
      console.log('_query UPDATE', _query);
      try {
        const res = await this._DB.query(_query.q, _query.v);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async getUserTasks(userId, archived = false) {
      let queryString = `
      SELECT to_do_items.*, categories.key as "key"
      FROM to_do_items
      JOIN categories ON categories.id = to_do_items.category_id
      WHERE user_id = $1
      `;

      //added
      if (archived) {
        queryString += `
        AND status_id = 3
        `;
      } else {
        queryString += `
        AND status_id IN (1,2)
        `;
      }
      //added end

      try {
        const res = await this._DB.query(queryString, [userId]);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async deleteTask(tableName, update, obj, condition = 'AND') {
      const _query = this.queryUpdate(tableName, update,  condition, obj);
      console.log('_query', _query);
      try {
        const res = await this._DB.query(_query.q, _query.v);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async getResources(userId, taskId) {
      const queryString = `
        SELECT resources.id, task_id, array_agg(array[name, link]) as "namelink"
        FROM resources
        JOIN to_do_items ON to_do_items.id = task_id
        WHERE to_do_items.user_id = $1
        AND task_id = $2
        GROUP BY resources.id, task_id;
      `;
      try {
        const res = await this._DB.query(queryString, [userId, taskId]);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    async deleteResource(resourceId) {
      const queryString = `
        DELETE FROM resources
        WHERE id = $1
      `;
      try {
        const res = await this._DB.query(queryString, [resourceId]);
        return res;
      } catch (err) {
        console.error('Error:', err.message);
      }
    },
    queryUpdate(tableName, update, logical, obj) {
      const values = Object.values(update);
      const updateVal = Object.keys(update).map((k, ix) => `${k}=$${ix + 1}`).join(`, `);
      const condition = Object.keys(obj).map((k, ix) => `${k}=$${values.length + ix + 1}`).join(` ${logical} `);
      const conditionValues = Object.values(obj);
      return { q: `UPDATE ${tableName} SET ${updateVal} WHERE ${condition};`, v: [...values, ...conditionValues] };
    },
    queryInsert(tableName, obj) {
      const keys = Object.keys(obj).join(', ');
      const values = Object.values(obj);
      const safeValues = Object.values(obj).map((v, ix) => '$' + (ix + 1)).join(', ');
      return {q:`INSERT INTO ${tableName} (${keys}) VALUES (${safeValues}) RETURNING *;`, v:values};
    },
    querySelect(tableName, filter, logical, obj) {
      const values = Object.values(obj);
      const condition = Object.keys(obj).map((k, ix) => `${k}=$${ix + 1}`).join(` ${logical} `);
      return {q: `SELECT ${filter} FROM ${tableName} WHERE ${condition};`, v: values };
    },
    set db(db) {
      this._DB = db;
    },
};
