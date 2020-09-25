# ZXing Blazor Component

English | <a href="README.zh-CN.md">中文</a>

---

## Introduction
This project is a Blazor component library packaged with ZXing

## Demo  
https://zxingblazor.app1.es

## Nuget 包安装
https://www.nuget.org/packages/ZXingBlazor/

## Step
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


## Screenshot
![ZXingBlazor](https://user-images.githubusercontent.com/8428709/94275844-c28cf500-ff47-11ea-9c65-2370752d2b5b.gif) 


## Participate in contribution

1. Fork this project
2. Create new Feat_xxx branch
3. Submit the code
4. New Pull Request
