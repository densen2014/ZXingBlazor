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
/// 条码服务 BarCodes
/// </summary>
public partial class BarCodes : IAsyncDisposable
{
    [Inject][NotNull] private IJSRuntime? JS { get; set; }

    private IJSObjectReference? module;
    private DotNetObjectReference<BarCodes>? objRef;

    /// <summary>
    ///
    /// </summary>
    public ElementReference Element { get; set; }

    /// <summary>
    /// 二维码数据流回调方法/ Generate QRcode callback method
    /// </summary>
    [Parameter]
    public Func<string, Task>? OnQRCodeGen { get; set; }

    /// <summary>
    /// 解码回调方法/ Decode from image callback method
    /// </summary>
    [Parameter]
    public Func<string, Task>? OnDecodeFromImage { get; set; }

    /// <summary>
    /// 错误回调方法/Error callback method
    /// </summary>
    [Parameter]
    public Func<string, Task>? OnError { get; set; }

    /// <summary>
    /// 选项/ZXingOptions
    /// </summary>
    [Parameter]
    public ZXingOptions? Options { get; set; }

    /// <summary>
    /// 二维码宽度/ QR Code width
    /// </summary>
    [Parameter]
    public int QRCodeWidth { get; set; } = 300;

    /// <summary>
    /// 显示从图片解码按钮 / Display decode from the image button
    /// </summary>
    [Parameter]
    public bool ShowSelectFile { get; set; }

    [Parameter]
    public string SelectFileTitle { get; set; }="图片解码";

    /// <summary>
    /// 解码所有编码形式,性能较差, 开启后可用 options.formats 指定编码形式.默认为 false | Decodde All Formats, performance is poor, you can set options.formats to customize specify the encoding formats. The default is false
    /// </summary>
    [Parameter]
    public bool DecodeAllFormats { get; set; } = true;

    // To prevent making JavaScript interop calls during prerendering
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        try
        {
            if (!firstRender) return;
            objRef = DotNetObjectReference.Create(this);
            module = await JS.InvokeAsync<IJSObjectReference>("import", "./_content/ZXingBlazor/BarcodeReader.razor.js" + "?v=" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version); 
         }
        catch (Exception e)
        {
            if (OnError != null) await OnError.Invoke(e.Message);
        }

    }

    [JSInvokable]
    public async Task GetError(string err)
    {
        if (OnError != null) await OnError.Invoke(err);
    }

    /// <summary>
    /// 生成SVG二维码 / Generate SVG QR code
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    public async Task QRCodeGen(string input)
    {
        await module!.InvokeVoidAsync("QRCodeSvg", objRef, input, Element, false, QRCodeWidth);
    }

    /// <summary>
    /// 生成SVG二维码数据流文本 / Generate SVG QR code data flow text
    /// </summary>
    /// <param name="input"></param>
    /// <returns></returns>
    public async Task QRCodeGenSvg(string input)
    {
        await module!.InvokeVoidAsync("QRCodeSvg", objRef, input, Element, true, QRCodeWidth);
    }

    [JSInvokable]
    public async Task GetQRCode(string err)
    {
        if (OnQRCodeGen != null) await OnQRCodeGen.Invoke(err);
    }

    /// <summary>
    /// 选择图片解码 / Select picture decoding
    /// </summary>
    /// <param name="dataUrl">可选直接解码 Base64, DataUrl 格式</param>
    /// <returns></returns>
    public async Task DecodeFromImage(string? dataUrl=null)
    {
        if (Options == null)
        {
            Options = new ZXingOptions()
            {
                DecodeAllFormats = DecodeAllFormats,
                ShowSelectFile=ShowSelectFile,
            };
        }
        if (dataUrl!=null && !dataUrl.StartsWith("data:image"))
        {
            dataUrl = "data:image/jpeg;base64," + dataUrl;
        }
        await module!.InvokeVoidAsync("DecodeFormImage", objRef, Element, Options, dataUrl);
    }

    [JSInvokable]
    public async Task GetResult(string err)
    {
        if (OnDecodeFromImage != null) await OnDecodeFromImage.Invoke(err);
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        if (module is not null)
        {
            await module.DisposeAsync();
        }
        objRef?.Dispose();
    }

}
