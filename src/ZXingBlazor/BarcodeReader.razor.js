import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
var codeReader = null;
var id = null;
var supportsVibrate = false;
export function init(instance, element, elementid, options, deviceID) {
    console.log('init' + elementid);
    id = elementid;
    let selectedDeviceId;
    const sourceSelect = element.querySelector("[data-action=sourceSelect]");
    const sourceSelectPanel = element.querySelector("[data-action=sourceSelectPanel]");
    let startButton = element.querySelector("[data-action=startButton]");
    let resetButton = element.querySelector("[data-action=resetButton]");
    let closeButton = element.querySelector("[data-action=closeButton]");
    supportsVibrate = "vibrate" in navigator;

    if (options.pdf417) {
        codeReader = new ZXing.BrowserPDF417Reader();
        console.log('ZXing code PDF417 reader initialized')
    } else if (options.decodeAllFormats) {
        const hints = new Map();
        const formats = options.formats;
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        codeReader = new ZXing.BrowserMultiFormatReader(hints)
        console.log('ZXing code reader initialized with all formats')
    } else {
        codeReader = new ZXing.BrowserMultiFormatReader()
        console.log('ZXing code reader initialized')
    }
    codeReader.timeBetweenDecodingAttempts = options.timeBetweenDecodingAttempts;

    codeReader.listVideoInputDevices()
        .then((videoInputDevices) => {
            if (deviceID != null) {
                selectedDeviceId = deviceID
            } else {
                selectedDeviceId = videoInputDevices[0].deviceId
            }
            console.log('videoInputDevices:' + videoInputDevices.length);
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((device) => {
                    const sourceOption = document.createElement('option');
                    if (device.label === '') {
                        sourceOption.text = 'Camera' + (sourceSelect.length + 1);
                    } else {
                        sourceOption.text = device.label
                    }
                    sourceOption.value = device.deviceId
                    if (deviceID != null && device.deviceId == deviceID) {
                        sourceOption.selected = true
                    } 
                    sourceSelect.appendChild(sourceOption)
                    //selectedDeviceId = device.deviceId;
                })

                sourceSelect.onchange = () => {
                    selectedDeviceId = sourceSelect.value;
                    instance.invokeMethodAsync('SelectDeviceID', selectedDeviceId, sourceSelect.options[sourceSelect.selectedIndex].text);
                    codeReader.reset();
                    StartScan();
                }

                sourceSelectPanel.style.display = 'block'
            }

            StartScan();

            if (startButton) startButton.addEventListener('click', () => {
                StartScan();
            })

            function StartScan() {
                if (options.decodeonce) {
                    codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                        console.log(result)
                        if (supportsVibrate) navigator.vibrate(1000);
                        console.log('autostop');
                        codeReader.reset();
                        return instance.invokeMethodAsync("GetResult", result.text);
                    }).catch((err) => {
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            instance.invokeMethodAsync("GetError", err + '');
                        }
                    })
                } else {
                    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
                        if (result) {
                            console.log(result)
                            if (supportsVibrate) navigator.vibrate(1000);
                            console.log('None-stop');
                            instance.invokeMethodAsync("GetResult", result.text);
                        }
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            instance.invokeMethodAsync("GetError", err + '');
                        }
                    })
                }

                var x = `decodeContinuously`;
                if (options.decodeonce) x = `decodeOnce`;
                console.log(`Started ` + x + ` decode from camera with id ${selectedDeviceId}`)
            }

            if (resetButton) resetButton.addEventListener('click', () => {
                codeReader.reset();
                console.log('Reset.')
            })

            if (closeButton) closeButton.addEventListener('click', () => {
                codeReader.reset();
                console.log('closeButton.')
                instance.invokeMethodAsync("CloseScan");
            })

        })
        .catch((err) => {
            console.log(err)
            instance.invokeMethodAsync("GetError", err + '');
        })

}

export function QRCodeSvg(instance, input, element, tobase64,size=300) {
    const codeWriter = new ZXing.BrowserQRCodeSvgWriter()

    console.log('ZXing code writer initialized')

    if (tobase64) {
        const elementTemp = document.createElement('elementTemp');
        codeWriter.writeToDom(elementTemp, input, size, size)
        let svgElement = elementTemp.firstChild
        const svgData = (new XMLSerializer()).serializeToString(svgElement)
        //const blob = new Blob([svgData])
        instance.invokeMethodAsync("GetQRCode", svgData);
    } else {
        codeWriter.writeToDom(element.querySelector("[data-action=result]"), input, size, size)
    }
}

export function DecodeFormImage(instance, element, options) {
    var codeReaderImage = null; 
    if (options.pdf417) {
        codeReaderImage = new ZXing.BrowserPDF417Reader();
        console.log('ZXing code PDF417 reader initialized')
    } else if (options.decodeAllFormats) {
        const hints = new Map();
        const formats = options.formats;
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        console.log('ZXing code reader initialized with all formats')
    } else {
        codeReaderImage = new ZXing.BrowserMultiFormatReader()
        console.log('ZXing code reader initialized')
    }
    console.log('ZXing code reader initialized')

    const resetFile = () => {
        let file = element.querySelector('[type="file"]')
        if (file) {
            file.removeEventListener('change', scanImageHandler)
            file.remove()
        }
        file = document.createElement('input')
        file.setAttribute('type', 'file')
        file.setAttribute('hidden', 'true')
        file.setAttribute('accept', 'image/*')
        //file.setAttribute('capture', 'true')
        element.append(file)
        file.addEventListener('change', scanImageHandler)
        codeReaderImage.file = file
        return file
    }

    const scanImageHandler = () => {
        const files = codeReaderImage.file.files
        if (files.length === 0) {
            return
        }


        const reader = new FileReader()
        reader.onloadend = e => {
            codeReaderImage.decodeFromImageUrl(e.target.result).then(result => {
                if (result) {
                    if (supportsVibrate) navigator.vibrate(1000);
                    console.log(result.text);
                    instance.invokeMethodAsync('GetResult', result.text)
                }
            }).catch((err) => {
                if (err) {
                    console.log(err)
                    instance.invokeMethodAsync('GetError', err.message)
                }
            })
        }
        reader.readAsDataURL(files[0])
    }

    let file = resetFile()
    file.click()
     
}

export function destroy(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        codeReader.reset();
        codeReader = null;
        //id = null;
        console.log(id, 'destroy');
    }
}