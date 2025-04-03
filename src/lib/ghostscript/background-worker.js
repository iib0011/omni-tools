function loadScript() {
  import('./gs-worker.js');
}

var Module;

function _GSPS2PDF(dataStruct, responseCallback) {
  const compressionLevel = dataStruct.compressionLevel || 'medium';

  // Set PDF settings based on compression level
  let pdfSettings;
  switch (compressionLevel) {
    case 'low':
      pdfSettings = '/printer'; // Higher quality, less compression
      break;
    case 'medium':
      pdfSettings = '/ebook'; // Medium quality and compression
      break;
    case 'high':
      pdfSettings = '/screen'; // Lower quality, higher compression
      break;
    default:
      pdfSettings = '/ebook'; // Default to medium
  }
  // first download the ps data
  var xhr = new XMLHttpRequest();
  xhr.open('GET', dataStruct.psDataURL);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    console.log('onload');
    // release the URL
    self.URL.revokeObjectURL(dataStruct.psDataURL);
    //set up EMScripten environment
    Module = {
      preRun: [
        function () {
          self.Module.FS.writeFile('input.pdf', new Uint8Array(xhr.response));
        }
      ],
      postRun: [
        function () {
          var uarray = self.Module.FS.readFile('output.pdf', {
            encoding: 'binary'
          });
          var blob = new Blob([uarray], { type: 'application/octet-stream' });
          var pdfDataURL = self.URL.createObjectURL(blob);
          responseCallback({ pdfDataURL: pdfDataURL, url: dataStruct.url });
        }
      ],
      arguments: [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-dPDFSETTINGS=${pdfSettings}`,
        '-DNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-sOutputFile=output.pdf',
        'input.pdf'
      ],
      print: function (text) {},
      printErr: function (text) {},
      totalDependencies: 0,
      noExitRuntime: 1
    };
    // Module.setStatus("Loading Ghostscript...");
    if (!self.Module) {
      self.Module = Module;
      loadScript();
    } else {
      self.Module['calledRun'] = false;
      self.Module['postRun'] = Module.postRun;
      self.Module['preRun'] = Module.preRun;
      self.Module.callMain();
    }
  };
  xhr.send();
}

self.addEventListener('message', function ({ data: e }) {
  console.log('message', e);
  // e.data contains the message sent to the worker.
  if (e.target !== 'wasm') {
    return;
  }
  console.log('Message received from main script', e.data);
  _GSPS2PDF(e.data, ({ pdfDataURL }) => self.postMessage(pdfDataURL));
});

console.log('Worker ready');
