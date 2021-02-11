const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const app      = express();
const BSON     = require('bson');
const PORT     = 8080;
const userPath = 'netcdf2nimbus/sample_output';

// --------------------------------------------------------
app.get('/dbMetadataList', (req, res) => {
  fs.readFile('./netcdf2nimbus/database.json', (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  });
});


// --------------------------------------------------------



// --------------------------------------------------------
app.get('/simDiagnosticFile', (req, res) => {
  let sim = JSON.parse(req.query.sim);
  let diagPath = `${ userPath }/${ sim['site_id'] }/${ sim['sim_id'] }/_diagnostic.json`;

  fs.readFile(diagPath, (err, data) => {
    if (err) {
      throw err;
    }
    // res.send( (BSON.deserialize(data, {promoteValues: true} )).data );
  res.send(JSON.parse(data));

  });
});

// --------------------------------------------------------
app.get('/simDiagnosticBSON', (req, res) => {
  let sim = JSON.parse(req.query.sim);
  let diagPath = `${ userPath }/${ sim['site_id'] }/${ sim['sim_id'] }/_diagnostic.bson`;

  fs.readFile(diagPath, (err, data) => {
    if (err) {
      throw err;
    }

  uint8Array  = new Uint8Array(data);
  d = BSON.deserialize(uint8Array, {promoteValues: true} );

  res.send( d.data );

  });
});


// --------------------------------------------------------
app.get('/simMetaFile', (req, res) => {
  let sim = JSON.parse(req.query.sim);
  let metaPath = `${ userPath }/${ sim['site_id'] }/${ sim['sim_id'] }/_meta.json`;

  fs.readFile(metaPath, (err, data) => {
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
