# Blazor Viewerjs 组件

封装Viewer.js库

示例:

https://zxingblazor.app1.es/handwritten

使用方法:

1.nuget包

```ZXingBlazor```

2._Imports.razor 文件 或者页面添加 添加组件库引用

```@using ZXingBlazor.Components```


3.razor页面

    <Handwritten HandwrittenBase64="((e) => { DrawBase64=e; ShowHandwritten = !ShowHandwritten; })"
                   ShowHandwritten="ShowHandwritten"
                   Close="(()=>ShowHandwritten=!ShowHandwritten)" />

@code{

    /// <summary>
    /// 显示签名界面
    /// </summary>
    bool ShowHandwritten { get; set; } = false;

    /// <summary>
    /// 签名Base64
    /// </summary>
    public string? DrawBase64 { get; set; }



} 