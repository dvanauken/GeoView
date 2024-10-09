@echo off
setlocal enabledelayedexpansion

:: Generate timestamp in YYYYmmdd-HHmmss format (filename-friendly)
for /f "tokens=2 delims==" %%I in ('wmic OS Get localdatetime /value') do set "datetime=%%I"
set "timestamp=%datetime:~0,4%%datetime:~4,2%%datetime:~6,2%-%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%"

set "output_file=project_summary_%timestamp%.txt"
if exist "%output_file%" del "%output_file%"

:: Print project structure
echo Project Structure:>"%output_file%"
echo.>>"%output_file%"

:: Use dir command to list directories and files, excluding unwanted folders
dir /s /b /a-d | findstr /v /i "\\\.angular\\ \\\.git\\ \\node_modules\\ \\dist\\" > "%temp%\file_list.txt"

:: Process the file list to create a tree-like structure
for /f "tokens=*" %%A in (%temp%\file_list.txt) do (
    set "line=%%A"
    set "line=!line:%CD%=!"
    if "!line:~0,1!"=="\" set "line=!line:~1!"
    echo !line!>>"%output_file%"
)

:: Clean up temporary file
del "%temp%\file_list.txt"

echo.>>"%output_file%"
echo File Contents:>>"%output_file%"
echo.>>"%output_file%"

:: Process src directory and its subdirectories without line breaks
for /r src %%F in (*.js *.ts *.html *.css) do (
    set "file=%%F"
    if "!file:node_modules=!" == "!file!" if "!file:.angular=!" == "!file!" if "!file:dist=!" == "!file!" (
        echo Processing: !file!
        echo !file:%CD%=!>>"%output_file%"
        echo.>>"%output_file%"
        (for /f "usebackq delims=" %%L in ("%%F") do (
            <nul set /p=%%L>>"%output_file%"   :: Write each line without line breaks
        ))
        echo.>>"%output_file%"
        echo ---------------------------------------->>"%output_file%"
        echo.>>"%output_file%"
    )
)

echo.
echo Project summary has been saved to %output_file%
