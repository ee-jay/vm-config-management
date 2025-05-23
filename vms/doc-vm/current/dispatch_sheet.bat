@echo off
setlocal enabledelayedexpansion

set "MAIN_DIRECTORY=C:\Users\ESTL-BO-2\Ee-Jay Dropbox\Back Office\Dispatch-ESTL&MSP Shared Docs\Archive - Dispatch Sheets & Transfer Book\ESTL\Dispatch Sheet"

:: Loop through all files in the directory and subdirectories
for /r "%MAIN_DIRECTORY%" %%F in (*) do (
    :: Get the file path, name, and extension
    set "filepath=%%~dpF"
    set "filename=%%~nF"
    set "extension=%%~xF"
    
    :: Only rename if the file doesn't already have " - Dispatch Sheet" in its name
    echo !filename! | findstr /i " - Dispatch Sheet" >nul
    if errorlevel 1 (
        ren "%%F" "!filename! - Dispatch Sheet!extension!"
    )
)

echo Renaming complete.
pause 