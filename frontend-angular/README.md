# FrontendAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.14.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

> **Note — this app uses zone.js (not zoneless).** `@fullcalendar/angular` calls
> `ChangeDetectorRef.detectChanges()` during its render lifecycle and is not
> zoneless-compatible, so the app runs with `zone.js` (configured via
> `provideZoneChangeDetection` in `src/app/app.config.ts` and the `polyfills` in
> `angular.json`). Components still use signals. Do not remove zone.js / switch
> to zoneless without first replacing the FullCalendar Angular wrapper, or the
> calendar page will throw an endless `NG0100` error. Changing `angular.json`
> polyfills requires a full `ng serve` restart (not just a browser refresh).

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
