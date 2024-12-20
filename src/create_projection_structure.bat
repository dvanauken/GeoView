@echo off
REM Create folder structure for projections module

REM Create main directories
mkdir src\app\projections
mkdir src\app\projections\models
mkdir src\app\projections\models\abstract
mkdir src\app\projections\models\eckert
mkdir src\app\projections\components
mkdir src\app\projections\components\projection-map
mkdir src\app\projections\components\projection-controls
mkdir src\app\projections\services
mkdir src\app\projections\pipes
mkdir src\app\projections\types
mkdir src\app\projections\utils
mkdir src\test

REM Create model files
type nul > src\app\projections\models\abstract\abstract-projection.ts
type nul > src\app\projections\models\abstract\abstract-pseudocylindrical.ts
type nul > src\app\projections\models\abstract\index.ts
type nul > src\app\projections\models\eckert\eckert-i.ts
type nul > src\app\projections\models\eckert\eckert-iv.ts
type nul > src\app\projections\models\eckert\index.ts
type nul > src\app\projections\models\index.ts

REM Create service files
type nul > src\app\projections\services\projection.service.ts
type nul > src\app\projections\services\coordinate.service.ts

REM Create type files
type nul > src\app\projections\types\projection.types.ts
type nul > src\app\projections\types\coordinate.types.ts

REM Create utility files
type nul > src\app\projections\utils\math.utils.ts

REM Create module and index files
type nul > src\app\projections\projections.module.ts
type nul > src\app\projections\index.ts

echo Folder structure created successfully!