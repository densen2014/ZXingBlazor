# Blazor Viewerjs 组件

封装Viewer.js库

示例:

https://zxingblazor.app1.es/

使用方法:

1.nuget包

```ZXingBlazor```

2._Imports.razor 文件 或者页面添加 添加组件库引用

```@using ZXingBlazor.Components```


3.razor页面

    <BarcodeReader ScanResult="((e) => { BarCode=e; ShowScanBarcode = !ShowScanBarcode; })"
                   ShowScanBarcode="ShowScanBarcode"
                   Close="(()=>ShowScanBarcode=!ShowScanBarcode)" />

@code{

    /// <summary>
    /// 显示扫码界面
    /// </summary>
    bool ShowScanBarcode { get; set; } = false;

    /// <summary>
    /// 条码
    /// </summary>
    public string? BarCode { get; set; }



} 