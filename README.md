# GeoView

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.15.

Clear-Host; ng build
https://en.wikipedia.org/wiki/Agenda_47
npx prettier --write src/
npx prettier --write src/app/app.component.ts

## Testing
ng test --browsers ChromeHeadless --watch=false
ng test --browsers ChromeHeadless --watch=false --include=**/layer.service.spec.ts

# Regular development testing
npm test

# CI pipeline testing
npm run test:ci

# Local coverage checking
npm run test:coverage

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

_____________.geo-view-container_________________
|                                                 |
| _________   _______.main-content______________  |
||         | | _____________  _  _____________  | |
||         | ||             ||s||             | | |
||         | ||             ||l||             | | |
||         | ||             ||i||             | | |
|| app-    | ||   app-map   ||d||  app-       | | |
||  layers | ||             ||e||  table      | | |
||         | ||             ||r||             | | |
||         | ||_____________||_||_____________| | |
||_________| |__________________________________| |
|_________________________________________________|
|<-100px->| |<-- remaining horizontal space -->|


TODO:
  //Todo
  //-rotation[yaw, pitch, roll], add <-, ->, and shift 
  //-Export -> svg?, PDF
  //-Extent / Level of Detail
  //-Labels (codes)
  //-Table editing
  //-Table
  //--sorting
  //--filtering
  //-Widgets
  //--Roll, pitch, yaw widget
  //--Layer widget
  //-Table
  //--Filter
  //--Sort
  //--Delete existing
  //--Edit existing
  //-Drag-n-drop import
  //-Table for color scheming
  //-Easier route selection
  //-Implement as library
  //-Layer selection
  //-City Editor
  //--C reate
  //--R 
  //--U update / edit
  //--D elete
  //- Dashbaord
  //--Components
  //----tabs
  //----tree
  //--Layer manipulation
  //--JWT
  //--etc.
  //-Security
  //--Authentication
  //----Login
  //----Registration
  //----Forgot
  //--Authorization
  //----Access
  //----Subscription/payment/monetization
  //-Login/Register/Pay/
  //-Versor -- needs improvment
  //-LCC
  //--Test improve parallels



Complete
//-Script tagging.
//-Strokes should remain 1px for every zoom level

## Keyboard Shortcuts for Map Interaction

The following keyboard shortcuts can be used to control the rotation of the map:

- **W**: Increment pitch (tilt up)
- **S**: Decrement pitch (tilt down)
- **A**: Decrement yaw (rotate left)
- **D**: Increment yaw (rotate right)
- **Q**: Decrement roll (rotate counterclockwise)
- **E**: Increment roll (rotate clockwise)
- **R**: Reset rotation to default (0, 0, 0)
- **+**: Zoom In
- **-**: Zoom Out


# Map Projection Series Implementation

This project implements various map projection series, focusing on the Eckert and Wagner families of projections. Each projection makes different trade-offs between preserving various geographic properties.

# Map Projection Series Implementation

This project implements various map projection series, focusing on the Eckert and Wagner families of projections. Each projection makes different trade-offs between preserving various geographic properties.

## Projection Characteristics

| Projection | Equal Area | Pseudocylindrical | Sinusoidal Spacing | Meridians Curved | Equidistant | Compromise | Parallel Latitudes | Symmetric |
|------------|:---------:|:-----------------:|:-----------------:|:---------------:|:-----------:|:----------:|:-----------------:|:---------:|
| Eckert I   |           | X                 |                   |                 | X           |            | X                 | X         |
| Eckert II  |           | X                 |                   | X               | X           |            | X                 | X         |
| Eckert III |           | X                 | X                 | X               |             | X          | X                 | X         |
| Eckert IV  | X         | X                 | X                 | X               |             |            | X                 | X         |
| Eckert V   |           | X                 | X                 | X               |             | X          | X                 | X         |
| Eckert VI  | X         | X                 | X                 | X               |             |            | X                 | X         |
| Wagner I   | X         |                   |                   |                 |             |            | X                 | X         |
| Wagner II  | X         | X                 |                   | X               |             |            | X                 | X         |
| Wagner III | X         | X                 | X                 | X               |             |            | X                 | X         |
| Wagner IV  | X         | X                 |                   | X               |             |            | X                 | X         |
| Wagner V   | X         | X                 | X                 | X               |             |            | X                 | X         |
| Wagner VI  | X         | X                 |                   | X               |             |            | X                 | X         |
| Wagner VII | X         | X                 |                   | X               |             |            | X                 | X         |

## Property Definitions

- **Equal Area**: The projection preserves relative areas across the entire map
- **Pseudocylindrical**: Meridians are curved lines (unlike true cylindrical projections with straight meridians)
- **Sinusoidal Spacing**: Uses sinusoidal functions to determine meridian spacing
- **Meridians Curved**: Whether the meridians appear as curves rather than straight lines
- **Equidistant**: Preserves distances along specific lines (typically parallels)
- **Compromise**: Makes balanced trade-offs between different characteristics
- **Parallel Latitudes**: All parallels of latitude appear as straight, parallel lines
- **Symmetric**: The projection is symmetric about both the equator and central meridian

## Implementation Notes

### Common Characteristics
- All projections in both series maintain parallel latitude lines
- All are symmetric about the equator and central meridian
- The Wagner series consistently preserves area
- Eckert series shows progression from simple (I-II) to complex (IV-VI)

### Planned Class Structure
```python
AbstractProjection
├── AbstractCylindrical
└── AbstractPseudocylindrical
    ├── EckertSeries
    │   ├── EckertI
    │   ├── EckertII
    │   └── ...
    └── WagnerSeries
        ├── WagnerII
        ├── WagnerIII
        └── ...
```

### Key Implementation Considerations
1. Base classes should handle common characteristics:
   - Parallel latitude lines
   - Symmetry about equator and central meridian
   - Basic forward/inverse transformations

2. Specific implementations focus on:
   - Meridian spacing functions
   - Latitude scaling calculations
   - Area preservation where applicable
   - Distance preservation where applicable

## References
- Snyder, J.P., "Map Projections: A Working Manual"
- Wagner, K., "Kartographische Netzentwürfe"
- Eckert, M., "Die Kartenwissenschaft"