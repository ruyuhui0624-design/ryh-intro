# RYH-Intro 一键发布（本地改 → 构建 → 刷新离线预览版 → 部署到 GitHub Pages）
#
# 用法（在项目根目录执行）：
#   .\deploy.ps1
#   .\deploy.ps1 -SkipBuild              # 只同步已有的 dist
#   .\deploy.ps1 -Messages "改了什么"     # 给部署提交附一句说明
#
# 流程：
#   1. npm run build                 -> 重新打包到 dist/
#   2. make-offline-preview.ps1      -> 刷新「预览版/index.html」（双击可看，与线上一致）
#   3. robocopy dist -> ../ryh-intro-deploy 并提交（gh-pages 分支内容）
#   4. 推送 gh-pages（force）与 main（源码），失败自动重试（GitHub 的 443 经常抖动）
#
# 首次使用前先绑好远端（只做一次）：
#   git remote add origin https://github.com/<你的用户名>/ryh-intro.git

param(
  [string]$Remote = "",
  [switch]$SkipBuild,
  [string]$Messages = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$deployDir = Join-Path (Split-Path $root -Parent) "ryh-intro-deploy"
Set-Location $root

# --- 找 git：PATH 里没有就用 TortoiseGit / Git for Windows 自带的 ---
function Resolve-Git {
  $cmd = Get-Command git -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($p in @("D:\Git\cmd\git.exe", "C:\Program Files\Git\cmd\git.exe", "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe")) {
    if (Test-Path $p) { return $p }
  }
  throw "没找到 git.exe，请安装 Git 或把 D:\Git\cmd 加进 PATH"
}
$git = Resolve-Git

function Invoke-GitPush([string]$branch, [switch]$Force) {
  $argv = @("push", "origin", $branch)
  if ($Force) { $argv += "--force" }
  for ($i = 1; $i -le 6; $i++) {
    $out = & $git @argv 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Host "   [$branch] 第 $i 次推送成功" -ForegroundColor Green
      if ($out) { $out | Select-Object -Last 2 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray } }
      return
    }
    $last = ($out | Select-Object -Last 1) -replace '\s+', ' '
    Write-Host "   [$branch] 第 $i 次失败，8 秒后重试：$last" -ForegroundColor Yellow
    Start-Sleep -Seconds 8
  }
  throw "$branch 连续 6 次推送失败，检查网络 / hosts / gh 授权"
}

if (-not $Remote) {
  $Remote = (& $git remote get-url origin 2>$null)
  if (-not $Remote) { throw "没有配置 origin 远端，请先执行：git remote add origin https://github.com/<用户名>/ryh-intro.git" }
}

# --- 1. 构建 ---
if (-not $SkipBuild) {
  Write-Host "==> 1/4 打包" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "构建失败" }
} else {
  Write-Host "==> 1/4 跳过打包" -ForegroundColor DarkGray
}

# --- 2. 刷新离线预览版：保证本地文件就是最新版 ---
Write-Host "==> 2/4 刷新离线预览版（预览版/index.html）" -ForegroundColor Cyan
& (Join-Path $root "make-offline-preview.ps1") -DistDir (Join-Path $root "dist") -OutDir (Join-Path $root "预览版")
if ($LASTEXITCODE -ne 0) { throw "生成离线预览版失败" }

# --- 3. 同步产物到部署仓库 ---
Write-Host "==> 3/4 同步打包产物到部署仓库" -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $deployDir ".git"))) {
  New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
  Set-Location $deployDir
  & $git init -q -b gh-pages
  Set-Location $root
}

# /MIR 镜像同步，但排除 .git 目录，避免把版本库删掉
robocopy (Join-Path $root "dist") $deployDir /MIR /XD ".git" /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "复制 dist 到部署目录失败" }

Set-Location $deployDir
if (-not (Test-Path ".nojekyll")) { New-Item -ItemType File -Path ".nojekyll" -Force | Out-Null }
& $git add -A
$changes = & $git status --porcelain
if ($changes) {
  $msg = "Deploy: " + (Get-Date -Format "yyyy-MM-dd HH:mm")
  if ($Messages) { $msg += " - " + $Messages }
  & $git commit -q -m $msg
} else {
  Write-Host "   打包产物没有变化，跳过部署提交" -ForegroundColor DarkGray
}
& $git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) { & $git remote add origin $Remote }
Invoke-GitPush -branch "gh-pages" -Force

# --- 4. 推送源码 main ---
Set-Location $root
Write-Host "==> 4/4 推送源码 main" -ForegroundColor Cyan
Invoke-GitPush -branch "main"

Write-Host ""
Write-Host "完成。线上：https://ruyuhui0624-design.github.io/ryh-intro/" -ForegroundColor Green
Write-Host "本地双击预览：预览版/index.html（已与本次构建同步）" -ForegroundColor DarkGray
Write-Host "约 1 分钟后可查：gh api repos/ruyuhui0624-design/ryh-intro/pages/builds/latest --jq .status" -ForegroundColor DarkGray

exit 0
