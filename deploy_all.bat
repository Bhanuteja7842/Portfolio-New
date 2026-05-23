@echo off
setlocal enabledelayedexpansion
echo ===================================================
echo   Gundeti Bhanuteja - Multi-Repository Deployer
echo ===================================================
echo.
echo This script will push each project directory to its own separate repository
echo on GitHub, and then push the main portfolio (including the projects folder)
echo to your main Bhanuteja72 repository.
echo.
echo Targets:
echo 1. projects/calculator         -> https://github.com/Bhanuteja7842/calculator
echo 2. projects/todo               -> https://github.com/Bhanuteja7842/todo-app
echo 3. projects/weather            -> https://github.com/Bhanuteja7842/weather-app
echo 4. projects/chatbot            -> https://github.com/Bhanuteja7842/ai-chatbot
echo 5. projects/student-management -> https://github.com/Bhanuteja7842/student-management
echo 6. Root Portfolio (all files)  -> https://github.com/Bhanuteja7842/Bhanuteja72
echo.
echo Press any key to start deploying...
pause > nul

:: Save the root workspace directory
set "ROOT_DIR=%~dp0"

:: Define projects config
set "p1_dir=projects\calculator"
set "p1_repo=calculator"
set "p1_msg=Initialize Calculator App with scientific mode"

set "p2_dir=projects\todo"
set "p2_repo=todo-app"
set "p2_msg=Initialize TaskFlow To-Do App with local persistence"

set "p3_dir=projects\weather"
set "p3_repo=weather-app"
set "p3_msg=Initialize Weather Dashboard App with OpenWeather support"

set "p4_dir=projects\chatbot"
set "p4_repo=ai-chatbot"
set "p4_msg=Initialize local Aether AI Chatbot"

set "p5_dir=projects\student-management"
set "p5_repo=student-management"
set "p5_msg=Initialize Student Management CRUD dashboard"

for %%i in (1 2 3 4 5) do (
    set "sub_dir=!p%%i_dir!"
    set "repo_name=!p%%i_repo!"
    set "commit_msg=!p%%i_msg!"
    
    echo.
    echo ===================================================
    echo  [%%i/6] DEPLOYING !repo_name!
    echo ===================================================
    echo Path: %ROOT_DIR%!sub_dir!
    
    cd /d "%ROOT_DIR%!sub_dir!"
    
    echo.
    echo [*] Initializing Git...
    git init
    
    echo [*] Staging files...
    git add .
    
    echo [*] Committing...
    git commit -m "!commit_msg!"
    
    echo [*] Setting main branch...
    git branch -M main
    
    echo [*] Configuring remote origin...
    git remote remove origin 2>nul
    git remote add origin https://github.com/Bhanuteja7842/!repo_name!.git
    
    echo [*] Pushing to GitHub...
    git push -u origin main --force
)

echo.
echo ===================================================
echo  [6/6] DEPLOYING MAIN PORTFOLIO (Bhanuteja72)
echo ===================================================
echo Path: %ROOT_DIR%
cd /d "%ROOT_DIR%"

echo.
echo [*] Initializing Git...
git init

echo [*] Staging all files...
git add .

echo [*] Committing...
git commit -m "Integrate portfolio updates and 5 working projects"

echo [*] Setting main branch...
git branch -M main

echo [*] Configuring remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/Bhanuteja7842/Bhanuteja72.git

echo [*] Pushing to GitHub...
git push -u origin main --force

echo.
echo ===================================================
echo   SUCCESS: All 6 repositories successfully deployed!
echo ===================================================
pause
