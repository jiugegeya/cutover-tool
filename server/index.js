const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

// 获取所有割接计划
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await db.query('SELECT * FROM cutover_plans ORDER BY id DESC')
    res.json(plans)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 批量创建割接计划
app.post('/api/plans/batch', async (req, res) => {
  try {
    const records = req.body
    for (const rec of records) {
      await db.createPlan(rec)
    }
    res.json({ success: true, count: records.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 更新割接计划
app.put('/api/plans/:id', async (req, res) => {
  try {
    await db.updatePlan(req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 删除割接计划
app.delete('/api/plans/:id', async (req, res) => {
  try {
    await db.deletePlan(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 获取所有规则
app.get('/api/rules', async (req, res) => {
  try {
    const rules = await db.query('SELECT * FROM assess_rules ORDER BY id')
    res.json(rules)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 创建规则
app.post('/api/rules', async (req, res) => {
  try {
    await db.createRule(req.body)
    const rules = await db.query('SELECT * FROM assess_rules ORDER BY id')
    res.json(rules)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 更新规则
app.put('/api/rules/:id', async (req, res) => {
  try {
    await db.updateRule(req.params.id, req.body)
    const rules = await db.query('SELECT * FROM assess_rules ORDER BY id')
    res.json(rules)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 删除规则
app.delete('/api/rules/:id', async (req, res) => {
  try {
    await db.deleteRule(req.params.id)
    const rules = await db.query('SELECT * FROM assess_rules ORDER BY id')
    res.json(rules)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 保存评估结果
app.post('/api/assess', async (req, res) => {
  try {
    await db.saveAssess(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 获取评估结果
app.get('/api/assess/:planId', async (req, res) => {
  try {
    const results = await db.getAssess(req.params.planId)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log('Server running on port 3000'))