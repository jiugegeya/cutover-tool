<template>
  <div class="app-container">
    <aside class="app-sidebar" :style="{ width: sidebarWidth }">
      <div class="sidebar-logo">
        <el-icon><Document /></el-icon>
        <span>割接评估工具</span>
      </div>
      <el-menu class="sidebar-menu" :default-active="store.currentPage" @select="onMenuSelect">
        <el-menu-item index="list"><el-icon><List /></el-icon>割接列表</el-menu-item>
        <el-menu-item index="risk"><el-icon><Warning /></el-icon>风险评估</el-menu-item>
        <el-menu-item index="rules"><el-icon><Setting /></el-icon>规则配置</el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-tag size="small">v1.0.0</el-tag>
      </div>
    </aside>
    <div class="app-main-container">
      <header class="app-header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
          <span class="record-count">共 {{ store.records.length }} 条</span>
        </div>
        <div class="header-actions">
          <el-upload v-if="store.currentPage === 'list'" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls" @change="handleImport">
            <template #trigger><el-button type="primary" plain>📥 导入Excel</el-button></template>
          </el-upload>
          <el-button v-if="store.currentPage === 'list'" @click="handleExport">📤 导出Excel</el-button>
        </div>
      </header>
      <main class="app-content">
        <ListView v-if="store.currentPage === 'list'" />
        <EditView v-if="store.currentPage === 'edit'" />
        <RiskView v-if="store.currentPage === 'risk'" />
        <RuleConfigView v-if="store.currentPage === 'rules'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from '@/store/cutover'
import ListView from '@/views/ListView.vue'
import EditView from '@/views/EditView.vue'
import RiskView from '@/views/RiskView.vue'
import RuleConfigView from '@/views/RuleConfigView.vue'
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'
import { Document, List, Warning, Setting } from '@element-plus/icons-vue'

const store = useStore()
const sidebarWidth = '220px'

const pageTitle = computed(() => {
  const map = { list: '割接列表', edit: '编辑割接', risk: '风险评估', rules: '规则配置' }
  return map[store.currentPage] || '割接评估工具'
})

onMounted(async () => {
  await store.loadPlans()
})

function onMenuSelect(key) { store.currentPage = key; store.editIdx = -1 }

async function handleImport(file) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
      if (!json.length) { ElMessage.error('文件中没有数据'); return }
      const records = json.map((row, i) => {
        const clean = store.createEmptyRecord(i + 1)
        Object.keys(row).forEach(key => {
          const t = String(key).trim(); let v = row[key]
          if (v instanceof Date) v = v.toISOString().slice(0, 16).replace('T', ' ')
          if (store.ALL_KEYS.includes(t)) clean[t] = v; else if (t) clean[t] = v
        })
        return clean
      })
      await store.savePlansToDb(records)
      await store.loadPlans()
      ElMessage.success(`成功导入 ${records.length} 条记录`)
    } catch (err) { ElMessage.error('文件解析失败: ' + err.message) }
  }
  reader.readAsArrayBuffer(file.raw)
}

function handleExport() {
  const data = store.records.map(r => {
    const row = {}; store.ALL_KEYS.forEach(k => row[k] = r[k] || ''); row['风险系数'] = r['风险系数'] || ''; row['风险解析'] = r['风险解析'] || ''; return row
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '割接数据')
  XLSX.writeFile(wb, 'cutover_export.xlsx')
  ElMessage.success('导出成功')
}
</script>