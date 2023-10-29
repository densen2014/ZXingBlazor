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
/// 手写签名 Handwritten
/// </summary>
public partial class Handwritten : IAsyncDisposable
{
    [Inject][NotNull] private IJSRuntime? JS { get; set; }

    /// <summary>
    /// Handwritten 手写签名
    /// </summary>
    [Parameter]
    public EventCallback<string> HandwrittenBase64 { get; set; }

    /// <summary>
    /// 关闭扫码框回调方法
    /// </summary>
    [Parameter]
    public EventCallback Close { get; set; }


    /// <summary>
    /// 扫码结果
    /// </summary>
    [Parameter]
    public string? Result { get; set; }

    /// <summary>
    /// 显示扫码框
    /// </summary>
    [Parameter]
    public bool ShowHandwritten { get; set; }

    private IJSObjectReference? module;

    // To prevent making JavaScript interop calls during prerendering
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;
        module = await JS.InvokeAsync<IJSObjectReference>("import", "./_content/ZXingBlazor/lib/handwritten/handwritten.js" + "?v=" + System.Reflection.Assembly.GetExecutingAssembly().GetName().Version);
        await module.InvokeVoidAsync("init", DotNetObjectReference.Create(this), null);
    }

    [JSInvokable("invokeFromJS")]
    public async Task ChangeValue(string val)
    {
        Result = val;
        StateHasChanged();
        await HandwrittenBase64.InvokeAsync(val);
        //return Task.CompletedTask;
    }


    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        if (module is not null)
        {
            //await module.InvokeVoidAsync("destroy",null);
            await module.DisposeAsync();
        }
    }
}
