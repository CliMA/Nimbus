# CLiMA – NIMBUS Prototype

<!-- ![screenshot](https://github.jpl.nasa.gov/raw/vis-program/clima/master/meta/proto.png?token=AAACFB7YXCKMYEZFPC5LLFS7HXX7O) -->


---

**Core team:**  
Martin Bernard (CS Lead, ArtCenter College of Design)  
Rachel Rose Waterhouse (Design Lead, Frontend Developer, ArtCenter College of Design)  
Barbara Alonso (Design Lead, Harvard School of Engineering)  

**CliMA / Caltech collaborators:**  
PI: Tapio Schneider  
Akshay Sridhar  
Lenka Novakova  
Yair Cohen  

**Project Mentors:**  
Scott Davidoff, NASA Jet Propulsion Laboratory  
Santiago Lombeyda, Caltech + ArtCenter College of Design  
Maggie Hendrie, ArtCenter College of Design  
Hillary Mushkin, Caltech  

---
## Info
This project was created with [React](https://reactjs.org/), bootstrapped with `create-react-app` see [documentation](https://create-react-app.dev/docs/getting-started/), and [d3.js](https://d3js.org/). The project can deployed as a standalone desktop application via Electron, but this would require some additional configuration.


## Setup
Make sure you have installed Node & NPM. One way to do this is with [Homebrew](https://treehouse.github.io/installation-guides/mac/node-mac.html).

Clone the repo, cd into the directory, and then run `npm install` to install the required dependencies for the project.


## App Structure
As mentioned above, this project was initially created with `create-react-app`. Therefore, Webpack and Babel are preconfigured. If you wish to create a custom configuration, you will need to run `npm run eject`, which will extract the configuration files for you that you can then change.

The entry point of the application is `index.js`. That is where we import the `App` React component, which contains the child components `SlicesContainer` and `DiagnosticPlotsContainer`. These correspond in general to the top and bottom views of the prototype.

Similarly, these child components also import other components - for example, `SlicesContainer` uses the `HorizontalSlice` and `VerticalSlice` functional components.

The data visualizations are created with d3, and use both SVG and Canvas for rendering.


## DEVELOPMENT - Web
In a terminal window, run `node server.js` to start the server (running on port  `8080`).
In another terminal winow, run `npm run start` and open a browser to `localhost:3000`. 

The `start` script is run from the react-scripts module as part of `create-react-app` see [here](https://create-react-app.dev/docs/available-scripts/), which uses its own webpack config. We have not changed that. To make a custom config, you must first eject (see aforementioned link to available scripts above). Additionally, the `create-react-app` has a `/public` folder. In development, `src/index.js` is looking for the `index.html` inside `/public`, as it appends everything within `<div id="root"></div>`.  

Calls to the node server running on 8080 are done via proxy so that calls can be made from port 3000 - this is set up in `package.json`. 


## PRODUCTION - Web
To create a production build for the web, run `npm run build` in terminal. This will create the bundled js files in `/build > /static > /js`. The `index.html` from the `/public` is copied to the `build` folder that is generated. Once that is complete, you should be able to run the server again with `node server.js`, which will then serve the build directory. You should be able to open a browser tab to `localhost:8080`.


## PRODUCTION - Electron
See `package.json` scripts section and script notes to create a production Electron app. In particular, see the `package` script which will generate executables for both Mac and Windows inside of the `./dist` directory See notes that we followed [here](https://medium.com/@johndyer24/building-a-production-electron-create-react-app-application-with-shared-code-using-electron-builder-c1f70f0e2649). 


## Notes
This is a prototype that was built to visualize BOMEX LES data provided by the CLIMA team. It can be extended to other types of data.

During the prototyping process we used Observable notebooks to develop each individual feature included in the final design. The notebook where this all happened is open to anyone who has the [link](https://observablehq.com/d/f9028dfd6edb7848).

For the project, we converted some of the data we were given to JSON so that we could quickly consume the data in this environment. Ideally, we would be able to directly import `.nc` files or have a pipeline that would convert those files to JSON. We used Julia notebooks to convert these files, and that code is also included in this repository, along with some of our very early Julia prototypes that access the `.nc` files directly.

The variables available in the contour plot dropdowns, the diagnostic plots, and the timeline variable scrubber (the TLV dropdown in the UI, default variable shown is TKE) are hardcoded - we chose a subset for the purposes of the demo. Ideally, this list of variables would be determined based on the data uploaded.

For the purposes of this prototype and demo, we use a subset of the data that we were provided, and is imported in the `DiagnosticPlotsContainer` and the `SlicesContainer` components. Potentially this would be moved up a level, so that the parent `App.js` component would have support for uploading the data (which at time of writing is not implemented/supported), then passing it to the respective child components. We have not tested this with a full set of simulation data, but recognize that there is additional work that would need to be done to support this.

Responsiveness has not been implemented in detail - there are some variables that we set that attempt to account for window size, but not resize. As a result, you may need to refresh on screen resize.
