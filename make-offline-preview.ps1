# 生成「双击即可打开」的离线预览版：预览版/index.html
#
# 做两件事：
#   1. 把 dist/index.html 里的 JS / CSS 内联进同一个文件（浏览器不允许 file:// 加载外部 ES module）
#   2. 把 public/images、favicon.svg 同步过去（预览版/images 必须和 index.html 同级）
#
# 用法（在项目根目录执行，先跑 npm run build）：
#   .\make-offline-preview.ps1
#
# deploy.ps1 会在打包后自动调用本脚本，所以本地预览版始终与线上一致。

param(
  [string]$DistDir,
  [string]$OutDir
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $DistDir) { $DistDir = Join-Path $root "dist" }
if (-not $OutDir) { $OutDir = Join-Path $root "预览版" }

$distHtml = Join-Path $DistDir "index.html"
if (-not (Test-Path $distHtml)) { throw "找不到 $distHtml，请先执行 npm run build" }

$html = [IO.File]::ReadAllText($distHtml, [Text.Encoding]::UTF8)

# --- 内联 JS ---
$scriptRx = [regex]'<script[^>]*src="\./(assets/[^"]+\.js)"[^>]*></script>'
$m = $scriptRx.Match($html)
if (-not $m.Success) { throw "dist/index.html 里没找到 src=./assets/*.js 的 script 标签" }
$jsPath = Join-Path $DistDir $m.Groups[1].Value
$jsBody = [IO.File]::ReadAllText($jsPath, [Text.Encoding]::UTF8)
if ($jsBody.Contains('</script>')) { throw "JS 里含有 </script>，无法安全内联" }
$html = $html.Substring(0, $m.Index) + '<script type="module">' + $jsBody + '</script>' + $html.Substring($m.Index + $m.Length)

# --- 内联 CSS ---
$cssRx = [regex]'<link[^>]*href="\./(assets/[^"]+\.css)"[^>]*>'
$m = $cssRx.Match($html)
if (-not $m.Success) { throw "dist/index.html 里没找到 href=./assets/*.css 的 link 标签" }
$cssBody = [IO.File]::ReadAllText((Join-Path $DistDir $m.Groups[1].Value), [Text.Encoding]::UTF8)
$html = $html.Substring(0, $m.Index) + '<style>' + $cssBody + '</style>' + $html.Substring($m.Index + $m.Length)

# --- 去掉不再需要的 modulepreload / crossorigin 残留提示 ---
$html = $html.Replace(' crossorigin', '')

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }
[IO.File]::WriteAllText((Join-Path $OutDir "index.html"), $html, (New-Object Text.UTF8Encoding $false))

# --- 图片与 favicon ---
$imgSrc = Join-Path $root "public\images"
$imgDst = Join-Path $OutDir "images"
if (-not (Test-Path $imgDst)) { New-Item -ItemType Directory -Path $imgDst -Force | Out-Null }
robocopy $imgSrc $imgDst /MIR /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "复制 images 失败（robocopy $LASTEXITCODE）" }
$script:LASTEXITCODE = 0

$fav = Join-Path $root "public\favicon.svg"
if (Test-Path $fav) { Copy-Item $fav (Join-Path $OutDir "favicon.svg") -Force }

$outFile = Join-Path $OutDir "index.html"
$sizeKB = [math]::Round((Get-Item $outFile).Length / 1KB)
$imgCount = (Get-ChildItem $imgDst -File).Count
Write-Host "离线预览版已更新：$outFile（$sizeKB KB，内联 JS+CSS；图片 $imgCount 张）" -ForegroundColor Green

exit 0
