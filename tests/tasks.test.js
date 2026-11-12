'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');

describe('API de tarefas', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /tasks começa vazio', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /tasks cria uma tarefa', async () => {
    const res = await request(app).post('/tasks').send({ title: '  Estudar DevOps  ' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, title: 'Estudar DevOps', done: false });
  });

  test('POST /tasks sem título retorna 400', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });

  test('POST /tasks com JSON inválido retorna 400', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{ invalido');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('JSON inválido.');
  });

  test('GET /tasks/:id retorna a tarefa criada', async () => {
    await request(app).post('/tasks').send({ title: 'Criar pipeline' });
    const res = await request(app).get('/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Criar pipeline');
  });

  test('GET /tasks/:id inexistente retorna 404', async () => {
    const res = await request(app).get('/tasks/99');
    expect(res.status).toBe(404);
  });

  test('PUT /tasks/:id atualiza título e status', async () => {
    await request(app).post('/tasks').send({ title: 'Escrever Terraform' });
    const res = await request(app).put('/tasks/1').send({ title: 'Revisar Terraform', done: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'Revisar Terraform', done: true });
  });

  test('PUT /tasks/:id com dados inválidos retorna 400', async () => {
    await request(app).post('/tasks').send({ title: 'Tarefa' });
    const badTitle = await request(app).put('/tasks/1').send({ title: '' });
    const badDone = await request(app).put('/tasks/1').send({ done: 'sim' });
    expect(badTitle.status).toBe(400);
    expect(badDone.status).toBe(400);
  });

  test('PUT /tasks/:id inexistente retorna 404', async () => {
    const res = await request(app).put('/tasks/5').send({ done: true });
    expect(res.status).toBe(404);
  });

  test('DELETE /tasks/:id remove a tarefa', async () => {
    await request(app).post('/tasks').send({ title: 'Remover' });
    const del = await request(app).delete('/tasks/1');
    const after = await request(app).get('/tasks/1');
    expect(del.status).toBe(204);
    expect(after.status).toBe(404);
  });

  test('DELETE /tasks/:id inexistente retorna 404', async () => {
    const res = await request(app).delete('/tasks/7');
    expect(res.status).toBe(404);
  });

  test('rota desconhecida retorna 404', async () => {
    const res = await request(app).get('/nada');
    expect(res.status).toBe(404);
  });
});
