import { COMPRESS_ACTION, PROTECT_ACTION, UNLOCK_ACTION } from './worker-init';

function loadScript() {
  import('./gs-worker.js');
}

var Module;

function compressPdf(dataStruct, responseCallback) {
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
          responseCallback({
            pdfDataURL: pdfDataURL,
            url: dataStruct.url,
            type: COMPRESS_ACTION
          });
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

function protectPdf(dataStruct, responseCallback) {
  const password = dataStruct.password || '';

  // Validate password
  if (!password) {
    console.error({
      error: 'Password is required for encryption',
      url: dataStruct.url
    });
    return;
  }
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
          responseCallback({
            pdfDataURL: pdfDataURL,
            url: dataStruct.url,
            type: PROTECT_ACTION
          });
        }
      ],
      arguments: [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        `-sOwnerPassword=${password}`,
        `-sUserPassword=${password}`,
        // Permissions (prevent copying/printing/etc)
        '-dEncryptionPermissions=-4',
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

function unlockPdf(dataStruct, responseCallback) {
  const speed = dataStruct.speed || 'normal';
  let passwordListUrl;
  console.log('unlockPdf', dataStruct);
  // Determine which password list to download based on speed
  if (speed === 'fast') {
    passwordListUrl =
      'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/xato-net-10-million-passwords-1000.txt';
  } else if (speed === 'normal') {
    passwordListUrl =
      'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/xato-net-10-million-passwords-100000.txt';
  } else {
    // Default or handle other speeds
    passwordListUrl =
      'https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/xato-net-10-million-passwords-100000.txt';
  }

  // --- Step 1: Download the password list ---
  var xhrPasswordList = new XMLHttpRequest();
  xhrPasswordList.open('GET', passwordListUrl);
  xhrPasswordList.onload = function () {
    if (xhrPasswordList.status === 200) {
      const passwordList = xhrPasswordList.responseText
        .split('\n')
        .map((p) => p.trim());

      // --- Step 2: Proceed with PDF processing and dictionary attack ---
      processPdfWithDictionary(dataStruct, responseCallback, passwordList);
    } else {
      console.error(
        'Failed to download password list:',
        xhrPasswordList.statusText
      );
      console.error('Failed to download password list');
    }
  };
  xhrPasswordList.onerror = function () {
    console.error('Network error while downloading password list.');
    console.error('Network error while downloading password list');
  };
  xhrPasswordList.send();
}

function processPdfWithDictionary(dataStruct, responseCallback, passwordList) {
  var xhrPdf = new XMLHttpRequest();
  xhrPdf.open('GET', dataStruct.psDataURL);
  xhrPdf.responseType = 'arraybuffer';
  xhrPdf.onload = function () {
    console.log('PDF onload');
    self.URL.revokeObjectURL(dataStruct.psDataURL);

    let currentPasswordIndex = 0;
    const tryNextPassword = () => {
      if (currentPasswordIndex >= passwordList.length) {
        console.error('All passwords tried. PDF could not be unlocked.');
        return;
      }

      const password = passwordList[currentPasswordIndex];
      console.log(
        `Attempting with password: "${password}" (${currentPasswordIndex + 1}/${
          passwordList.length
        })`
      );

      Module = {
        preRun: [
          function () {
            self.Module.FS.writeFile(
              'input.pdf',
              new Uint8Array(xhrPdf.response)
            );
          }
        ],
        postRun: [
          function () {
            try {
              var uarray = self.Module.FS.readFile('output.pdf', {
                encoding: 'binary'
              });
              // If readFile succeeds, it means the password was correct
              var blob = new Blob([uarray], {
                type: 'application/octet-stream'
              });
              var pdfDataURL = self.URL.createObjectURL(blob);
              console.log(
                `PDF unlocked successfully with password: "${password}"`
              );
              responseCallback({
                pdfDataURL: pdfDataURL,
                url: dataStruct.url,
                type: PROTECT_ACTION
              });
            } catch (error) {
              console.error('Error:', error);
            }
          }
        ],
        arguments: [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          `-sPDFPassword=${password}`, // Use the current password from the list
          '-DNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          '-sOutputFile=output.pdf',
          'input.pdf'
        ],
        print: function (text) {
          if (text.includes('Error: Password did not work')) {
            try {
              if (self.Module && typeof self.Module.exit === 'function') {
                self.Module.exit(1);
              }
              // Clean up any files that might have been created
              if (self.Module && self.Module.FS) {
                try {
                  if (self.Module.FS.readdir('/').includes('input.pdf')) {
                    self.Module.FS.unlink('input.pdf');
                  }
                  if (self.Module.FS.readdir('/').includes('output.pdf')) {
                    self.Module.FS.unlink('output.pdf');
                  }
                } catch (fsError) {
                  console.log('Filesystem cleanup error:', fsError);
                }
              }
            } catch (exitError) {
              console.log('Error during module exit:', exitError);
            }

            currentPasswordIndex++;
            setTimeout(tryNextPassword, 10); // Small delay to prevent tight loop
          }
        },
        printErr: function (text) {
          // Ghostscript might print errors here if the password is wrong
          // We need to parse these to determine if it's a password error or another issue
          console.error('Ghostscript error:', text);
        },
        totalDependencies: 0,
        noExitRuntime: 1
      };

      if (!self.Module) {
        self.Module = Module;
        loadScript(); // Assuming loadScript() loads the Emscripten-compiled Ghostscript
      } else {
        self.Module['calledRun'] = false;
        self.Module['postRun'] = Module.postRun;
        self.Module['preRun'] = Module.preRun;
        self.Module['arguments'] = Module.arguments;
        self.Module.callMain();
      }
    };

    // Start the dictionary attack
    tryNextPassword();
  };

  xhrPdf.onerror = function () {
    console.error('Network error while downloading PDF.');
  };
  xhrPdf.send();
}

// Assuming PROTECT_ACTION and loadScript() are defined elsewhere in your worker/global scope.
// For example:
// const PROTECT_ACTION = 'pdf_protection_status';
// function loadScript() {
//   importScripts('ghostscript_module.js'); // Or whatever your Emscripten output file is named
// }
self.addEventListener('message', function ({ data: e }) {
  console.log('message', e);
  // e.data contains the message sent to the worker.
  if (e.target !== 'wasm') {
    return;
  }
  console.log('Message received from main script', e.data);
  const responseCallback = ({ pdfDataURL, type, log }) => {
    self.postMessage(pdfDataURL);
    console.log(log);
  };
  if (e.data.type === COMPRESS_ACTION) {
    compressPdf(e.data, responseCallback);
  } else if (e.data.type === PROTECT_ACTION) {
    protectPdf(e.data, responseCallback);
  } else if (e.data.type === UNLOCK_ACTION) {
    unlockPdf(e.data, responseCallback);
  }
});

console.log('Worker ready');
