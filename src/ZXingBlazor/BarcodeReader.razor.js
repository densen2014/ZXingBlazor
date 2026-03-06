import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
let codeReader = null;
let codeReaderFromImage = null;
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
        if (supportsVibrate) {
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
        //启用更彻底的解码算法，会尝试更多方向和可能性，提高识别率但降低速度
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
    if (opt.ALLOWED_LENGTHS) {
        hints.set(ZXing.DecodeHintType.ALLOWED_LENGTHS, opt.ALLOWED_LENGTHS);
    }
    if (opt.ASSUME_MSI_CHECK_DIGIT) {
        hints.set(ZXing.DecodeHintType.ASSUME_MSI_CHECK_DIGIT, opt.ASSUME_MSI_CHECK_DIGIT);
    }
    if (opt.ALLOWED_EAN_EXTENSIONS) {
        hints.set(ZXing.DecodeHintType.ALLOWED_EAN_EXTENSIONS, opt.ALLOWED_EAN_EXTENSIONS);
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
                    if (options.ALSO_INVERTED) {
                        codeReaderFromImage = genCodeReaderImage(options);
                        const video = element.querySelector('[data-action=video]');
                        if (video) {
                            video.srcObject = stream;
                            video.play();
                            // 定时反色处理
                            let timer = setInterval(() => {
                                if (video.videoWidth > 0 && video.videoHeight > 0) {
                                    let base64Data = videoToDataURL(video, 1200);
                                    codeReaderFromImage.decodeFromImageUrl(base64Data)
                                        .then(result => {
                                            if (result && result.text) {
                                                if (debug) console.log('[反色定时解码] 结果:', result.text);
                                                vibrate();
                                                instance.invokeMethodAsync("GetResult", result.text);
                                                if (options.decodeonce) {
                                                    if (debug) console.log('autostop');
                                                    codeReaderFromImage.reset();
                                                    codeReader.reset();
                                                    clearInterval(timer);
                                                    return;
                                                }
                                            }
                                        })
                                        .catch(err => {
                                        });
                                }
                            }, 100);
                            // 停止时清理
                            video.addEventListener('ended', () => clearInterval(timer));
                            video.addEventListener('pause', () => clearInterval(timer));
                            element._invertedTimer = timer;
                        }
                    }

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
        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

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
                                    let videoInputDevices = [];
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
                        if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                            // 降级为最小约束重试
                            console.warn('Camera constraints too strict, retrying with minimal constraints.');
                            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                                .then((stream) => {
                                    // 这里可以直接调用 start(elementid) 或者你原有的流处理逻辑
                                    start(elementid);
                                })
                                .catch((err2) => {
                                    console.error(`An error occurred: ${err2}`);
                                    instance.invokeMethodAsync('GetError', `An error occurred: ${err2}`);
                                });
                        } else {
                            console.error(`An error occurred: ${err}`);
                            instance.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                        }
                    });

            }

        }
    }
}

export function start(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {

        if (options.ALSO_INVERTED) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    codeReaderFromImage = genCodeReaderImage(options);
                    const video = element.querySelector('[data-action=video]');
                    if (video) {
                        video.srcObject = stream;
                        video.play();
                        // 定时反色处理
                        let timer = setInterval(() => {
                            if (video.videoWidth > 0 && video.videoHeight > 0) {
                                let base64Data = videoToDataURL(video);
                                codeReaderFromImage.decodeFromImageUrl(base64Data)
                                    .then(result => {
                                        if (result && result.text) {
                                            if (debug) console.log('[反色定时解码] 结果:', result.text);
                                            vibrate();
                                            instance.invokeMethodAsync("GetResult", result.text);
                                            if (options.decodeonce) {
                                                if (debug) console.log('autostop');
                                                codeReaderFromImage.reset();
                                                codeReader.reset();
                                                clearInterval(timer);
                                                return;
                                            }
                                        }
                                    })
                                    .catch(err => {
                                    });
                            }
                        }, 100);
                        // 停止时清理
                        video.addEventListener('ended', () => clearInterval(timer));
                        video.addEventListener('pause', () => clearInterval(timer));
                        element._invertedTimer = timer;
                    }
                })
                .catch((err) => {
                    if (debug) console.error('摄像头测试模式错误:', err);
                });
        }

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
    var _codeReaderImage = null;
    const hints = genHints(options);
    if (options.pdf417) {
        _codeReaderImage = new ZXing.BrowserPDF417Reader(hints);
        if (debug) console.log('ZXing code PDF417 reader initialized')
    } else if (options.decodeAllFormats) {
        const formats = options.formats;
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        _codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        if (debug) console.log('ZXing code reader initialized with all formats')
    } else {
        _codeReaderImage = new ZXing.BrowserMultiFormatReader(hints)
        if (debug) console.log('ZXing code reader initialized')
    }
    if (debug) console.log('ZXing code reader initialized')
    return _codeReaderImage;
}

export async function DecodeFormImage(instance, element, options, dataUrl) {
    codeReaderFromImage = genCodeReaderImage(options);

    if (dataUrl != null) {
        decodeImageWithFallback(codeReaderFromImage, dataUrl, instance, options).then(res => {
            return;
        });
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
            codeReaderFromImage.file = file
            return file
        }

        const scanImageHandler = () => {
            const files = codeReaderFromImage.file.files
            if (files.length === 0) {
                return
            }

            const reader = new FileReader()
            reader.onloadend = e => {
                decodeImageWithFallback(codeReaderFromImage, e.target.result, instance, options).then(res => {
                    return;
                });
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
    if (undefined !== codeReaderFromImage && null !== codeReaderFromImage && id == elementid) {
        codeReaderFromImage.reset();
        codeReaderFromImage = null;
    }
}

// 图片解码并支持反色识别的复用过程
function decodeImageWithFallback(codeReaderImage, dataUrl, instance, options) {
    return codeReaderImage.decodeFromImageUrl(dataUrl).then(result => {
        if (result) {
            vibrate();
            if (debug) console.log(result.text);
            instance.invokeMethodAsync('GetResult', result.text);
        }
    }).catch(err => {
        if (options?.debug) console.log(err);
        if (options?.ALSO_INVERTED) {
            if (options.debug) console.log('尝试反色解码图片...');
            tryInvertedDecodeFromImage(codeReaderImage, dataUrl, instance, options);
        } else {
            instance.invokeMethodAsync('GetError', (err && err.message) || '解码失败');
        }
    });
}

// 反色解码图片（灰度反色）
function tryInvertedDecodeFromImage(codeReaderImage, imageUrl, instance, options) {
    const img = new Image();
    img.onload = () => {
        let base64Data = videoToDataURL(img);
        codeReaderImage.decodeFromImageUrl(base64Data).then(result => {
            if (options.debug) console.log('反色解码成功:', result);
            instance.invokeMethodAsync('GetResult', result.text);
            vibrate();
        }).catch(invertErr => {
            if (options.debug) console.log('反色解码也失败:', invertErr);
            instance.invokeMethodAsync('GetError', invertErr?.message || '反色解码失败');
        });
    };
    img.onerror = () => {
        if (options.debug) console.error('图片加载失败');
        instance.invokeMethodAsync('GetError', '图片加载失败');
    };
    img.src = imageUrl;
}


// maxWidth: 缩放到最大宽度,默认800px
function videoToDataURL(video, maxWidth = 800) {
    let targetWidth = video.videoWidth || video.width;
    let targetHeight = video.videoHeight || video.height;
    if (targetWidth > maxWidth) {
        const scale = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(targetHeight * scale);
    }
    // 内存canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // 灰度
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const inv = 255 - gray;
        data[i] = data[i + 1] = data[i + 2] = inv;
    }
    ctx.putImageData(imageData, 0, 0);

    const base64Data = canvas.toDataURL('image/jpeg');
    return base64Data;
}