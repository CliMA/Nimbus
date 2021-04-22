const express        = require('express');
const path           = require('path');
const fs             = require('fs');
const fse            = require('fs-extra');
const app            = express();
const BSON           = require('bson');
const PORT           = 8080;
const userPath       = 'nimbus_data';
const SIZE_OF_DOUBLE = 8;


// --------------------------------------------------------
app.get('/dbMetadataList', (req, res) => {
  fs.readFile('./nimbusDB.json', (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  });
});

// --------------------------------------------------------
// Return volumetric data for range of timestamps
app.get('/volDataForTSBatchSize', async (req, res) => {
  let sim         = JSON.parse(req.query.sim);
  let samplingRes = JSON.parse(req.query.samplingRes);
  let tsBatchSize = JSON.parse(req.query.tsBatchSize);
  let tsStarting  = JSON.parse(req.query.tsStarting) + 1;
  let tsNum       = JSON.parse(req.query.tsNum);

  let volDir = `${ userPath }/${ sim['site_id'] }/${ sim['sim_id'] }/volumetric/${ samplingRes }x`;

  let tsBatchData = [];

  // Make sure to wait for all data
  console.log('---------')
  console.log('tsStarting: ',tsStarting);
  console.log('ending: ', tsStarting + tsBatchSize - 1)
  console.log('tsNum', tsNum);

  let tsMax;
  if (tsNum - tsStarting < 5) {
    tsMax = tsNum - tsStarting;
  } else {
    tsMax = tsStarting + tsBatchSize - 1
  }

  for (let i = tsStarting; i <= tsMax; i++) {
    let tsDir = `${ volDir }/t_${ i }/`
    const a = await getVolDataForTS(tsDir, i)
    tsBatchData.push(a);
  }
  res.send(tsBatchData);
})


// --------------------------------------------------------
// Return volumetric data for one timestamp
async function getVolDataForTS(tsDir, idx) {
  return await fse.readdir(tsDir)
    .then(filenames => {
      return filenames.map(filename => path.join(tsDir, filename))
    })
    .then(filepaths => {
      // console.log(filepaths)
      return filepaths.map(filepath => fse.readFile(filepath)
        .then(filecontents => {
          let ds = BSON.deserialize(filecontents);
          let parsed_ds = BSON_parse(ds);
          return parsed_ds;
        }))
    }).then(contents => Promise.all(contents))
    .then(allcontent => {
      
      // TESTING ONLY
      // console.log(allcontent)
      // fs.writeFile(`test_${idx}.json`, JSON.stringify(allcontent), 'utf8', 
      // function (err) {
      //   if (err) {
      //     return console.log(err);
      //   }
      //   console.log("The file was saved!");
      // }); 

      return allcontent;
    });
}

// --------------------------------------------------------
app.get('/simDiagnosticFile', (req, res) => {
  let sim = JSON.parse(req.query.sim);
  let diagPath = `${ userPath }/${ sim['site_id'] }/${ sim['sim_id'] }/_diagnostic.bson`;

  fs.readFile(diagPath, (err, data) => {
    if (err) {
      throw err;
    }
    let ds = BSON.deserialize(data);
    let parsed_ds = BSON_parse(ds);
    res.send(parsed_ds);
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

// --------------------------------------------------------
// pass in deserialized bson. works for 1D, 2D, and 3D arrays
// --------------------------------------------------------
function BSON_parse(ds) {
  let variable_names = ds["data"][0];
  let num_variables = variable_names.length;
  let dict = {};
  for (let i=0; i<num_variables; i++) {
    let big_array = [];
    let struct = ds["data"][1][i];
    let dims = struct["size"];
    let buffer = struct["data"]["buffer"];
    if (dims.length == 3) {
      for (let m=0; m<dims[2]; m++) {
        let medium_array = [];
        for (let n=0; n<dims[1]; n++) {
          let small_array = [];
          let bufferlength = dims[0] * SIZE_OF_DOUBLE;
          for(let j=0; j<bufferlength; j+=SIZE_OF_DOUBLE) {
            let offset = (m*dims[1]*bufferlength) + (n*bufferlength) + j;
            
            // let offset = (m*n*bufferlength) + (n*bufferlength) + j;
            let d = buffer.readDoubleLE(offset);
            small_array.push(d);
          }
          medium_array.push(small_array);
        }
        big_array.push(medium_array);
      }
    }
    else if (dims.length == 2) {
      for (let m=0; m<dims[1]; m++) {
        let small_array = [];
        let bufferlength = dims[0] * SIZE_OF_DOUBLE;
        for(let n=0; n<bufferlength; n+=SIZE_OF_DOUBLE) {
          let offset = (m * bufferlength) + n;
          let d = buffer.readDoubleLE(offset);
          small_array.push(d);
        }
        big_array.push(small_array);
      }
    } else {
      let bufferlength = dims[0] * SIZE_OF_DOUBLE;
      for(let m=0; m<bufferlength; m+=SIZE_OF_DOUBLE) {
        let d = buffer.readDoubleLE(m);
        big_array.push(d);
      }
    }
    dict[variable_names[i]] = big_array;
  }
  return dict;
}
