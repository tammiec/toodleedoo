/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (dbHandler) => {
  router.get("/", async(req, res) => {
    let archived = req.query.archived;
    console.log('ARCHIVED', archived);
    let tasks;
    if (archived) {
      try {
        tasks = await dbHandler.getUserTasks(res.locals.user.id, true);
        res.send(tasks.rows);
      } catch (err) {
        console.log('Error', err.message);
      }
    } else {
      try {
        tasks = await dbHandler.getUserTasks(res.locals.user.id);
        res.send(tasks.rows);
      } catch (err) {
        console.log('Error:', err.message);
      }
    }
  });
  router.put('/delete', async(req, res) => {
    try {
      const taskId = req.query.taskId;
      await dbHandler.deleteTask('to_do_items', { status_id: 3 }, { id: taskId });
      res.send(true);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  router.put('/update', async(req, res) => {
    const key = req.query.catKey;
    const taskId = req.query.taskId;
    const important = req.query.important;
    const taskName = req.query.taskName;
    const taskDesc = req.query.taskDesc;
    console.log(req.query);
    let obj;

    try {
      if (key) {
        const cat = await dbHandler.isRecord('categories', { key }, true);
        obj = { category_id: cat.id };
      } else if (important) {
        obj = { important: important };
      } else if (taskName && taskDesc) {
        obj = { title: taskName, description: taskDesc };
      } else {
        const toDo = await dbHandler.isRecord('to_do_items', { id: taskId }, true);
        let newStatus = (toDo.status_id === 1) ? 2 : 1;
        obj = { status_id: newStatus };
      }

      await dbHandler.updateRecord('to_do_items', obj, { id: taskId });
      console.log('SOMETHING', await dbHandler.isRecord('to_do_items', { id: taskId }, true));
      res.send(true);
    } catch (err) {
      console.error(err);
    }
  });

  // Gets all resources for tasks owned by current user
  router.get('/resources', async(req, res) => {
    const taskId = req.query.taskId;
    try {
      const resources = await dbHandler.getResources(res.locals.user.id, taskId);
      res.send(resources.rows);
      console.log(resources.rows)
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  // Creates a new resource for that task
  router.post('/resources', async(req, res) => {
    const taskId = req.query.taskId;
    const name = req.query.resourceName;
    const link = req.query.resourceLink;
    console.log('posting');
    try {
      const resource = await dbHandler.insertRecord('resources', {
        task_id: taskId,
        name: name,
        link: link
      });
      res.json(resource);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });

  // Creates a new resource for that task
  router.delete('/resources', async(req, res) => {
    const resourceId = req.query.resourceId
    try {
      await dbHandler.deleteResource(resourceId);
      res.send(true);
    } catch (err) {
      console.log('Error:', err.message);
    }
  });
  return router;
};
