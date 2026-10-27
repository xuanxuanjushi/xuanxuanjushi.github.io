@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PORT=5173"

echo.
echo   个人站本地预览  http://localhost:%PORT%/
echo   发布中心        http://localhost:%PORT%/deploy.html
echo   按 Ctrl+C 停止服务
echo.

start "" "http://localhost:%PORT%/"

where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

echo [错误] 未找到 Python。请安装 Python 3，或改用「发布中心 → 选择文件夹」的方式（file:// 下无法载入站内示例）。
pause
