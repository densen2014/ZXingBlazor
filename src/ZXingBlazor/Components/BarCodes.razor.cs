﻿// ********************************** 
// Densen Informatica 中讯科技 
// 作者：Alex Chow
// e-mail:zhouchuanglin@gmail.com 
// **********************************

using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Options;
using Microsoft.JSInterop;
using System.Diagnostics.CodeAnalysis;

namespace ZXingBlazor.Components;

/// <summary>
/// 条码服务 BarCodes
/// </summary>
public partial class BarCodes : IAsyncDisposable
{
    [Inject][NotNull] IJSRuntime? JS { get; set; } 

    private IJSObjectReference? module;
    private DotNetObjectReference<BarCodes>? objRef;

    /// <summary>
    ///
    /// </summary>
    public ElementReference advElement { get; set; }

    /// <summary>
    /// 二维码数据流回调方法/ callback method
    /// </summary>
    [Parameter]
    public Func<string, Task>? OnQRCodeGen { get; set; }

    /// <summary>
    /// 解码回调方法/ callback method
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
            module = await JS.InvokeAsync<IJSObjectReference>("import", "./_content/ZXingBlazor/lib/zxing/zxingjs.js" + "?v=" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version);
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

    public async Task QRCodeGen(string input)
    {
        await module!.InvokeVoidAsync("QRCodeSvg",  objRef, input,advElement, false);
    }

    public async Task QRCodeGenSvg(string input)
    {
        await module!.InvokeVoidAsync("QRCodeSvg",  objRef, input,advElement, true);
    }

    [JSInvokable]
    public async Task GetQRCode(string err)
    {
        if (OnQRCodeGen != null) await OnQRCodeGen.Invoke(err);
    }

    public async Task DecodeFromImage()
    {
        if (Options == null)
        {
            Options = new ZXingOptions()
            {
                DecodeAllFormats = DecodeAllFormats
            };
        }
        await module!.InvokeVoidAsync("DecodeFormImage", objRef, advElement, Options);
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
