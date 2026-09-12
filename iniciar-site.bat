@echo off
title Plano Adaptativo - Servidor Local
cd /d "%~dp0"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8080/api/health' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 goto abrir_site

echo Compilando o projeto Java...
javac -d . com\projeto\pfc\dto\ativ_1409.java com\projeto\pfc\dto\ativ_1409_1.java com\projeto\pfc\service\ativ_1409_2.java com\projeto\pfc\service\LocalhostServer.java
if errorlevel 1 (
    echo.
    echo Nao foi possivel compilar. Verifique se o Java esta instalado.
    pause
    exit /b 1
)

echo Iniciando o servidor em http://localhost:8080/
start "Plano Adaptativo" java -cp . com.projeto.pfc.service.LocalhostServer
timeout /t 2 /nobreak >nul

:abrir_site
start "" "http://localhost:8080/"

echo.
echo Site aberto no navegador.
echo Feche a janela do servidor para encerra-lo.
pause