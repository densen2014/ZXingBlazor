# Blazor BarcodeReader 组件

封装 ZXing 条码和二维码扫描。

示例:

https://zxingblazor.app1.es/

使用方法:

1.nuget包

```ZXingBlazor```

2._Imports.razor 文件 或者页面添加 添加组件库引用

```@using ZXingBlazor.Components```


3.razor页面
```
    <BarcodeReader ScanResult="ScanResult"
                   CaptureStillOnScan="true"
                   CaptureStillAutoResumeDelay="3000"
                   ScanCaptured="HandleScanCaptured"
                   Close="(()=>ShowScanBarcode=false)" />
```
```
@code{

    /// <summary>
    /// 显示扫码界面
    /// </summary>
    bool ShowScanBarcode { get; set; } = false;

    /// <summary>
    /// 条码
    /// </summary>
    public string? BarCode { get; set; }

    public string? CapturedImageDataUrl { get; set; }

    private void ScanResult(string text)
    {
        BarCode = text;
    }

    private Task HandleScanCaptured(ScanCapturedEventArgs args)
    {
        CapturedImageDataUrl = args.ImageDataUrl;
        return Task.CompletedTask;
    }

} 
```

`CaptureStillOnScan` 默认为 `false`。启用后，扫码成功时会暂停视频预览，
通过 `ScanCaptured` 返回扫码文本和 JPEG Data URL，并在
`CaptureStillAutoResumeDelay` 指定的毫秒数后恢复实时预览。