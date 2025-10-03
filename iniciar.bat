@echo off
echo.
echo ========================================
echo   🏛️  LABIRINTO DE CRETA  🏛️
echo     O Desafio do Minotauro
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo    Instale Python para executar o servidor.
    echo    https://python.org/downloads
    pause
    exit /b 1
)

REM Verificar estrutura de arquivos
if not exist "js\game.js" (
    echo ❌ Arquivos do jogo não encontrados!
    echo    Verifique se está no diretório correto.
    pause
    exit /b 1
)

echo ✅ Verificações passou!
echo.
echo 🚀 Iniciando servidor web local...
echo    Porta: 8080
echo    URL: http://localhost:8080
echo.
echo 💡 Dicas:
echo    - Use Ctrl+C para parar o servidor
echo    - Mantenha esta janela aberta
echo    - Acesse o jogo no navegador
echo.

REM Tentar abrir o navegador automaticamente
timeout /t 2 /nobreak >nul
start http://localhost:8080

REM Iniciar servidor Python
python -m http.server 8080