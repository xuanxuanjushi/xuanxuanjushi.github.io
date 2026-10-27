@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PORT=5173"

echo.
echo   个人站本地预览  http://127.0.0.1:%PORT%/
echo   发布中心        http://127.0.0.1:%PORT%/deploy.html
echo   按 Ctrl+C 停止服务
echo.
echo   注意：如果浏览器打不开并报 502 / 无法连接，是系统代理接管了 localhost。
echo   两个办法：① 直接用 127.0.0.1 访问（下方已自动打开）
echo             ② 在代理软件里把 localhost,127.0.0.1,::1 加入直连/绕过列表
echo.

start "" "http://127.0.0.1:%PORT%/"

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 0.0.0.0
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT% --bind 0.0.0.0
  goto :eof
)

echo [错误] 未找到 Python。请安装 Python 3，或改用「发布中心 → 选择文件夹」的方式（file:// 下无法载入站内示例）。
pause
