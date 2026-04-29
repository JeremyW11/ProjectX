#!/bin/bash
echo "📋 讀取剪貼簿內容..."
pbpaste > /Users/hongyuwu/ProjectX/frontend/data/daily.json

echo "✅ 驗證 JSON 格式..."
if ! node -e "JSON.parse(require('fs').readFileSync('/Users/hongyuwu/ProjectX/frontend/data/daily.json', 'utf8'))"; then
  echo "❌ JSON 格式錯誤，請重新複製內容"
  exit 1
fi

echo "🚀 推送至 GitHub..."
cd /Users/hongyuwu/ProjectX
git add .
git commit -m "brief: $(date +%Y-%m-%d)"
git push

echo "✨ 完成！網站將於 30 秒內自動更新"
