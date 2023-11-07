import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
let codeReader = null;
let id = null;
let supportsVibrate = false;
let opt = null;
let inst = null;
let selectedDeviceId = null;
let deviceID = null;
let element = null;
let debug = false;
export function vibrate() {
    if (supportsVibrate) navigator.vibrate(1000);
}
export function init(instance, ele, elementid, options, deviceid) {
    console.log('init' + elementid);
    inst = instance;
    opt = options;
    id = elementid;
    deviceID = deviceid;
    element = ele;
    debug = options.debug;
    supportsVibrate = "vibrate" in navigator;
    let startButton = element.querySelector("[data-action=startButton]");
    let resetButton = element.querySelector("[data-action=resetButton]");
    let closeButton = element.querySelector("[data-action=closeButton]");

    if (startButton) startButton.addEventListener('click', () => {
        start(elementid);
    })

    if (resetButton) resetButton.addEventListener('click', () => {
        stop(elementid);
        if (debug) console.log('Reset.')
    })

    if (closeButton) closeButton.addEventListener('click', () => {
        stop(elementid);
        if (debug) console.log('closeButton.')
        instance.invokeMethodAsync("CloseScan");
    })

    load(elementid);
}

export function reload(elementid) {
    load(elementid);
}

export function load(elementid) {
    if (id == elementid) {

        const sourceSelect = element.querySelector("[data-action=sourceSelect]");
        const sourceSelectPanel = element.querySelector("[data-action=sourceSelectPanel]");

        if (opt.pdf417) {
            codeReader = new ZXing.BrowserPDF417Reader();
            if (debug) console.log('ZXing code PDF417 reader initialized')
        } else if (opt.decodeAllFormats) {
            const hints = new Map();
            const formats = opt.formats;
            hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
            codeReader = new ZXing.BrowserMultiFormatReader(hints)
            if (debug) console.log('ZXing code reader initialized with all formats')
        } else {
            codeReader = new ZXing.BrowserMultiFormatReader()
            if (debug) console.log('ZXing code reader initialized')
        }
        codeReader.timeBetweenDecodingAttempts = opt.timeBetweenDecodingAttempts;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: false, video: true })
                .then(() => {

                    codeReader.listVideoInputDevices()
                        .then((videoInputDevices) => {
                            if (deviceID != null) {
                                selectedDeviceId = deviceID
                            } else if (videoInputDevices.length > 1) {
                                selectedDeviceId = videoInputDevices[1].deviceId
                            } else {
                                selectedDeviceId = videoInputDevices[0].deviceId
                            }
                            if (debug) console.log('videoInputDevices:' + videoInputDevices.length);
                            if (videoInputDevices.length > 1) {
                                sourceSelect.innerHTML = '';
                                videoInputDevices.forEach((device) => {
                                    const sourceOption = document.createElement('option');
                                    if (device.label === '') {
                                        sourceOption.text = 'Camera' + (sourceSelect.length + 1);
                                    } else {
                                        sourceOption.text = device.label
                                    }
                                    sourceOption.value = device.deviceId
                                    if (selectedDeviceId != null && device.deviceId == selectedDeviceId) {
                                        sourceOption.selected = true
                                    }
                                    sourceSelect.appendChild(sourceOption)
                                })

                                sourceSelect.onchange = () => {
                                    selectedDeviceId = sourceSelect.value;
                                    inst.invokeMethodAsync('SelectDeviceID', selectedDeviceId, sourceSelect.options[sourceSelect.selectedIndex].text);
                                    codeReader.reset();
                                    start(elementid);
                                }

                                sourceSelectPanel.style.display = 'block'
                            }

                            start(elementid);

                        })
                        .catch((err) => {
                            console.log(err)
                            inst.invokeMethodAsync("GetError", err + '');
                        })

                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                    inst.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                });

        }
    }
}

export function start(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        if (opt.decodeonce) {
            codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                if (debug) console.log(result)
                vibrate();
                if (debug) console.log('autostop');
                codeReader.reset();
                return inst.invokeMethodAsync("GetResult", result.text);
            }).catch((err) => {
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.log(err)
                    inst.invokeMethodAsync("GetError", err + '');
                }
            })
        } else {
            codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
                if (result) {
                    if (debug) console.log(result)
                    vibrate();
                    if (debug) console.log('None-stop');
                    inst.invokeMethodAsync("GetResult", result.text);
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.log(err)
                    inst.invokeMethodAsync("GetError", err + '');
                }
            })
        }

        var x = `decodeContinuously`;
        if (opt.decodeonce) x = `decodeOnce`;
        if (debug) console.log(`Started ` + x + ` decode from camera with id ${selectedDeviceId}`)
        if (debug) console.log(id, 'start');
    }
}

export function stop(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        codeReader.reset();
        if (debug) console.log(id, 'stop');
    }
}

export function QRCodeSvg(instance, input, element, tobase64, size = 300) {
    const codeWriter = new ZXing.BrowserQRCodeSvgWriter()

    if (debug) console.log('ZXing code writer initialized')

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

export function DecodeFormImage(instance, element, options, data) {
    var codeReaderImage = null;
    if (options.pdf417) {
        codeReaderImage = new ZXing.BrowserPDF417Reader();
        if (debug) console.log('ZXing code PDF417 reader initialized')
    } else if (options.decodeAllFormats) {
        const hints = new Map();
        const formats = options.formats;
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        if (debug) console.log('ZXing code reader initialized with all formats')
    } else {
        codeReaderImage = new ZXing.BrowserMultiFormatReader()
        if (debug) console.log('ZXing code reader initialized')
    }
    if (debug) console.log('ZXing code reader initialized')

    if (data != null) {
        codeReaderImage.decodeFromImageUrl(data).then(result => {
            if (result) {
                vibrate();
                if (debug) console.log(result.text);
                instance.invokeMethodAsync('GetResult', result.text)
            }
        }).catch((err) => {
            if (err) {
                console.log(err)
                instance.invokeMethodAsync('GetError', err.message)
            }
        })

    }
    else {
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
                        vibrate();
                        if (debug) console.log(result.text);
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

}

export function destroy(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        codeReader.reset();
        codeReader = null;
        //id = null;
        if (debug) console.log(id, 'destroy');
    }
}