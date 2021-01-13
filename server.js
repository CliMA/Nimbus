const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();
const PORT    = 8080;

// --------------------------------------------------------
// SAMPLE DATA
const sampleSimulationData = [
  {
    site_id: 'site_01',
    geocoordinates: [],
    simulations: [
      {
        sim_id: 'simulation_01',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 6,
          min: 0,
          sec: 0
        },
        time_steps: 180
      },
      {
        sim_id: 'simulation_02',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 4,
          min: 30,
          sec: 30
        },
        time_steps: 40
      },
      {
        sim_id: 'simulation_03',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 5,
          min: 45,
          sec: 0
        },
        time_steps: 60
      }
    ]
  },

  { 
    site_id: 'site_02',
    geocoordinates: [],
    simulations: [
      {
        sim_id: 'simulation_04',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 6,
          min: 0,
          sec: 0
        },
        time_steps: 180
      },
      {
        sim_id: 'simulation_05',
        domain_dims: {
          units: 'km',
          width: 6.4,
          depth: 6.4,
          height: 3.0
        },
        duration: {
          hrs: 4,
          min: 30,
          sec: 30
        },
        time_steps: 40
      },
    ]
  }
]

// --------------------------------------------------------
// assumes that user-settings.json exists 
app.get('/userDirectoryPath', (req, res) => {
  fs.readFile('user-settings.json', (err, data) => {
    if (err) {
      throw err;
    }
    let userSettingsData = JSON.parse(data);
    res.send(userSettingsData);
  });
});

// --------------------------------------------------------
app.get('/siteSimulationList', (req, res) => {
  res.send(sampleSimulationData);
});

// --------------------------------------------------------
app.use(express.static(path.join(__dirname, 'build')))

// PRODUCTION ONLY - serves from build
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on PORT ${ PORT }`);
});