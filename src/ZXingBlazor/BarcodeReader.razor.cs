// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.ComponentModel;
using System.Diagnostics.CodeAnalysis; 

namespace ZXingBlazor.Components;

/// <summary>
/// 条码扫描 BarcodeScanner
/// </summary>
public partial class BarcodeReader : IAsyncDisposable
{

    [Inject]
    [NotNull]
    private IJSRuntime? JSRuntime { get; set; }

    private IJSObjectReference? Module { get; set; }

    private DotNetObjectReference<BarcodeReader>? Instance { get; set; }

    private bool _disposed;

    [NotNull]
    private StorageService? Storage { get; set; }

    /// <summary>
    /// 扫码按钮文本/Scan button title
    /// </summary>
    [Parameter]
    public string ScanBtnTitle { get; set; } = "扫码";

    /// <summary>
    /// 复位按钮文本/Reset button title
    /// </summary>
    [Parameter]
    public string ResetBtnTitle { get; set; } = "复位";

    /// <summary>
    /// 关闭按钮文本/Close button title
    /// </summary>
    [Parameter]
    public string CloseBtnTitle { get; set; } = "关闭";

    /// <summary>
    /// 选择设备按钮文本/Select device button title
    /// </summary>
    [Parameter]
    public string SelectDeviceBtnTitle { get; set; } = "选择设备";

    /// <summary>
    /// 扫码结果回调方法/Scan result callback method
    /// </summary>
    [Parameter]
    public EventCallback<string> ScanResult { get; set; }

    /// <summary>
    /// 扫码成功时捕获当前画面/Capture the current frame when a scan succeeds
    /// </summary>
    [Parameter]
    public bool CaptureStillOnScan { get; set; }

    /// <summary>
    /// 捕获后恢复实时预览的延迟（毫秒）/Delay before resuming the live preview after capture
    /// </summary>
    [Parameter]
    public int CaptureStillAutoResumeDelay { get; set; } = 3000;

    /// <summary>
    /// 扫码及画面捕获回调/Scan and captured frame callback
    /// </summary>
    [Parameter]
    public EventCallback<ScanCapturedEventArgs> ScanCaptured { get; set; }

    /// <summary>
    /// 关闭扫码框回调方法/Close scan code callback method
    /// </summary>
    [Parameter]
    public EventCallback Close { get; set; }

    /// <summary>
    /// 错误回调方法/Error callback method
    /// </summary>
    [Parameter]
    public Func<string, Task>? OnError { get; set; }

    /// <summary>
    /// 使用内置DIV/Use builtin Div
    /// </summary>
    [Parameter] public bool UseBuiltinDiv { get; set; } = true;

    /// <summary>
    /// 内置DIV 风格/builtin Div style
    /// </summary>
    [Parameter] public ZXingBlazorStyle Style { get; set; } = ZXingBlazorStyle.Modal;

    /// <summary>
    /// 只解码 Pdf417 格式 / decode only Pdf417 format
    /// </summary>
    [Parameter]
    public bool Pdf417Only { get; set; }

    /// <summary>
    /// 单次|连续解码,默认单次 / Decode Once or Decode Continuously, default is Once
    /// </summary>
    [Parameter]
    public bool Decodeonce { get; set; } = true;

    /// <summary>
    /// 解码所有编码形式,性能较差, 开启后可用 options.formats 指定编码形式.默认为 false | Decodde All Formats, performance is poor, you can set options.formats to customize specify the encoding formats. The default is false
    /// </summary>
    [Parameter]
    public bool DecodeAllFormats { get; set; }

    /// <summary>
    /// 选项/ZXingOptions
    /// </summary>
    [Parameter]
    public ZXingOptions? Options { get; set; }

    /// <summary>
    /// UI界面元素的引用对象
    /// </summary>
    public ElementReference Element { get; set; }

    /// <summary>
    /// 指定摄像头设备ID
    /// </summary>
    [Parameter]
    public string? DeviceID { get; set; }

    /// <summary>
    /// 保存最后使用设备ID下次自动调用
    /// </summary>
    [Parameter]
    public bool SaveDeviceID { get; set; } = true;

    /// <summary>
    /// 录屏解码 (手机不支持)
    /// </summary>
    [Parameter]
    public bool Screenshot { get; set; }

    /// <summary>
    /// 使用zxing内置视频流打开方式,默认 false
    /// </summary>
    [Obsolete("This option is deprecated and will be removed in future versions. The library now uses the built-in video stream handling by default. 此选项已弃用，将在未来的版本中移除。库现在默认使用内置的视频流处理功能。")]
    [Parameter]
    public bool StreamFromZxing { get; set; }

    /// <summary>
    /// 反色识别,启用后可识别反色条码/二维码（黑底白码） / Enable invert-colors recognition for inverted barcodes/QR codes (white on black)
    /// </summary>
    [Parameter]
    public bool AlsoInverted { get; set; } = true;

    // To prevent making JavaScript interop calls during prerendering
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        try
        {
            if (!firstRender || _disposed)
            {
                return;
            }

            Storage ??= new StorageService(JSRuntime);
            var module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./_content/ZXingBlazor/BarcodeReader.razor.js" + "?v=" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version);
            if (_disposed)
            {
                await module.DisposeAsync();
                return;
            }

            Module = module;
            Instance = DotNetObjectReference.Create(this);
            try
            {
                if (SaveDeviceID)
                {
                    DeviceID = await Storage.GetValue("CamsDeviceID", DeviceID);
                }
            }
            catch (Exception)
            {

            }
            if (_disposed)
            {
                return;
            }

            Options ??= new()
            {
                Pdf417 = Pdf417Only,
                Decodeonce = Decodeonce,
                DecodeAllFormats = DecodeAllFormats,
                Screenshot = Screenshot, 
                DeviceID = DeviceID,
                ALSO_INVERTED = AlsoInverted,
                //TRY_HARDER = true
                Debug = true
            };
            Options.CaptureStillOnScan = CaptureStillOnScan;
            Options.CaptureStillAutoResumeDelay = Math.Max(0, CaptureStillAutoResumeDelay);
            await module.InvokeVoidAsync("init", Instance, Element, Element.Id, Options, DeviceID);
        }
        catch (Exception e)
        {
            if (!_disposed && OnError != null)
            {
                await OnError.Invoke(e.Message);
            }
        }

    }

    public async Task Start()
    {
        await Module!.InvokeVoidAsync("start", Element.Id);
    }

    public async Task Stop()
    {
        await Module!.InvokeVoidAsync("stop", Element.Id);
    }

    public async Task Reload()
    {
        await Module!.InvokeVoidAsync("reload", Element.Id);
    }

    [JSInvokable]
    public async Task GetResult(string val) => await ScanResult.InvokeAsync(val);

    [JSInvokable]
    public async Task GetCapturedResult(string text, IJSStreamReference imageStream)
    {
        try
        {
            const long maxCaptureSize = 10 * 1024 * 1024;
            await using var streamReference = imageStream;
            await using var captureStream = await streamReference.OpenReadStreamAsync(maxCaptureSize);
            using var buffer = new MemoryStream();
            await captureStream.CopyToAsync(buffer);

            await ScanCaptured.InvokeAsync(new ScanCapturedEventArgs
            {
                Text = text,
                ImageDataUrl = $"data:image/jpeg;base64,{Convert.ToBase64String(buffer.ToArray())}"
            });
        }
        finally
        {
            await ScanResult.InvokeAsync(text);
        }
    }

    [JSInvokable]
    public async Task CloseScan() => await Close.InvokeAsync();

    [JSInvokable]
    public async Task GetError(string err)
    {
        if (OnError != null)
        {
            await OnError.Invoke(err);
        }
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        _disposed = true;
        var module = Module;
        Module = null;
        var instance = Instance;
        Instance = null;

        try
        {
            if (module is not null)
            {
                try
                {
                    await module.InvokeVoidAsync("destroy", Element.Id);
                }
                catch (JSDisconnectedException)
                {
                    // The circuit/runtime is already gone, so there is no JS-side state to clean up.
                }

                await module.DisposeAsync();
            }
        }
        finally
        {
            instance?.Dispose();
        }
    }

    /// <summary>
    /// 选择摄像头回调方法
    /// </summary>
    /// <param name="base64encodedstring"></param>
    /// <returns></returns>
    [JSInvokable]
    public async Task SelectDeviceID(string deviceID, string deviceName)
    {
        try
        {
            if (SaveDeviceID)
            {
                await Storage.SetValue("CamsDeviceID", deviceID);
                await Storage.SetValue("CamsDeviceName", deviceName);
            }
        }
        catch
        {
        }
    }

    #region StorageService
    private class StorageService
    {
        private readonly IJSRuntime JSRuntime;

        public StorageService(IJSRuntime jsRuntime)
        {
            JSRuntime = jsRuntime;
        }

        public async Task SetValue<TValue>(string key, TValue value)
        {
            await JSRuntime.InvokeVoidAsync("eval", $"localStorage.setItem('{key}', '{value}')");
        }

        public async Task<TValue?> GetValue<TValue>(string key, TValue? def)
        {
            try
            {
                var cValue = await JSRuntime.InvokeAsync<TValue>("eval", $"localStorage.getItem('{key}');");
                return cValue ?? def;
            }
            catch
            {
                var cValue = await JSRuntime.InvokeAsync<string>("eval", $"localStorage.getItem('{key}');");
                if (cValue == null)
                {
                    return def;
                }

                var newValue = GetValueI<TValue>(cValue);
                return newValue ?? def;

            }
        }

        public static T? GetValueI<T>(string value)
        {
            TypeConverter converter = TypeDescriptor.GetConverter(typeof(T));
            if (converter != null)
            {
                return (T?)converter.ConvertFrom(value);
            }
            return default;
        }

        public async Task RemoveValue(string key)
        {
            await JSRuntime.InvokeVoidAsync("eval", $"localStorage.removeItem('{key}')");
        }


    }
    #endregion
}
