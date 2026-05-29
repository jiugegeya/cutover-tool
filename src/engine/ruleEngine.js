/**
 * 评估规则引擎
 */

export function calcRuleScore(rule, val) {
  if (val === '' || val === undefined || val === null) return 0

  if (rule.compositeConfig) {
    if (typeof val === 'object' && val.primaryValue !== undefined) {
      const config = rule.compositeConfig
      if (val.primaryValue === config.primaryValueForZero) return 0
      if (val.secondaryValue !== undefined && val.secondaryValue !== null && val.secondaryValue !== '') {
        const n = parseFloat(val.secondaryValue)
        if (!isNaN(n)) {
          for (const range of config.ranges) {
            const match = range.condition.match(/^(<=|>|=)?(.*)$/)
            const op = match?.[1] || '<='
            const threshold = parseFloat(match?.[2] || 0)
            if (op === '<=' && n <= threshold) return Math.round(config.baseScore * range.weight * 10) / 10
            if (op === '>' && n > threshold) return Math.round(config.baseScore * range.weight * 10) / 10
            if (op === '=' && n === threshold) return Math.round(config.baseScore * range.weight * 10) / 10
          }
        }
      }
    }
    return 0
  }

  if (rule.conditionalRanges && rule.conditionalRanges.length > 0) {
    if (typeof val === 'object' && val.condition && val.value !== undefined) {
      const conditionOption = rule.conditionalRanges.find(c => c.value === val.condition)
      if (conditionOption && conditionOption.ranges) {
        const n = parseFloat(val.value)
        if (!isNaN(n)) {
          for (const range of conditionOption.ranges) {
            const match = range.condition.match(/^(<=|>|=)?(.*)$/)
            const op = match?.[1] || '<='
            const threshold = parseFloat(match?.[2] || 0)
            if (op === '<=' && n <= threshold) return range.score
            if (op === '>' && n > threshold) return range.score
            if (op === '=' && n === threshold) return range.score
          }
        }
      }
    }
    return 0
  }

  if (rule.scoreMap && Object.keys(rule.scoreMap).length > 0) {
    const s = rule.scoreMap[val]
    if (s !== undefined) return s
  }

  if (rule.enumMap) {
    if (rule.enumMap[val] !== undefined) return typeof rule.enumMap[val] === 'object' ? rule.enumMap[val].score : rule.enumMap[val]
    if (rule.enumMap['default'] !== undefined) return typeof rule.enumMap['default'] === 'object' ? rule.enumMap['default'].score : rule.enumMap['default']
  }

  if (rule.scoreRanges && rule.scoreRanges.length > 0) {
    const n = parseFloat(val)
    if (isNaN(n)) return 0
    for (const range of rule.scoreRanges) {
      const match = range.condition.match(/^(<=|>|=)?(.*)$/)
      const op = match?.[1] || '<='
      const threshold = parseFloat(match?.[2] || 0)
      if (op === '<=' && n <= threshold) return range.score
      if (op === '>' && n > threshold) return range.score
      if (op === '=' && n === threshold) return range.score
    }
  }

  return 0
}