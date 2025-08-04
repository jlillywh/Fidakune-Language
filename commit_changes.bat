@echo off
echo Committing Fidakune vocabulary expansion and launch preparation...

cd "c:\Users\JasonLillywhite\OneDrive - GoldSim\Python\Fidakune-Language"

git add .

git commit -m "Expand vocabulary to 50 words and add launch materials - Expand lexicon.json from 15 to 50 words across 8 semantic domains - Update LEXICON.md with complete 50-word table and domain distribution - Add ANNOUNCEMENT.md with launch templates for X, Reddit, forums - Update Fidakune_Launch_ToDo.markdown to mark tasks complete - Phase 3 Progress: 4/6 tasks complete (67%)"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done! Check your repository at: https://github.com/jlillywh/Fidakune-Language
pause
