/**
 * 修复数据库中 pdfUrl 的中文编码问题
 * 用法：node scripts/fix-pdf-urls.js
 */

const { Document } = require('../models');

async function fixPdfUrls() {
  console.log('开始检查 pdfUrl...\n');
  
  const docs = await Document.findAll();
  let fixed = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const doc of docs) {
    const oldUrl = doc.pdfUrl;
    
    // 跳过空链接或非 COS 链接
    if (!oldUrl || !oldUrl.includes('image.qqe4.com')) {
      skipped++;
      continue;
    }
    
    try {
      // 解析 URL
      const urlObj = new URL(oldUrl);
      const pathname = urlObj.pathname;
      
      // 检查是否包含未编码的中文字符
      const hasChinese = /[\u4e00-\u9fa5]/.test(pathname);
      if (!hasChinese) {
        skipped++;
        continue;
      }
      
      // 对路径分段编码（先 decode 再 encode，避免重复编码）
      const encodedPath = pathname
        .split('/')
        .map(seg => {
          try {
            // 如果已经编码过，先解码再重新编码
            const decoded = decodeURIComponent(seg);
            return encodeURIComponent(decoded);
          } catch {
            // 解码失败，直接编码
            return encodeURIComponent(seg);
          }
        })
        .join('/');
      
      // 构建新 URL
      const newUrl = oldUrl.replace(pathname, encodedPath);
      
      if (newUrl !== oldUrl) {
        await doc.update({ pdfUrl: newUrl });
        console.log(`✅ 已修复 [ID:${doc.id}] ${doc.title}`);
        console.log(`   旧: ${oldUrl}`);
        console.log(`   新: ${newUrl}\n`);
        fixed++;
      } else {
        skipped++;
      }
    } catch (e) {
      console.error(`❌ 跳过 [ID:${doc.id}] ${doc.title}: ${e.message}`);
      errors++;
    }
  }
  
  console.log('\n========================================');
  console.log(`处理完成！`);
  console.log(`  已修复: ${fixed} 条`);
  console.log(`  跳过: ${skipped} 条`);
  console.log(`  错误: ${errors} 条`);
  console.log('========================================');
  
  process.exit(0);
}

// 先显示预览模式
async function preview() {
  console.log('【预览模式】以下数据将被修复：\n');
  
  const docs = await Document.findAll();
  let count = 0;
  
  for (const doc of docs) {
    const oldUrl = doc.pdfUrl;
    if (!oldUrl || !oldUrl.includes('image.qqe4.com')) continue;
    
    try {
      const urlObj = new URL(oldUrl);
      const hasChinese = /[\u4e00-\u9fa5]/.test(urlObj.pathname);
      if (!hasChinese) continue;
      
      console.log(`[ID:${doc.id}] ${doc.title}`);
      console.log(`  ${oldUrl}\n`);
      count++;
    } catch {}
  }
  
  console.log(`共 ${count} 条数据需要修复\n`);
  return count;
}

// 主逻辑
(async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--preview') || args.includes('-p')) {
    // 预览模式
    await preview();
    process.exit(0);
  }
  
  if (args.includes('--force') || args.includes('-f')) {
    // 强制执行修复
    await fixPdfUrls();
  } else {
    // 默认先预览
    const count = await preview();
    if (count > 0) {
      console.log('确认修复请执行：node scripts/fix-pdf-urls.js --force');
    } else {
      console.log('没有需要修复的数据');
    }
    process.exit(0);
  }
})();
