/**
 * 检查数据库中 pdfUrl 的格式问题
 * 用法：node scripts/check-pdf-urls.js
 */

const { Document } = require('../models');

async function checkPdfUrls() {
  console.log('正在检查 pdfUrl 格式...\n');
  
  const docs = await Document.findAll();
  console.log('总文档数:', docs.length);
  console.log('');
  
  let bad = 0;
  let hasChinese = 0;
  
  docs.forEach(d => {
    const url = d.pdfUrl || '';
    const isValidUrl = url.startsWith('http');
    const hasCn = /[\u4e00-\u9fa5]/.test(url);
    
    if (!isValidUrl || hasCn) {
      console.log('【ID:' + d.id + '】' + d.title);
      console.log('  pdfUrl:', url.substring(0, 100));
      if (!isValidUrl) console.log('  ⚠️ 不是有效URL');
      if (hasCn) console.log('  ⚠️ 包含未编码中文');
      console.log('');
      bad++;
    }
    if (hasCn) hasChinese++;
  });
  
  console.log('========================================');
  console.log('检查结果:');
  console.log('  总文档数:', docs.length);
  console.log('  问题数据:', bad, '条');
  console.log('  含中文URL:', hasChinese, '条');
  console.log('========================================');
  
  process.exit(0);
}

checkPdfUrls().catch(err => {
  console.error('检查失败:', err);
  process.exit(1);
});
