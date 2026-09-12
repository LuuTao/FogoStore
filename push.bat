@echo off
chcp 65001 > nul
echo Dang day code Frontend len GitHub...
git add .
set /p msg="Nhap noi dung commit (Enter de de mac dinh): "
if "%msg%"=="" set msg=Auto update frontend: %date% %time%
git commit -m "%msg%"
git push origin main
echo.
echo Da push len GitHub thanh cong!
pause