//https://github.com/densen2014/ZXingBlazor/issues/42
//import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
import './lib/zxing/zxing.min.js';

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
let lifecycleVersion = 0;

function stopStream(stream) {
    if (!stream) return;
    try {
        stream.getTracks().forEach(t => {
            try { t.stop(); } catch { }
        });
    } catch { }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function findVideoElement(container = element) {
    if (!container) return null;
    // prefer explicit data-action
    let video = container.querySelector("[data-action=video]");
    if (video) return video;
    // fallback to any video element inside the container
    video = container.querySelector("video");
    if (video) return video;
    // fallback to global video id if present
    video = document.getElementById("video");
    return video;
}

async function waitForVideoElement(timeoutMs = 2000, container = element) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const v = findVideoElement(container);
        if (v) return v;
        await sleep(100);
    }
    return null;
}

function isActiveLifecycle(version, elementid, elementRef) {
    return lifecycleVersion === version && id === elementid && element === elementRef;
}

function captureVideoFrame(video) {
    const sourceWidth = video.videoWidth || video.width;
    const sourceHeight = video.videoHeight || video.height;
    if (!sourceWidth || !sourceHeight) {
        throw new Error('The video frame is not ready for capture.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, sourceWidth, sourceHeight);
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('The browser could not encode the captured frame.'));
            }
        }, 'image/jpeg', options?.quality ?? 0.9);
    });
}

function reportScanResult(text, video, version, elementid, elementRef) {
    if (!isActiveLifecycle(version, elementid, elementRef)) return false;
    if (options?.captureStillOnScan && elementRef._captureInProgress) return false;

    if (options?.captureStillOnScan) {
        try {
            const imageBlob = captureVideoFrame(video);
            elementRef._captureInProgress = true;
            try { video.pause(); } catch { }
            imageBlob
                .then(blob => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) return;
                    const streamReference = DotNet.createJSStreamReference(blob);
                    instance?.invokeMethodAsync("GetCapturedResult", text, streamReference)
                        .catch(err => {
                            if (debug) console.warn('Unable to deliver captured frame', err);
                        });
                }, err => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) return;
                    instance?.invokeMethodAsync('GetError', `Unable to capture scanned frame: ${err?.message || err}`);
                    instance?.invokeMethodAsync("GetResult", text);
                });

            const resumeDelay = Math.max(0, options.captureStillAutoResumeDelay ?? 3000);
            elementRef._captureResumeTimer = setTimeout(() => {
                elementRef._captureResumeTimer = null;
                elementRef._captureInProgress = false;
                if (isActiveLifecycle(version, elementid, elementRef)) {
                    video.play()?.catch(err => {
                        if (debug) console.warn('Unable to resume video after still capture', err);
                    });
                }
            }, resumeDelay);
        } catch (err) {
            instance?.invokeMethodAsync('GetError', `Unable to capture scanned frame: ${err?.message || err}`);
            instance?.invokeMethodAsync("GetResult", text);
        }
    } else {
        instance?.invokeMethodAsync("GetResult", text);
    }

    vibrate();
    return true;
}

async function ensureVideoPlaying(video, stream, timeoutMs = 2000) {
    if (!video) return Promise.reject(new Error('No video element'));
    video.srcObject = stream;
    try {
        await video.play();
    } catch (err) {
        // Some browsers require user gesture; still wait for ready state
    }
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            if (video.readyState >= 2 || (video.videoWidth > 0 && video.videoHeight > 0)) {
                return resolve();
            }
            if (Date.now() - start > timeoutMs) {
                return reject(new Error('Video not ready'));
            }
            requestAnimationFrame(check);
        };
        check();
    });
}

async function tryGetUserMediaWithRetries(constraintsList, maxAttempts = 3, baseDelay = 300) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        for (const constraints of constraintsList) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (debug) console.log('getUserMedia success', { attempt, constraints });
                return { stream, constraints };
            } catch (err) {
                if (debug) console.warn('getUserMedia failed', { attempt, constraints, err });
            }
        }
        await sleep(baseDelay * Math.pow(2, attempt));
    }
    throw new Error('All getUserMedia attempts failed');
}

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

async function populateVideoInputDevicesAndSelect(sourceSelect, sourceSelectPanel, version, elementid, elementRef) {
    let devices = await navigator.mediaDevices.enumerateDevices();
    let videoInputDevices = devices.filter(d => d.kind === 'videoinput');

    let needPermission = videoInputDevices.every(d => !d.label);
    let tempStream;
    if (needPermission) {
        try {
            tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            devices = await navigator.mediaDevices.enumerateDevices();
            videoInputDevices = devices.filter(d => d.kind === 'videoinput');
        } catch (err) {
            if (debug) console.warn('Permission request for labels failed', err);
        } finally {
            stopStream(tempStream);
        }
    }

    if (!isActiveLifecycle(version, elementid, elementRef)) return [];
    if (videoInputDevices.length === 0) return [];

    if (deviceID != null) {
        selectedDeviceId = deviceID;
    } else {
        const backDevice = videoInputDevices.find(d => /back|rear|environment|wide/i.test(d.label));
        if (backDevice) selectedDeviceId = backDevice.deviceId;
        else if (videoInputDevices.length > 1) selectedDeviceId = videoInputDevices[1].deviceId;
        else selectedDeviceId = videoInputDevices[0].deviceId;
    }

    if (sourceSelect && videoInputDevices.length > 1) {
        sourceSelect.innerHTML = '';

        if (elementRef._sourceSelectHandler) {
            try { sourceSelect.removeEventListener('change', elementRef._sourceSelectHandler); } catch { }
            elementRef._sourceSelectHandler = null;
        }

        videoInputDevices.forEach((device, idx) => {
            const sourceOption = document.createElement('option');
            sourceOption.text = device.label && device.label.length > 0 ? device.label : ('Camera' + (idx + 1));
            sourceOption.value = device.deviceId;
            if (selectedDeviceId && device.deviceId === selectedDeviceId) sourceOption.selected = true;
            sourceSelect.appendChild(sourceOption);
        });

        elementRef._sourceSelectHandler = () => {
            if (!isActiveLifecycle(version, elementid, elementRef)) return;
            selectedDeviceId = sourceSelect.value;
            instance?.invokeMethodAsync('SelectDeviceID', selectedDeviceId, sourceSelect.options[sourceSelect.selectedIndex].text);
            if (elementRef._activeStream) {
                stopStream(elementRef._activeStream);
                elementRef._activeStream = null;
            }
            if (elementRef._invertedStream) {
                stopStream(elementRef._invertedStream);
                elementRef._invertedStream = null;
            }
            try { codeReader.reset(); } catch { }
            start(id);
        };
        sourceSelect.addEventListener('change', elementRef._sourceSelectHandler);
        sourceSelectPanel.style.display = 'block';
    }

    return videoInputDevices;
}

export function load(elementid) {
    if (id != elementid) return;

    const elementRef = element;
    const version = ++lifecycleVersion;
    if (elementRef._domWatcher) {
        try { clearInterval(elementRef._domWatcher); } catch { }
        elementRef._domWatcher = null;
    }
    if (elementRef._captureResumeTimer) {
        try { clearTimeout(elementRef._captureResumeTimer); } catch { }
        elementRef._captureResumeTimer = null;
    }
    elementRef._captureInProgress = false;
    const sourceSelect = elementRef.querySelector("[data-action=sourceSelect]") || elementRef.querySelector("select[data-action=sourceSelect]");
    const sourceSelectPanel = elementRef.querySelector("[data-action=sourceSelectPanel]") || elementRef.querySelector("[data-action=sourceSelectPanel]");
    codeReader = genCodeReaderImage(options);
    codeReader.timeBetweenDecodingAttempts = options.timeBetweenDecodingAttempts;

    if (options.screenshot && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
            .getDisplayMedia({ video: true, audio: false })
            .then((stream) => {
                if (!isActiveLifecycle(version, elementid, elementRef)) {
                    stopStream(stream);
                    return;
                }
                if (options.ALSO_INVERTED) {
                    codeReaderFromImage = genCodeReaderImage(options);
                    const video = findVideoElement(elementRef);
                    if (video) {
                        video.srcObject = stream;
                        video.play();
                        let timer = setInterval(() => {
                            if (!isActiveLifecycle(version, elementid, elementRef)) {
                                clearInterval(timer);
                                stopStream(stream);
                                return;
                            }
                            if (video.videoWidth > 0 && video.videoHeight > 0) {
                                let base64Data = videoToDataURL(video, 1200);
                                codeReaderFromImage.decodeFromImageUrl(base64Data)
                                    .then(result => {
                                        if (!isActiveLifecycle(version, elementid, elementRef)) return;
                                        if (result && result.text) {
                                            if (debug) console.log('[反色定时解码] 结果:', result.text);
                                            if (reportScanResult(result.text, video, version, elementid, elementRef) && options.decodeonce && !options.captureStillOnScan) {
                                                if (debug) console.log('autostop');
                                                codeReaderFromImage.reset();
                                                codeReader.reset();
                                                clearInterval(timer);
                                                return;
                                            }
                                        }
                                    })
                                    .catch(err => { });
                            }
                        }, 100);
                        video.addEventListener('ended', () => clearInterval(timer));
                        video.addEventListener('pause', () => {
                            if (!elementRef._captureInProgress) clearInterval(timer);
                        });
                        elementRef._invertedTimer = timer;
                        elementRef._invertedStream = stream;
                    } else {
                        // No video element available, stop stream to avoid leak
                        stopStream(stream);
                    }
                }

                const videoElem = findVideoElement(elementRef);
                if (videoElem) {
                    codeReader.decodeFromStream(stream, videoElem, (result, err) => {
                        if (!isActiveLifecycle(version, elementid, elementRef)) return;
                        if (result) {
                            if (debug) console.log(result)
                            reportScanResult(result.text, videoElem, version, elementid, elementRef);
                        }
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            instance?.invokeMethodAsync("GetError", err + '');
                        }
                    })
                } else {
                    // no video -> stop stream to avoid camera staying on
                    stopStream(stream);
                    instance?.invokeMethodAsync('GetError', 'No video element available for display');
                }
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
                instance?.invokeMethodAsync('GetError', `An error occurred: ${err}`);
            });
        return;
    }

    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.enumerateDevices)) {
        console.log("Media devices API not fully supported.");
        return;
    }

    if (!options.width) options.width = 640;
    if (!options.height) options.height = 480;
    width = options.width;

    if (elementRef._activeStream) {
        stopStream(elementRef._activeStream);
        elementRef._activeStream = null;
    }
    if (elementRef._invertedStream) {
        stopStream(elementRef._invertedStream);
        elementRef._invertedStream = null;
    }

    populateVideoInputDevicesAndSelect(sourceSelect, sourceSelectPanel, version, elementid, elementRef)
        .then(videoInputDevices => {
            if (!isActiveLifecycle(version, elementid, elementRef)) return;
            const tryConstraints = [];

            if (selectedDeviceId) {
                tryConstraints.push({
                    video: {
                        deviceId: { exact: selectedDeviceId },
                        width: { ideal: options.width },
                        height: { ideal: options.height },
                        facingMode: "environment",
                        focusMode: "continuous"
                    },
                    audio: false
                });
            }

            tryConstraints.push({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: options.width },
                    height: { ideal: options.height },
                    focusMode: "continuous"
                },
                audio: false
            });

            tryConstraints.push({
                video: true,
                audio: false
            });

            tryGetUserMediaWithRetries(tryConstraints, 3, 300)
                .then(async ({ stream }) => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) {
                        stopStream(stream);
                        return;
                    }
                    if (elementRef._activeStream && elementRef._activeStream !== stream) {
                        stopStream(elementRef._activeStream);
                    }
                    elementRef._activeStream = stream;

                    // wait for a video element if not present yet (custom layout)
                    let videoElem = findVideoElement(elementRef);
                    if (!videoElem) {
                        videoElem = await waitForVideoElement(1500, elementRef);
                    }
                    if (!isActiveLifecycle(version, elementid, elementRef)) {
                        stopStream(stream);
                        return;
                    }

                    if (videoElem) {
                        try {
                            await ensureVideoPlaying(videoElem, stream, 2500);
                        } catch (err) {
                            if (debug) console.warn('Video play/readiness failed, but continuing', err);
                        }
                    } else {
                        if (debug) console.warn('No video element available after wait; stream kept but not attached');
                    }

                    try {
                        const videoTrack = stream.getVideoTracks()[0];
                        const settings = videoTrack.getSettings ? videoTrack.getSettings() : null;
                        if (!selectedDeviceId && settings && settings.deviceId) {
                            selectedDeviceId = settings.deviceId;
                        }
                    } catch { }

                    // set up DOM/visibility watcher to auto-stop if element removed or hidden
                    if (!elementRef._domWatcher) {
                        elementRef._domWatcher = setInterval(() => {
                            try {
                                if (!document.body.contains(elementRef)) {
                                    if (isActiveLifecycle(version, elementid, elementRef)) {
                                        try { destroy(elementid); } catch { }
                                    }
                                    return;
                                }
                                // check visibility: if element not visible -> stop streams (but keep state)
                                const style = window.getComputedStyle(elementRef);
                                const isVisible = elementRef.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden' && elementRef.offsetWidth > 0 && elementRef.offsetHeight > 0;
                                if (!isVisible) {
                                    if (debug) console.log('Element hidden; stopping streams');
                                    try { stop(elementid); } catch { }
                                }
                            } catch { }
                        }, 1000);
                    }

                    if (isActiveLifecycle(version, elementid, elementRef)) {
                        start(elementid);
                    }
                })
                .catch(err => {
                    if (isActiveLifecycle(version, elementid, elementRef)) {
                        console.error('Failed to getUserMedia after retries', err);
                        instance?.invokeMethodAsync('GetError', `An error occurred: ${err}`);
                    }
                });
        })
        .catch(err => {
            if (isActiveLifecycle(version, elementid, elementRef)) {
                console.error('Device enumeration failed', err);
                instance?.invokeMethodAsync('GetError', `An error occurred: ${err}`);
            }
        });
}

export function start(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        const version = lifecycleVersion;
        const elementRef = element;

        if (options?.ALSO_INVERTED) {
            if (elementRef._invertedStream) {
                stopStream(elementRef._invertedStream);
                elementRef._invertedStream = null;
            }
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) {
                        stopStream(stream);
                        return;
                    }
                    codeReaderFromImage = genCodeReaderImage(options);
                    const video = findVideoElement(elementRef);
                    if (video) {
                        video.srcObject = stream;
                        video.play();
                        let timer = setInterval(() => {
                            if (!isActiveLifecycle(version, elementid, elementRef)) {
                                clearInterval(timer);
                                stopStream(stream);
                                return;
                            }
                            if (video.videoWidth > 0 && video.videoHeight > 0) {
                                let base64Data = videoToDataURL(video);
                                codeReaderFromImage.decodeFromImageUrl(base64Data)
                                    .then(result => {
                                        if (!isActiveLifecycle(version, elementid, elementRef)) return;
                                        if (result && result.text) {
                                            if (debug) console.log('[反色定时解码] 结果:', result.text);
                                            if (reportScanResult(result.text, video, version, elementid, elementRef) && options.decodeonce && !options.captureStillOnScan) {
                                                if (debug) console.log('autostop');
                                                codeReaderFromImage.reset();
                                                codeReader.reset();
                                                clearInterval(timer);
                                                stopStream(stream);
                                                return;
                                            }
                                        }
                                    })
                                    .catch(err => { });
                            }
                        }, 100);
                        video.addEventListener('ended', () => clearInterval(timer));
                        video.addEventListener('pause', () => {
                            if (!elementRef._captureInProgress) clearInterval(timer);
                        });
                        elementRef._invertedTimer = timer;
                        elementRef._invertedStream = stream;
                    } else {
                        stopStream(stream);
                    }
                })
                .catch((err) => {
                    if (isActiveLifecycle(version, elementid, elementRef) && debug) {
                        console.error('摄像头测试模式错误:', err);
                    }
                });
        }

        const callback = (result, err) => {
            if (!isActiveLifecycle(version, elementid, elementRef)) return;
            if (result) {
                if (debug) console.log(result)
                reportScanResult(result.text, findVideoElement(elementRef), version, elementid, elementRef);
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.log(err)
                instance?.invokeMethodAsync("GetError", err + '');
            }
        };

        // Try to attach to controlled stream if present
        const videoElem = findVideoElement(elementRef);
        if (elementRef._activeStream) {
            if (!videoElem) {
                // try briefly to wait for a video element before attaching
                waitForVideoElement(1500, elementRef).then(v => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) return;
                    if (v) {
                        try { codeReader.reset(); } catch { }
                        codeReader.decodeFromStream(elementRef._activeStream, v, callback);
                        if (debug) console.log('decodeFromStream used with controlled stream (delayed attach)');
                    } else {
                        if (debug) console.warn('No video element to attach controlled stream');
                        // still call decodeFromVideoDevice fallback so ZXing handles stream creation
                        if (options.decodeonce && !options.captureStillOnScan) {
                            codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then(r => {
                                if (r && isActiveLifecycle(version, elementid, elementRef)) {
                                    reportScanResult(r.text, findVideoElement(elementRef), version, elementid, elementRef);
                                }
                            }).catch(e => {
                                if (isActiveLifecycle(version, elementid, elementRef) && e && !(e instanceof ZXing.NotFoundException)) {
                                    instance?.invokeMethodAsync("GetError", e + '');
                                }
                            });
                        } else {
                            codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', callback);
                        }
                    }
                });
            } else {
                try { codeReader.reset(); } catch { }
                codeReader.decodeFromStream(elementRef._activeStream, videoElem, callback);
                if (debug) console.log('decodeFromStream used with controlled stream');
            }
        } else {
            // fallback to ZXing device helpers
            if (options.decodeonce && !options.captureStillOnScan) {
                codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                    if (!isActiveLifecycle(version, elementid, elementRef)) return;
                    if (debug) console.log(result)
                    reportScanResult(result.text, findVideoElement(elementRef), version, elementid, elementRef);
                    if (debug) console.log('autostop');
                    codeReader.reset();
                }).catch((err) => {
                    if (isActiveLifecycle(version, elementid, elementRef) && err && !(err instanceof ZXing.NotFoundException)) {
                        console.log(err)
                        instance?.invokeMethodAsync("GetError", err + '');
                    }
                })
            } else {
                codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', callback)
            }
        }

        var x = `decodeContinuously`;
        if (options.decodeonce && !options.captureStillOnScan) x = `decodeOnce`;
        if (debug) console.log(`Started ` + x + ` decode from camera with id ${selectedDeviceId}`)
        if (debug) console.log(id, 'start');
    }
}

export function stop(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        try { codeReader.reset(); } catch { }
        if (element && element._activeStream) {
            stopStream(element._activeStream);
            element._activeStream = null;
        }
        if (element && element._invertedStream) {
            stopStream(element._invertedStream);
            element._invertedStream = null;
        }
        if (element && element._invertedTimer) {
            try { clearInterval(element._invertedTimer); } catch { }
            element._invertedTimer = null;
        }
        if (element && element._captureResumeTimer) {
            try { clearTimeout(element._captureResumeTimer); } catch { }
            element._captureResumeTimer = null;
        }
        if (element) {
            element._captureInProgress = false;
        }
        if (debug) console.log(id, 'stop');
    }
}

export function QRCodeSvg(instance, input, elementRef, tobase64, size = 300) {
    const codeWriter = new ZXing.BrowserQRCodeSvgWriter()

    if (debug) console.log('ZXing code writer initialized')

    if (tobase64) {
        const elementTemp = document.createElement('elementTemp');
        codeWriter.writeToDom(elementTemp, input, size, size)
        let svgElement = elementTemp.firstChild
        const svgData = (new XMLSerializer()).serializeToString(svgElement)
        instance?.invokeMethodAsync("GetQRCode", svgData);
    } else {
        codeWriter.writeToDom(elementRef.querySelector("[data-action=result]"), input, size, size)
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

export async function DecodeFormImage(instance, elementRef, optionsRef, dataUrl) {
    codeReaderFromImage = genCodeReaderImage(optionsRef);

    if (dataUrl != null) {
        decodeImageWithFallback(codeReaderFromImage, dataUrl, instance, optionsRef).then(res => {
            return;
        });
    }
    else {
        const resetFile = () => {
            let file = elementRef.querySelector('[type="file"]')
            if (file) {
                file.removeEventListener('change', scanImageHandler)
                file.remove()
            }
            file = document.createElement('input')
            file.setAttribute('type', 'file')
            file.setAttribute('hidden', 'true')
            file.setAttribute('accept', 'image/*')
            elementRef.append(file)
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
                decodeImageWithFallback(codeReaderFromImage, e.target.result, instance, optionsRef).then(res => {
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
    if (id == elementid) {
        lifecycleVersion++;
        try { codeReader.reset(); } catch { }
        try { codeReaderFromImage?.reset(); } catch { }

        if (element) {
            if (element._activeStream) {
                stopStream(element._activeStream);
                element._activeStream = null;
            }
            if (element._invertedStream) {
                stopStream(element._invertedStream);
                element._invertedStream = null;
            }
            if (element._invertedTimer) {
                try { clearInterval(element._invertedTimer); } catch { }
                element._invertedTimer = null;
            }
            if (element._domWatcher) {
                try { clearInterval(element._domWatcher); } catch { }
                element._domWatcher = null;
            }
            if (element._captureResumeTimer) {
                try { clearTimeout(element._captureResumeTimer); } catch { }
                element._captureResumeTimer = null;
            }
            element._captureInProgress = false;
            const sourceSelect = element.querySelector("[data-action=sourceSelect]");
            if (sourceSelect && element._sourceSelectHandler) {
                try { sourceSelect.removeEventListener('change', element._sourceSelectHandler); } catch { }
                element._sourceSelectHandler = null;
            }
            const video = findVideoElement();
            if (video) {
                try {
                    video.pause();
                    video.srcObject = null;
                } catch { }
            }
        }

        codeReader = null;
        codeReaderFromImage = null;
        id = null;
        options = null;
        instance = null;
        selectedDeviceId = null;
        deviceID = null;
        element = null;
        debug = false;
    }
}

// 图片解码并支持反色识别的复用过程
function decodeImageWithFallback(codeReaderImage, dataUrl, instanceRef, optionsRef) {
    return codeReaderImage.decodeFromImageUrl(dataUrl).then(result => {
        if (result) {
            vibrate();
            if (debug) console.log(result.text);
            instanceRef?.invokeMethodAsync('GetResult', result.text);
        }
    }).catch(err => {
        if (optionsRef?.debug) console.log(err);
        if (optionsRef?.ALSO_INVERTED) {
            if (optionsRef.debug) console.log('尝试反色解码图片...');
            tryInvertedDecodeFromImage(codeReaderImage, dataUrl, instanceRef, optionsRef);
        } else {
            instanceRef?.invokeMethodAsync('GetError', (err && err.message) || '解码失败');
        }
    });
}

function tryInvertedDecodeFromImage(codeReaderImage, imageUrl, instanceRef, optionsRef) {
    const img = new Image();
    img.onload = () => {
        let base64Data = videoToDataURL(img);
        codeReaderImage.decodeFromImageUrl(base64Data).then(result => {
            if (optionsRef.debug) console.log('反色解码成功:', result);
            instanceRef?.invokeMethodAsync('GetResult', result.text);
            vibrate();
        }).catch(invertErr => {
            if (optionsRef.debug) console.log('反色解码也失败:', invertErr);
            instanceRef?.invokeMethodAsync('GetError', invertErr?.message || '反色解码失败');
        });
    };
    img.onerror = () => {
        if (optionsRef.debug) console.error('图片加载失败');
        instanceRef?.invokeMethodAsync('GetError', '图片加载失败');
    };
    img.src = imageUrl;
}

function videoToDataURL(video, maxWidth = 800) {
    let targetWidth = video.videoWidth || video.width;
    let targetHeight = video.videoHeight || video.height;
    if (targetWidth > maxWidth) {
        const scale = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.round(targetHeight * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const inv = 255 - gray;
        data[i] = data[i + 1] = data[i + 2] = inv;
    }
    ctx.putImageData(imageData, 0, 0);

    const base64Data = canvas.toDataURL('image/jpeg');
    return base64Data;
}
