const express = require('express');
const path    = require('path');
const fs      = require('fs');
const app     = express();
const PORT    = 8080;

// --------------------------------------------------------
app.get('/simulationMetadata', (req, res) => {
  fs.readFile('./netcdf2nimbus/_output/nimbus_meta.json', (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  });
});

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
app.use(express.static(path.join(__dirname, 'build')))

// PRODUCTION ONLY - serves from build
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on PORT ${ PORT }`);
});