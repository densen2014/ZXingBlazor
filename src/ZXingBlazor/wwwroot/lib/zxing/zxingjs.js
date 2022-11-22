import '/_content/ZXingBlazor/lib/zxing/zxing.min.js';
var codeReader = null;
var id = null;
export function init(autostop, wrapper, element, elementid, options) {
    console.log('init' + elementid);
    id = elementid;
    let selectedDeviceId;
    const sourceSelect = element.querySelector("[data-action=sourceSelect]");
    const sourceSelectPanel = element.querySelector("[data-action=sourceSelectPanel]");
    let startButton = element.querySelector("[data-action=startButton]");
    let resetButton = element.querySelector("[data-action=resetButton]");
    let closeButton = element.querySelector("[data-action=closeButton]");

    console.log('init' + startButton.innerHTML);
    if (options.pdf417) {
        codeReader = new ZXing.BrowserPDF417Reader();
        console.log('ZXing code PDF417 reader initialized')
    } else {
        //const codeReader = new ZXing.BrowserBarcodeReader()
        codeReader = new ZXing.BrowserMultiFormatReader()
        console.log('ZXing code reader initialized')
    }
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

            StartScan(autostop);

            startButton.addEventListener('click', () => {
                StartScan();
            })

            function StartScan(autostop) {
                codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then((result) => {
                    console.log(result)
                    
                    var supportsVibrate = "vibrate" in navigator;
                    if (supportsVibrate) navigator.vibrate(1000);

                    if (autostop) {
                        console.log('autostop');
                        codeReader.reset();
                        return wrapper.invokeMethodAsync("GetResult", result.text);
                    } else {
                        console.log('None-stop');
                        codeReader.reset();
                        wrapper.invokeMethodAsync("GetResult", result.text);
                    }

                }).catch((err) => {
                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        console.log(err)
                        wrapper.invokeMethodAsync("GetError", err + '');
                    }
                })
                console.log(`Started continous decode from camera with id ${selectedDeviceId}`)
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
export function destroy(elementid) {
    if (undefined !== codeReader && null !== codeReader && id == elementid) {
        codeReader.reset();
        codeReader = null;
        //id = null;
        console.log(id, 'destroy');
    }
}