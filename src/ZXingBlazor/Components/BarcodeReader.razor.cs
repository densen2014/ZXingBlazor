// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Diagnostics.CodeAnalysis;

namespace ZXingBlazor.Components;

/// <summary>
/// 条码扫描 BarcodeScanner
/// </summary>
public partial class BarcodeReader: IAsyncDisposable
{

    private IJSObjectReference? module;

    private DotNetObjectReference<BarcodeReader>? objRef;

    [Inject][NotNull] IJSRuntime? JS { get; set; }

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
    ///
    /// </summary>
    public ElementReference Element { get; set; }

    // To prevent making JavaScript interop calls during prerendering
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        try
        {
            if (!firstRender) return;
            objRef = DotNetObjectReference.Create(this);
            module = await JS.InvokeAsync<IJSObjectReference>("import", "./_content/ZXingBlazor/lib/zxing/zxingjs.js" + "?v=" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version);
            if (Options == null)
            {
                Options = new ZXingOptions()
                {
                    Pdf417 = Pdf417Only,
                    Decodeonce = Decodeonce,
                    DecodeAllFormats = DecodeAllFormats
                };
            }
            await module.InvokeVoidAsync("init", objRef, Element, Element.Id, Options);
        }
        catch (Exception e)
        {
            if (OnError != null) await OnError.Invoke(e.Message);
        }

    }

    [JSInvokable]
    public async Task GetResult(string val) => await ScanResult.InvokeAsync(val);

    [JSInvokable]
    public async Task CloseScan() => await Close.InvokeAsync();

    [JSInvokable]
    public async Task GetError(string err)
    {
        if (OnError != null) await OnError.Invoke(err);
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        if (module is not null)
        {
            await module.InvokeVoidAsync("destroy", Element.Id);
            await module.DisposeAsync();
        }
        objRef?.Dispose();
    }

}
