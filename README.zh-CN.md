# ZXing Blazor 扫码组件

 <a href="README.md">English</a> |中文

---

## 项目介绍
本项目是利用 ZXing 进行封装的 Blazor 组件库 

## 演示地址  
https://zxingblazor.app1.es


## Nuget 包安装
Install-Package ZXingBlazor -Version 0.1.0

## 使用
Pages/_Host.cshtml

    <script src="_content/ZXingBlazor/lib/barcodereader/zxing.js"></script>
    <script src="_content/ZXingBlazor/lib/barcodereader/barcode.js"></script>

In your Razor page

<button class="btn btn-sm btn-light"
        type="button"
        @onclick="(() => ShowScanBarcode = !ShowScanBarcode)">
    [扫码]
</button> 
<input type="text" class="form-control" style="min-width: 100px;"
       @bind-value="BarCode" 
       placeholder="条码" />


@if (ShowScanBarcode)
{

    <BarcodeReader ScanResult="((e) => { BarCode=e; ShowScanBarcode = !ShowScanBarcode; })"
                   ShowScanBarcode="ShowScanBarcode"
                   Close="(()=>ShowScanBarcode=!ShowScanBarcode)" />

}



## 项目截图
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif)


## 参与贡献

1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request 
