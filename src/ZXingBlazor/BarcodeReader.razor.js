import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
let codeReader = null;
let id = null;
let supportsVibrate = false;
let options = null;
let instance = null;
let selectedDeviceId = null;
let deviceID = null;
let element = null;
let debug = false;
let width = 640;
let height = 0;

export function vibrate() {
    try {
        if (supportsVibrate)
        {
            navigator.vibrate(1000);
        }
    } catch {
    }
}
export function init(_instance, _element, _elementid, _options, _deviceid) {
    console.log('init' + _elementid);
    instance = _instance;
    options = _options;
    id = _elementid;
    deviceID = _deviceid;
    element = _element;
    debug = _options.debug;
    supportsVibrate = "vibrate" in navigator;
    let startButton = element.querySelector("[data-action=startButton]");
    let resetButton = element.querySelector("[data-action=resetButton]");
    let closeButton = element.querySelector("[data-action=closeButton]");

    if (startButton) startButton.addEventListener('click', () => {
        start(_elementid);
    })

    if (resetButton) resetButton.addEventListener('click', () => {
        stop(_elementid);
    })

    if (closeButton) closeButton.addEventListener('click', () => {
        stop(_elementid);
        _instance.invokeMethodAsync("CloseScan");
    })

    load(_elementid);
}

export function reload(elementid) {
    load(elementid);
}

export function genHints(opt) {
    const hints = new Map();
    if (opt.TRY_HARDER) {
        hints.set(ZXing.DecodeHintType.TRY_HARDER, opt.TRY_HARDER);
    }
    if (opt.ASSUME_CODE_39_CHECK_DIGIT) {
        hints.set(ZXing.DecodeHintType.ASSUME_CODE_39_CHECK_DIGIT, opt.ASSUME_CODE_39_CHECK_DIGIT);
    }
    if (opt.ASSUME_GS1) {
        hints.set(ZXing.DecodeHintType.ASSUME_GS1, opt.ASSUME_GS1);
    }
    if (opt.CHARACTER_SET) {
        hints.set(ZXing.DecodeHintType.CHARACTER_SET, opt.CHARACTER_SET);
    }
    if (opt.OTHER) {
        hints.set(ZXing.DecodeHintType.OTHER, opt.OTHER);
    }
    if (opt.PURE_BARCODE) {
        hints.set(ZXing.DecodeHintType.PURE_BARCODE, opt.PURE_BARCODE);
    }
    if (opt.RETURN_CODABAR_START_END) {
        hints.set(ZXing.DecodeHintType.RETURN_CODABAR_START_END, opt.RETURN_CODABAR_START_END);
    }
    if (opt.TRY_HARDER) {
        hints.set(ZXing.DecodeHintType.TRY_HARDER, opt.TRY_HARDER);
    }
    return hints;
}

export function load(elementid) {
    if (id == elementid) {

        const sourceSelect = element.querySelector("[data-action=sourceSelect]");
        const sourceSelectPanel = element.querySelector("[data-action=sourceSelectPanel]");
        const video = element.querySelector("[data-action=video]");
        codeReader = genCodeReaderImage(options);
        codeReader.timeBetweenDecodingAttempts = options.timeBetweenDecodingAttempts;

        if (options.screenshot && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices
                .getDisplayMedia({ video: true, audio: false })
                .then((stream) => {
                    codeReader.decodeFromStream(stream, video, (result, err) => {
                        if (result) {
                            if (debug) console.log(result)
                            vibrate();
                            if (debug) console.log('None-stop');
                            instance.invokeMethodAsync("GetResult", result.text);
                        }
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            instance.invokeMethodAsync("GetError", err + '');
                        }
                    })
                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                    instance.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                });
        } else if (!options.streamFromZxing && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            if (!navigator.mediaDevices?.enumerateDevices) {
                console.log("enumerateDevices() not supported.");
            } else {
                if (!options.width) options.width = 640;
                if (!options.height) options.height = 480;
                width = options.width;
                if (debug) console.log(`Set: ${selectedDeviceId} video ${options.width} x ${options.height}`);
                var constraints = {
                    video: {
                        width: { ideal: options.width },
                        height: { ideal: options.height },
                        facingMode: "environment",
                        focusMode: "continuous",
                    }, audio: false
                };

                if (selectedDeviceId != null || options.deviceID != null) {
                    let deviceId = selectedDeviceId;
                    if (deviceId == null) deviceId = options.deviceID;
                    constraints = {
                        video: {
                            deviceId: deviceId ? { exact: deviceId } : undefined,
                            width: { ideal: options.width },
                            height: { ideal: options.height },
                            facingMode: "environment",
                            focusMode: "continuous",
                        },
                        audio: false
                    }
                    if (debug) console.log(constraints.video.deviceId);
                }
                navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then((stream) => {

                        if (selectedDeviceId == null) {
                            navigator.mediaDevices.enumerateDevices()
                                .then((devices) => {
                                    let videoInputDevices=[];
                                    devices.forEach((device) => {
                                        if (device.kind === 'videoinput') {
                                            videoInputDevices.push(device);
                                        }
                                    });
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
                                        });

                                        sourceSelect.onchange = () => {
                                            selectedDeviceId = sourceSelect.value;
                                            instance.invokeMethodAsync('SelectDeviceID', selectedDeviceId, sourceSelect.options[sourceSelect.selectedIndex].text);
                                            codeReader.reset();
                                            start(elementid);
                                        }

                                        sourceSelectPanel.style.display = 'block'

                                    }

                                    start(elementid);

                                })
                                .catch((err) => {
                                    console.error(`${err.name}: ${err.message}`);
                                });
                        }
                    })
                    .catch((err) => {
                        console.error(`An error occurred: ${err}`);
                        instance.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                    });

            }


        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
                                    instance.invokeMethodAsync('SelectDeviceID', selectedDeviceId, sourceSelect.options[sourceSelect.selectedIndex].text);
                                    codeReader.reset();
                                    start(elementid);
                                }

                                sourceSelectPanel.style.display = 'block'
                            }

                            start(elementid);

                        })
                        .catch((err) => {
                            console.log(err)
                            instance.invokeMethodAsync("GetError", err + '');
                        })

                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                    instance.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                });

        }
    }
}

export function start(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        if (options.decodeonce) {
            codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                if (debug) console.log(result)
                vibrate();
                if (debug) console.log('autostop');
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
                    if (debug) console.log(result)
                    vibrate();
                    if (debug) console.log('None-stop');
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

export function genCodeReaderImage(options) {
    var codeReaderImage = null;
    const hints = genHints(options);
    if (options.pdf417) {
        codeReaderImage = new ZXing.BrowserPDF417Reader(hints);
        if (debug) console.log('ZXing code PDF417 reader initialized')
    } else if (options.decodeAllFormats) {
        const formats = options.formats;
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        if (debug) console.log('ZXing code reader initialized with all formats')
    } else {
        codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        if (debug) console.log('ZXing code reader initialized')
    }
    if (debug) console.log('ZXing code reader initialized')
    return codeReaderImage;
}

export async function DecodeFormImage(instance, element, options, data) {
    var codeReaderImage = genCodeReaderImage(options);

    if (data != null) {
        codeReaderImage.decodeFromImageUrl(data).then(result => {
            if (result) {
                vibrate();
                if (debug) console.log(result.text);
                instance.invokeMethodAsync('GetResult', result.text)
            }
        }).catch((err) => {
            if (err) {
                if (options.debug) console.log(err)
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
                    } else {
                        instance.invokeMethodAsync('GetError', "no valid barcode detected")
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
        id = null;
        options = null;
        instance = null;
        selectedDeviceId = null;
        deviceID = null;
        element = null;
    }
}