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
  //-rotation[yaw, pitch, roll];
  //--yaw = rotation[0];
  //--pitch = rotation[1];
  //--roll = rotation[2];
  //-Export -> svg?, PDF
  //-Extent
  //-Labels (codes)
  //-Table editing
  //-Table
  //--sorting
  //--filtering
  //-Widgets
  //--Roll, pitch, yaw widget
  //--Layer widget
  //-Level of Detail

Complete
//-Script tagging.
//-Strokes should remain 1px for every zoom level
