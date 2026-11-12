'use strict';

const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  // "Banco de dados" em memória: suficiente para o foco do projeto (DevOps).
  const tasks = new Map();
  let nextId = 1;

  const findTask = (req) => tasks.get(Number(req.params.id));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tasks', (req, res) => {
    res.json([...tasks.values()]);
  });

  app.post('/tasks', (req, res) => {
    const { title } = req.body || {};
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'O campo "title" é obrigatório.' });
    }
    const task = { id: nextId++, title: title.trim(), done: false };
    tasks.set(task.id, task);
    return res.status(201).json(task);
  });

  app.get('/tasks/:id', (req, res) => {
    const task = findTask(req);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    return res.json(task);
  });

  app.put('/tasks/:id', (req, res) => {
    const task = findTask(req);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });

    const { title, done } = req.body || {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'O campo "title" deve ser um texto não vazio.' });
      }
      task.title = title.trim();
    }
    if (done !== undefined) {
      if (typeof done !== 'boolean') {
        return res.status(400).json({ error: 'O campo "done" deve ser true ou false.' });
      }
      task.done = done;
    }
    return res.json(task);
  });

  app.delete('/tasks/:id', (req, res) => {
    const task = findTask(req);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    tasks.delete(task.id);
    return res.status(204).send();
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON inválido.' });
    }
    return res.status(500).json({ error: 'Erro interno.' });
  });

  return app;
}

module.exports = { createApp };
