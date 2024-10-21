@echo off
setlocal enabledelayedexpansion

:: Check if help is requested or if arguments are missing
if "%~1"=="?" goto :usage
if "%~1"=="" goto :usage
if "%~2"=="" goto :usage

set "TAG_NAME=%~1"
set "TAG_MESSAGE=%~2"

:: Display confirmation
echo Tag Name: %TAG_NAME%
echo Tag Message: %TAG_MESSAGE%
set /p CONFIRM="Do you want to proceed? (YES/NO): "

if /i "%CONFIRM%" neq "YES" (
    echo Operation cancelled.
    exit /b 1
)

:: Create and push the tag
git tag -a %TAG_NAME% -m "%TAG_MESSAGE%" 2>error.txt
if %errorlevel% neq 0 (
    echo Failed to create tag.
    type error.txt
    del error.txt
    exit /b 1
)

git push origin %TAG_NAME% 2>error.txt
if %errorlevel% neq 0 (
    echo Failed to push tag.
    type error.txt
    del error.txt
    exit /b 1
)

echo Tag %TAG_NAME% has been successfully created and pushed.
exit /b 0

:usage
echo Usage: tag-version.bat ^<tag_name^> ^<tag_message^>
echo Example: tag-version.bat v1.0.0 "Initial release"
exit /b 1
