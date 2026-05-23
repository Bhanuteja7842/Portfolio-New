@echo off
echo ===================================================
echo   Gundeti Bhanuteja - Portfolio GitHub Deployer
echo ===================================================
echo.
echo This script will initialize Git, commit all files,
echo and push your updated portfolio and projects to:
echo https://github.com/Bhanuteja7842/Bhanuteja72
echo.
echo Press any key to begin...
pause > nul

echo.
echo [1/6] Initializing local Git repository...
git init

echo.
echo [2/6] Staging all files...
git add .

echo.
echo [3/6] Committing changes...
git commit -m "Integrate portfolio updates and 5 working projects"

echo.
echo [4/6] Setting default branch to main...
git branch -M main

echo.
echo [5/6] Configuring remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/Bhanuteja7842/Bhanuteja72.git

echo.
echo [6/6] Pushing files to GitHub...
echo (If prompted, please authenticate in your browser or enter your credentials)
git push -u origin main --force

echo.
echo ===================================================
echo   Deployment completed! Your site should be live on
echo   https://bhanuteja7842.github.io/Bhanuteja72/ soon.
echo ===================================================
pause
