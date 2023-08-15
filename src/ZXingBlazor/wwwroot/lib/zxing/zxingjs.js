import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
var codeReader = null;
var id = null;
var supportsVibrate = false;
export function init(wrapper, element, elementid, options) {
    console.log('init' + elementid);
    id = elementid;
    let selectedDeviceId;
    const sourceSelect = element.querySelector("[data-action=sourceSelect]");
    const sourceSelectPanel = element.querySelector("[data-action=sourceSelectPanel]");
    let startButton = element.querySelector("[data-action=startButton]");
    let resetButton = element.querySelector("[data-action=resetButton]");
    let closeButton = element.querySelector("[data-action=closeButton]");
    supportsVibrate = "vibrate" in navigator;

    console.log('init' + startButton.innerHTML);

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
            selectedDeviceId = videoInputDevices[0].deviceId
            console.log('videoInputDevices:' + videoInputDevices.length);
            if (videoInputDevices.length > 1) {
                videoInputDevices.forEach((element) => {
                    const sourceOption = document.createElement('option');
                    sourceOption.text = element.label
                    sourceOption.value = element.deviceId
                    sourceSelect.appendChild(sourceOption)
                    selectedDeviceId = element.deviceId;
                })

                sourceSelect.onchange = () => {
                    selectedDeviceId = sourceSelect.value;
                    codeReader.reset();
                    StartScan();
                }

                sourceSelectPanel.style.display = 'block'
            }

            StartScan();

            startButton.addEventListener('click', () => {
                StartScan();
            })

            function StartScan() {
                if (options.decodeonce) {
                    codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                        console.log(result)
                        if (supportsVibrate) navigator.vibrate(1000);
                        console.log('autostop');
                        codeReader.reset();
                        return wrapper.invokeMethodAsync("GetResult", result.text);
                    }).catch((err) => {
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            wrapper.invokeMethodAsync("GetError", err + '');
                        }
                    })
                } else {
                    codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
                        if (result) {
                            console.log(result)
                            if (supportsVibrate) navigator.vibrate(1000);
                            console.log('None-stop');
                            wrapper.invokeMethodAsync("GetResult", result.text);
                        }
                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.log(err)
                            wrapper.invokeMethodAsync("GetError", err + '');
                        }
                    })
                }

                var x = `decodeContinuously`;
                if (options.decodeonce) x = `decodeOnce`;
                console.log(`Started ` + x + ` decode from camera with id ${selectedDeviceId}`)
            }

            resetButton.addEventListener('click', () => {
                codeReader.reset();
                console.log('Reset.')
            })

            closeButton.addEventListener('click', () => {
                codeReader.reset();
                console.log('closeButton.')
                wrapper.invokeMethodAsync("CloseScan");
            })

        })
        .catch((err) => {
            console.log(err)
            wrapper.invokeMethodAsync("GetError", err + '');
        })

}

export function QRCodeSvg(wrapper, input, element, tobase64,size=300) {
    const codeWriter = new ZXing.BrowserQRCodeSvgWriter()

    console.log('ZXing code writer initialized')

    if (tobase64) {
        const elementTemp = document.createElement('elementTemp');
        codeWriter.writeToDom(elementTemp, input, size, size)
        let svgElement = elementTemp.firstChild
        const svgData = (new XMLSerializer()).serializeToString(svgElement)
        //const blob = new Blob([svgData])
        wrapper.invokeMethodAsync("GetQRCode", svgData);
    } else {
        codeWriter.writeToDom(element.querySelector("[data-action=result]"), input, size, size)
    }
}

export function DecodeFormImage(wrapper, element, options) {
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
                    wrapper.invokeMethodAsync('GetResult', result.text)
                }
            }).catch((err) => {
                if (err) {
                    console.log(err)
                    wrapper.invokeMethodAsync('GetError', err.message)
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