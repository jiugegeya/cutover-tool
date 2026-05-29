const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'cutover_db',
  waitForConnections: true,
  connectionLimit: 10
})

async function query(sql) {
  const [rows] = await pool.execute(sql)
  return rows
}

async function createPlan(plan) {
  const fields = Object.keys(plan).filter(k => plan[k] !== undefined)
  const values = fields.map(f => plan[f])
  const sql = `INSERT INTO cutover_plans (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`
  await pool.execute(sql, values)
}

async function updatePlan(id, plan) {
  const fields = Object.keys(plan).filter(k => plan[k] !== undefined)
  const values = fields.map(f => plan[f])
  values.push(id)
  const sql = `UPDATE cutover_plans SET ${fields.map(f => f + '=?').join(',')} WHERE id=?`
  await pool.execute(sql, values)
}

async function deletePlan(id) {
  await pool.execute('DELETE FROM cutover_plans WHERE id=?', [id])
}

async function createRule(rule) {
  const sql = 'INSERT INTO assess_rules (id, name, source, inputType, scoreMap, enumMap, scoreRanges, conditionalRanges, compositeConfig) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  await pool.execute(sql, [rule.id, rule.name, rule.source, rule.inputType, JSON.stringify(rule.scoreMap), JSON.stringify(rule.enumMap), JSON.stringify(rule.scoreRanges), JSON.stringify(rule.conditionalRanges), JSON.stringify(rule.compositeConfig)])
}

async function updateRule(id, rule) {
  const sql = 'UPDATE assess_rules SET name=?, source=?, inputType=?, scoreMap=?, enumMap=?, scoreRanges=?, conditionalRanges=?, compositeConfig=? WHERE id=?'
  await pool.execute(sql, [rule.name, rule.source, rule.inputType, JSON.stringify(rule.scoreMap), JSON.stringify(rule.enumMap), JSON.stringify(rule.scoreRanges), JSON.stringify(rule.conditionalRanges), JSON.stringify(rule.compositeConfig), id])
}

async function deleteRule(id) {
  await pool.execute('DELETE FROM assess_rules WHERE id=?', [id])
}

async function saveAssess(data) {
  const sql = `INSERT INTO assess_results (planId, totalScore, totalExplain, riskLevel, vetoFlag, impactScopeScore, environmentFactorScore, technicalFactorScore, planMaturityScore, ruleResults) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  await pool.execute(sql, [data.planId, data.totalScore, data.totalExplain, data.riskLevel, data.vetoFlag, data.impactScopeScore, data.environmentFactorScore, data.technicalFactorScore, data.planMaturityScore, JSON.stringify(data.ruleResults)])
}

async function getAssess(planId) {
  const [rows] = await pool.execute('SELECT * FROM assess_results WHERE planId=? ORDER BY createdAt DESC', [planId])
  return rows
}

module.exports = { query, createPlan, updatePlan, deletePlan, createRule, updateRule, deleteRule, saveAssess, getAssess }