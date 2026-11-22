# RYH-Intro 一键发布到 GitHub Pages
#
# 用法（在项目根目录执行）：
#   .\deploy.ps1
#
# 做三件事：
#   1. npm run build            -> 重新打包到 dist/
#   2. 把 dist/ 同步到部署目录 ../ryh-intro-deploy 并提交（gh-pages 分支内容）
#   3. 推送 main（源码）与 gh-pages（打包产物）到 origin
#
# 首次使用前先绑好远端（只做一次）：
#   git remote add origin https://github.com/<你的用户名>/ryh-intro.git

param(
  [string]$Remote = "",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$deployDir = Join-Path (Split-Path $root -Parent) "ryh-intro-deploy"

Set-Location $root

if (-not $Remote) {
  $Remote = (git remote get-url origin 2>$null)
  if (-not $Remote) { throw "没有配置 origin 远端，请先执行：git remote add origin https://github.com/<用户名>/ryh-intro.git" }
}

if (-not $SkipBuild) {
  Write-Host "==> 打包" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "构建失败" }
}

Write-Host "==> 同步打包产物到部署仓库" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $deployDir ".git"))) {
  New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
  Set-Location $deployDir
  git init -q -b gh-pages
  Set-Location $root
}

# /MIR 镜像同步，但排除 .git 目录，避免把版本库删掉
robocopy (Join-Path $root "dist") $deployDir /MIR /XD ".git" /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "复制 dist 到部署目录失败" }

Set-Location $deployDir
if (-not (Test-Path ".nojekyll")) { New-Item -ItemType File -Path ".nojekyll" -Force | Out-Null }
git add -A
$changes = git status --porcelain
if ($changes) {
  git commit -q -m ("Deploy: " + (Get-Date -Format "yyyy-MM-dd HH:mm"))
} else {
  Write-Host "打包产物没有变化，跳过部署提交" -ForegroundColor DarkGray
}
git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) { git remote add origin $Remote }
git push origin gh-pages --force

Set-Location $root
Write-Host "==> 推送源码 main" -ForegroundColor Cyan
git push origin main

Write-Host "完成。Pages 地址：https://<用户名>.github.io/ryh-intro/" -ForegroundColor Green
