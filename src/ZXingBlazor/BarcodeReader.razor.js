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
let width = 640;
let height = 0;

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

function genHints(opt) {
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
        codeReader = genCodeReaderImage(opt);
        codeReader.timeBetweenDecodingAttempts = opt.timeBetweenDecodingAttempts;

        if (opt.screenshot && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices
                .getDisplayMedia({ video: true, audio: false })
                .then((stream) => {
                    //video.srcObject = stream;
                    //video.play();

                    codeReader.decodeFromStream(stream, video, (result, err) => {
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

                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                    inst.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                });
        } else if (!opt.streamFromZxing && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            if (!navigator.mediaDevices?.enumerateDevices) {
                console.log("enumerateDevices() not supported.");
            } else {
                if (!opt.width) opt.width = 640;
                if (!opt.height) opt.height = 480;
                width = opt.width;
                if (debug) console.log(`Set: ${selectedDeviceId} video ${opt.width} x ${opt.height}`);
                var constraints = {
                    video: {
                        width: { ideal: opt.width },
                        height: { ideal: opt.height },
                        facingMode: "environment",
                        focusMode: "continuous",
                    }, audio: false
                };

                if (selectedDeviceId != null || opt.deviceID != null) {
                    let deviceId = selectedDeviceId;
                    if (deviceId == null) deviceId = opt.deviceID;
                    constraints = {
                        video: {
                            deviceId: deviceId ? { exact: deviceId } : undefined,
                            width: { ideal: opt.width },
                            height: { ideal: opt.height },
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

                        try {
                            video.srcObject = null;
                        }
                        catch (err) {
                            video.src = '';
                        }
                        if (video) {
                            video.removeAttribute('src');
                        }

                        //video.srcObject = stream;
                        //video.play();

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
                                            if (opt.deviceID != null && device.deviceId == opt.deviceID) {
                                                sourceOption.selected = true
                                            }
                                            sourceSelect.appendChild(sourceOption)
                                        });

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
                                    console.error(`${err.name}: ${err.message}`);
                                });
                        }
                    })
                    .catch((err) => {
                        console.error(`An error occurred: ${err}`);
                        inst.invokeMethodAsync('GetError', `An error occurred: ${err}`);
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

function genCodeReaderImage(options) {
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

export function DecodeFormImage(instance, element, options, data) {
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
        //id = null;
        id = null;
        opt = null;
        inst = null;
        selectedDeviceId = null;
        deviceID = null;
        element = null;
        if (debug) console.log(id, 'destroy');
    }
}